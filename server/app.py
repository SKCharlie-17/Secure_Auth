
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import os
import uuid
import bcrypt
import secrets
import hashlib

from bson import ObjectId
from werkzeug.utils import secure_filename
from pymongo.errors import DuplicateKeyError
from datetime import datetime, timezone

from face_engine import extract_face_embedding

from database import (
    initialize_database,
    users_collection,
    credentials_collection,
    face_collection,
    auth_logs_collection
)


app = Flask(__name__)
CORS(app)


# Initialize MongoDB
initialize_database()


# HOME ROUTE
@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "message": "SmartAuth API is running"
    })


# USER REGISTRATION
@app.route("/api/register", methods=["POST"])
def register():

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "Invalid JSON request"
        }), 400

    full_name = data.get("fullName", "").strip()
    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not full_name or not username or not email:
        return jsonify({
            "error": "Name, username and email are required"
        }), 400

    if not isinstance(password, str):
        return jsonify({
            "error": "Invalid password"
        }), 400

    if password and len(password) < 8:
        return jsonify({
            "error": "Password must contain at least 8 characters"
        }), 400

    # Hash password if provided
    password_hash = None

    if password:
        password_hash = bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

    # Generate QR credential
    token = secrets.token_urlsafe(32)

    token_hash = hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()

    user = {
        "full_name": full_name,
        "username": username,
        "email": email,
        "password_hash": password_hash,
        "face_failed_attempts": 0,
        "created_at": datetime.now(timezone.utc)
    }

    try:

        result = users_collection.insert_one(user)

        credentials_collection.insert_one({
            "user_id": result.inserted_id,
            "credential_hash": token_hash,
            "status": "active",
            "created_at": datetime.now(timezone.utc)
        })

        return jsonify({
            "message": "Registration successful",
            "userId": str(result.inserted_id),
            "credentialToken": token
        }), 201

    except DuplicateKeyError:

        return jsonify({
            "error": "Username or email already exists"
        }), 409

    except Exception as e:

        print("Registration error:", e)

        return jsonify({
            "error": "Registration failed"
        }), 500


# USER IDENTIFICATION
@app.route("/api/auth/identify", methods=["POST"])
def identify_user():

    data = request.get_json(silent=True)

    if not data or not data.get("identifier"):
        return jsonify({
            "error": "Username or email is required"
        }), 400

    identifier = data["identifier"].strip()

    if not identifier:
        return jsonify({
            "error": "Username or email is required"
        }), 400

    user = users_collection.find_one({
        "$or": [
            {"username": identifier},
            {"email": identifier.lower()}
        ]
    })

    if not user:
        return jsonify({
            "error": "No account found with this username or email"
        }), 404

    return jsonify({
        "message": "Account identified successfully",
        "identified": True,
        "userId": str(user["_id"]),
        "username": user["username"]
    }), 200


# QR IDENTIFICATION
@app.route("/api/auth/qr", methods=["POST"])
def authenticate_qr():

    data = request.get_json(silent=True)

    if not data or not data.get("token"):
        return jsonify({
            "error": "QR credential is required"
        }), 400

    token = data["token"]

    token_hash = hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()

    credential = credentials_collection.find_one({
        "credential_hash": token_hash,
        "status": "active"
    })

    if not credential:
        return jsonify({
            "error": "Invalid or revoked QR credential"
        }), 401

    user = users_collection.find_one({
        "_id": credential["user_id"]
    })

    if not user:
        return jsonify({
            "error": "User account not found"
        }), 404

    auth_logs_collection.insert_one({
        "user_id": user["_id"],
        "method": "QR",
        "status": "identified",
        "timestamp": datetime.now(timezone.utc)
    })

    return jsonify({
        "message": "QR credential recognized",
        "identified": True,
        "userId": str(user["_id"]),
        "username": user["username"]
    }), 200


# FACE ENROLLMENT
@app.route("/api/face/enroll", methods=["POST"])
def enroll_face():

    user_id = request.form.get("userId")
    image = request.files.get("image")

    if not user_id or not image:
        return jsonify({
            "error": "User ID and face image are required"
        }), 400

    # Convert string ID into MongoDB ObjectId
    try:
        mongo_user_id = ObjectId(user_id)
    except Exception:
        mongo_user_id = user_id

    # Find user
    user = users_collection.find_one({
        "_id": mongo_user_id
    })

    if not user:
        return jsonify({
            "error": "User account not found"
        }), 404

    # Validate image extension
    allowed_extensions = {"jpg", "jpeg", "png"}

    filename = secure_filename(image.filename or "")

    extension = (
        filename.rsplit(".", 1)[-1].lower()
        if "." in filename else ""
    )

    if extension not in allowed_extensions:
        return jsonify({
            "error": "Only JPG, JPEG and PNG images are allowed"
        }), 400

    # Temporary image storage
    temp_dir = os.path.join(
        os.path.dirname(__file__),
        "temp_faces"
    )

    os.makedirs(temp_dir, exist_ok=True)

    temp_path = os.path.join(
        temp_dir,
        f"{uuid.uuid4().hex}.{extension}"
    )

    try:

        image.save(temp_path)

        # Extract face embedding using YuNet + SFace
        embedding = extract_face_embedding(temp_path)

        # Store embedding in MongoDB
        face_collection.update_one(
            {
                "user_id": user["_id"]
            },
            {
                "$set": {
                    "user_id": user["_id"],
                    "embedding": embedding,
                    "status": "active",
                    "model": "OpenCV SFace",
                    "updated_at": datetime.now(timezone.utc)
                }
            },
            upsert=True
        )

        # Reset failed attempts after re-enrollment
        users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"face_failed_attempts": 0}}
        )

        return jsonify({
            "message": "Face enrollment successful",
            "enrolled": True
        }), 200

    except ValueError as error:

        return jsonify({
            "error": str(error)
        }), 400

    except Exception as error:

        print("Face enrollment error:", error)

        return jsonify({
            "error": "Face enrollment failed"
        }), 500

    finally:

        if os.path.exists(temp_path):
            os.remove(temp_path)


# FACE AUTHENTICATION
@app.route("/api/auth/face", methods=["POST"])
def authenticate_face():

    user_id = request.form.get("userId")
    image = request.files.get("image")

    if not user_id or not image:
        return jsonify({
            "error": "User ID and face image are required"
        }), 400

    # Validate user ID
    try:
        mongo_user_id = ObjectId(user_id)
    except Exception:
        return jsonify({
            "error": "Invalid user ID"
        }), 400

    # Find user
    user = users_collection.find_one({
        "_id": mongo_user_id
    })

    if not user:
        return jsonify({
            "error": "User account not found"
        }), 404

    # Find enrolled face
    stored_face = face_collection.find_one({
        "user_id": user["_id"],
        "status": "active"
    })

    if not stored_face:
        return jsonify({
            "error": "Face enrollment not found"
        }), 404

    # Validate image
    allowed_extensions = {"jpg", "jpeg", "png"}

    filename = secure_filename(image.filename or "")

    extension = (
        filename.rsplit(".", 1)[-1].lower()
        if "." in filename else ""
    )

    if extension not in allowed_extensions:
        return jsonify({
            "error": "Only JPG, JPEG and PNG images are allowed"
        }), 400

    # Temporary image storage
    temp_dir = os.path.join(
        os.path.dirname(__file__),
        "temp_faces"
    )

    os.makedirs(temp_dir, exist_ok=True)

    temp_path = os.path.join(
        temp_dir,
        f"{uuid.uuid4().hex}.{extension}"
    )

    try:

        image.save(temp_path)

        # Extract captured face embedding
        captured_embedding = extract_face_embedding(temp_path)

        # Retrieve enrolled embedding
        enrolled_embedding = stored_face["embedding"]

        captured = np.array(
            captured_embedding,
            dtype=np.float32
        )

        enrolled = np.array(
            enrolled_embedding,
            dtype=np.float32
        )

        # Validate embedding dimensions
        if captured.shape != enrolled.shape:
            raise ValueError("Face embedding dimensions do not match")

        # Calculate cosine similarity
        denominator = (
            np.linalg.norm(captured) *
            np.linalg.norm(enrolled)
        )

        if denominator == 0:
            raise ValueError("Invalid face embedding")

        similarity = float(
            np.dot(captured, enrolled) / denominator
        )

        # Initial experimental threshold
        threshold = 0.363

        # FACE MATCH SUCCESS
        if similarity >= threshold:

            # Reset failed attempts
            users_collection.update_one(
                {"_id": user["_id"]},
                {"$set": {"face_failed_attempts": 0}}
            )

            auth_logs_collection.insert_one({
                "user_id": user["_id"],
                "method": "face",
                "status": "success",
                "similarity": similarity,
                "timestamp": datetime.now(timezone.utc)
            })

            return jsonify({
                "authenticated": True,
                "message": "Face verification successful",
                "username": user["username"],
                "similarity": similarity
            }), 200

        # FACE MATCH FAILURE
        auth_logs_collection.insert_one({
            "user_id": user["_id"],
            "method": "face",
            "status": "failed",
            "similarity": similarity,
            "timestamp": datetime.now(timezone.utc)
        })

        # Increment failed attempts
        users_collection.update_one(
            {"_id": user["_id"]},
            {"$inc": {"face_failed_attempts": 1}}
        )

        # Retrieve updated attempt count
        updated_user = users_collection.find_one(
            {"_id": user["_id"]}
        )

        failed_attempts = updated_user.get(
            "face_failed_attempts", 0
        )

        fallback_available = failed_attempts >= 3

        return jsonify({
            "authenticated": False,
            "message": "Face verification failed",
            "similarity": similarity,
            "failedAttempts": failed_attempts,
            "attemptsRemaining": max(0, 3 - failed_attempts),
            "fallbackAvailable": fallback_available,
            "passwordAvailable": bool(user.get("password_hash"))
        }), 401

    except ValueError as error:

        return jsonify({
            "error": str(error)
        }), 400

    except Exception as error:

        print("Face authentication error:", error)

        return jsonify({
            "error": "Face authentication failed"
        }), 500

    finally:

        if os.path.exists(temp_path):
            os.remove(temp_path)



# PASSWORD FALLBACK AUTHENTICATION
@app.route("/api/auth/password-fallback", methods=["POST"])
def password_fallback():

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "Invalid request"
        }), 400

    user_id = data.get("userId")
    password = data.get("password")

    if not user_id or not password:
        return jsonify({
            "error": "User ID and password are required"
        }), 400

    # Validate user ID
    try:
        mongo_user_id = ObjectId(user_id)
    except Exception:
        return jsonify({
            "error": "Invalid user ID"
        }), 400

    # Find user
    user = users_collection.find_one({
        "_id": mongo_user_id
    })

    if not user:
        return jsonify({
            "error": "User account not found"
        }), 404

    # Check whether three face attempts have failed
    failed_attempts = user.get(
        "face_failed_attempts", 0
    )

    if failed_attempts < 3:
        return jsonify({
            "error": "Password fallback is available only after three failed face attempts"
        }), 403

    # Check whether user registered a password
    password_hash = user.get("password_hash")

    if not password_hash:
        return jsonify({
            "error": "Password fallback is not available for this account"
        }), 403

    # Check password fallback failure count
    password_failures = user.get(
        "password_fallback_failures", 0
    )

    if password_failures >= 5:
        return jsonify({
            "error": "Password fallback is temporarily locked. Please contact support."
        }), 403

    # Verify password
    try:
        password_matches = bcrypt.checkpw(
            password.encode("utf-8"),
            password_hash.encode("utf-8")
        )
    except Exception:
        print("Stored password hash could not be verified")
        return jsonify({
            "error": "Password verification failed"
        }), 500

    # Incorrect password
    if not password_matches:

        users_collection.update_one(
            {"_id": user["_id"]},
            {"$inc": {"password_fallback_failures": 1}}
        )

        auth_logs_collection.insert_one({
            "user_id": user["_id"],
            "method": "password_fallback",
            "status": "failed",
            "timestamp": datetime.now(timezone.utc)
        })

        updated_user = users_collection.find_one(
            {"_id": user["_id"]},
            {"password_fallback_failures": 1}
        )

        remaining = max(
            0,
            5 - updated_user.get("password_fallback_failures", 0)
        )

        return jsonify({
            "authenticated": False,
            "message": "Incorrect password",
            "attemptsRemaining": remaining
        }), 401

    # Correct password
    users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "face_failed_attempts": 0,
                "password_fallback_failures": 0
            }
        }
    )

    auth_logs_collection.insert_one({
        "user_id": user["_id"],
        "method": "password_fallback",
        "status": "success",
        "timestamp": datetime.now(timezone.utc)
    })

    return jsonify({
        "authenticated": True,
        "message": "Password fallback successful",
        "username": user["username"]
    }), 200



# RUN SERVER
if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
