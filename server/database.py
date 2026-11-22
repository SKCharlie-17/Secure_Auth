
import os

from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DATABASE_NAME = os.getenv("DATABASE_NAME", "SmartAuth")

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)

db = client[DATABASE_NAME]

users_collection = db["users"]
credentials_collection = db["credentials"]
face_collection = db["face_data"]
auth_logs_collection = db["auth_logs"]
security_alerts_collection = db["security_alerts"]
trusted_devices_collection = db["trusted_devices"]


def initialize_database():
    client.admin.command("ping")

    users_collection.create_index("username", unique=True)
    users_collection.create_index("email", unique=True)

    credentials_collection.create_index(
        "credential_hash",
        unique=True
    )

    print("MongoDB connected successfully!")


if __name__ == "__main__":
    initialize_database()
