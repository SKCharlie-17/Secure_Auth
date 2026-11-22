
import cv2
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"

DETECTOR_MODEL = MODEL_DIR / "face_detection_yunet_2023mar.onnx"
RECOGNIZER_MODEL = MODEL_DIR / "face_recognition_sface_2021dec.onnx"

# Load YuNet
face_detector = cv2.FaceDetectorYN.create(
    str(DETECTOR_MODEL), "", (320, 320), 0.9, 0.3, 5000
)

# Load SFace
face_recognizer = cv2.FaceRecognizerSF.create(
    str(RECOGNIZER_MODEL), ""
)


def extract_face_embedding(image_path):

    # Read the captured image
    image = cv2.imread(str(image_path))

    if image is None:
        raise ValueError("Could not read the uploaded image")

    # Update detector with actual image dimensions
    height, width = image.shape[:2]

    face_detector.setInputSize((width, height))

    # Detect faces
    _, faces = face_detector.detect(image)

    if faces is None or len(faces) == 0:
        raise ValueError("No face detected. Please try again.")

    if len(faces) > 1:
        raise ValueError("Multiple faces detected. Only one person is allowed.")

    # Align the detected face
    aligned_face = face_recognizer.alignCrop(image, faces[0])

    # Generate numerical face embedding
    embedding = face_recognizer.feature(aligned_face)

    # Convert embedding into a normal Python list
    embedding = embedding.flatten().astype(float).tolist()

    return embedding
