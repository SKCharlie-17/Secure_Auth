import { File } from 'expo-file-system';
const BASE_URL = 'http://ipv4address:5000';

// USER REGISTRATION
export async function registerUser(userData: {
  fullName: string;
  username: string;
  email: string;
  password: string;
}) {
  const response = await fetch(`${BASE_URL}/api/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Registration failed');
  }

  return result;
}


// USER IDENTIFICATION
export async function identifyUser(identifier: string) {

  const response = await fetch(`${BASE_URL}/api/auth/identify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ identifier }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Account identification failed');
  }

  return result;
}

// QR IDENTIFICATION
export async function authenticateQR(token: string) {
  const response = await fetch(`${BASE_URL}/api/auth/qr`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'QR identification failed');
  }

  return result;
}


// FACE ENROLLMENT
export async function enrollFace(userId: string, imageUri: string) {

  const formData = new FormData();

  const photoFile = new File(imageUri);

  formData.append('userId', userId);
  formData.append('image', photoFile, 'face.jpg');

  const response = await fetch(`${BASE_URL}/api/face/enroll`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Face enrollment failed');
  }

  return result;
}


// FACE AUTHENTICATION
export async function authenticateFace(
  userId: string,
  imageUri: string
) {

  const formData = new FormData();

  const photoFile = new File(imageUri);

  formData.append('userId', userId);
  formData.append('image', photoFile, 'face.jpg');

  const response = await fetch(`${BASE_URL}/api/auth/face`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok && response.status !== 401) {
    throw new Error(
      result.message || result.error || 'Face authentication failed'
    );
  }

  return result;
}

export async function authenticatePasswordFallback(
    userId: string,
    password: string
) {
    const response = await fetch(
        `${BASE_URL}/api/auth/password-fallback`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                password,
            }),
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.error || result.message || 'Password verification failed'
        );
    }

    return result;
}
