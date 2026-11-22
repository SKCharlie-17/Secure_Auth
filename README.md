# SecureAuth 🔐

**A Multi-Layer Authentication System Using Face Recognition, QR Credentials, and Password Verification.**

SecureAuth is an authentication system designed to provide a flexible and secure user verification experience through multiple authentication mechanisms. It combines facial recognition, QR-based digital identity credentials, and password fallback into a unified authentication workflow.

The project explores how computer vision, backend development, database management, and mobile application development can work together to build a modern authentication system.

## ✨ Features

- **User Registration:** Register users with their personal details and credentials.
- **Face Enrollment:** Capture and register facial features for future verification.
- **Face Recognition:** Identify and verify users using facial embeddings.
- **QR Digital Identity:** Generate QR credentials that can be verified and revoked.
- **Password Fallback:** Allow password verification when facial authentication fails.
- **Failed Attempt Tracking:** Track unsuccessful password attempts and temporarily lock authentication after repeated failures.
- **Database Integration:** Store user information, authentication records, and related data using MongoDB.
- **REST API:** Connect the mobile application with backend authentication services.

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Mobile Frontend | React Native, TypeScript, Expo |
| Backend | Python, Flask |
| Database | MongoDB |
| Computer Vision | OpenCV, YuNet, SFace |
| Numerical Processing | NumPy |
| Password Security | Bcrypt |
| QR Credentials | Python QR generation libraries |
| API Communication | REST APIs, Fetch |

## 🏗️ System Architecture

SecureAuth follows a client-server architecture.

```text
          React Native Application
                    |
                    |
               REST API
                    |
                    |
              Flask Backend
                    |
          +---------+---------+
          |         |         |
       Face       QR       Password
   Recognition  Manager     Fallback
          |         |         |
          +---------+---------+
                    |
                 MongoDB
```

### Authentication Workflow

1. A user registers with their account details.
2. The system enrolls the user's facial features.
3. During login, the user is identified through their account information.
4. The system attempts facial verification.
5. If facial verification fails repeatedly, password fallback becomes available.
6. QR credentials can also be generated, verified, and revoked.

## 🧠 Computer Vision

SecureAuth uses two OpenCV deep-learning models:

- **YuNet:** Face detection.
- **SFace:** Face feature extraction and recognition.

The extracted facial embeddings are used for similarity-based face verification.

## 🔒 Security Mechanisms

- Password hashing using Bcrypt.
- Facial verification using similarity comparison.
- Failed-attempt tracking.
- Temporary authentication lockout.
- QR credential verification and revocation.
- Authorization checks for sensitive operations.

**Note:** This project is a development and learning implementation. It has not undergone an independent security audit and should not be considered production-certified.

## 🚀 Project Goals

- Explore practical implementation of biometric authentication.
- Understand integration between mobile applications and Python backends.
- Implement multiple authentication mechanisms in one system.
- Learn API design, database integration, and authentication workflows.
- Experiment with computer vision in real-world application development.

## 📌 Project Status

SecureAuth is an actively developed project. Its core authentication mechanisms and backend integration have been implemented and tested.

Future improvements may include additional security hardening, improved biometric verification, and broader integration capabilities.

## 👨‍💻 Author

**Suryansh Kashav**

Developed as a project exploring Python backend development, computer vision, and multi-layer authentication systems.
