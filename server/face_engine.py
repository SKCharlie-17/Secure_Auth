
import cv2
from pathlib import Path

# Get models directory
BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"

# Model paths
DETECTOR_MODEL = MODEL_DIR / "face_detection_yunet_2023mar.onnx"
RECOGNIZER_MODEL = MODEL_DIR / "face_recognition_sface_2021dec.onnx"

# Load YuNet detector
face_detector = cv2.FaceDetectorYN.create(
    str(DETECTOR_MODEL),
    "",
    (640, 480),
    0.7,
    0.3,
    5000
)

# Load SFace recognizer
face_recognizer = cv2.FaceRecognizerSF.create(
    str(RECOGNIZER_MODEL),
    ""
)


def extract_face_embedding(image_path):

    # Read photograph
    image = cv2.imread(str(image_path))

    if image is None:
        raise ValueError("Could not read the uploaded image")

    print("Original image dimensions:", image.shape)

    # Resize image for detection
    resized_image = cv2.resize(image, (640, 480))

    face_detector.setInputSize((640, 480))

    # Detect face
    _, faces = face_detector.detect(resized_image)

    print("Detection result:", faces)

    if faces is None or len(faces) == 0:
        raise ValueError("No face detected. Please try again.")

    if len(faces) > 1:
        raise ValueError("Multiple faces detected. Only one person is allowed.")

    # Align face using the same resized image used for detection
    aligned_face = face_recognizer.alignCrop(resized_image, faces[0])

    # Extract numerical features
    embedding = face_recognizer.feature(aligned_face)

    # Convert to Python list
    return embedding.flatten().astype(float).tolist()


print("YuNet face detector loaded successfully!")
print("SFace face recognizer loaded successfully!")
