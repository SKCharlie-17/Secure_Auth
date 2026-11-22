
import React, { useRef, useState } from 'react';

import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ActivityIndicator,
    Image,
    Alert,
} from 'react-native';

import {
    CameraView,
    useCameraPermissions,
} from 'expo-camera';

import { useLocalSearchParams, router } from 'expo-router';

import { enrollFace } from '../services/api';

export default function FaceAuth() {

    const { userId, username, token } = useLocalSearchParams<{
        userId: string;
        username: string;
        token: string;
    }>();

    const accountId = Array.isArray(userId) ? userId[0] : userId;
    const userName = Array.isArray(username) ? username[0] : username;
    const credentialToken = Array.isArray(token) ? token[0] : token;

    const [permission, requestPermission] = useCameraPermissions();

    const cameraRef = useRef<CameraView | null>(null);

    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [enrolled, setEnrolled] = useState(false);

    // Capture photograph
    const captureFace = async () => {
        try {
            setLoading(true);

            const photo = await cameraRef.current?.takePictureAsync({
                quality: 0.7,
            });

            if (photo?.uri) {
                setPhotoUri(photo.uri);
            } else {
                Alert.alert('Error', 'Could not capture your photograph.');
            }

        } catch (error) {
            Alert.alert('Camera Error', 'Something went wrong while capturing.');
            console.log(error);

        } finally {
            setLoading(false);
        }
    };

    // Upload photograph and enroll face
    const submitFace = async () => {

        if (!photoUri || !accountId) {
            Alert.alert('Error', 'Photograph or account information is missing.');
            return;
        }

        try {
            setLoading(true);

            const result = await enrollFace(accountId, photoUri);

            setEnrolled(true);

            Alert.alert(
                'Face Enrollment Successful',
                result.message || 'Your face has been registered successfully.',
                [
                    {
                        text: 'Continue',
                        onPress: () => {
                            router.replace({
                                pathname: '/cred',
                                params: {
                                    token: credentialToken || '',
                                    username: userName || '',
                                    userId: accountId,
                                },
                            });
                        },
                    },
                ]
            );

        } catch (error: any) {

            Alert.alert(
                'Enrollment Failed',
                error.message || 'Could not enroll your face.'
            );

        } finally {
            setLoading(false);
        }
    };

    // Account information validation
    if (!accountId || !credentialToken) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>
                    Account Information Missing
                </Text>

                <Text style={styles.subtitle}>
                    Your account ID or credential token is missing.
                    Please return to your Digital ID.
                </Text>

                <Pressable
                    style={styles.button}
                    onPress={() => router.replace('/register')}
                >
                    <Text style={styles.buttonText}>
                        Return to Registration
                    </Text>
                </Pressable>
            </View>
        );
    }

    // Camera permission loading
    if (!permission) {
        return (
            <View style={styles.container}>
                <ActivityIndicator color="#ffffff" />
            </View>
        );
    }

    // Camera permission request
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Face Enrollment</Text>

                <Text style={styles.subtitle}>
                    SecureAuth needs camera permission to register your face.
                </Text>

                <Pressable
                    style={styles.button}
                    onPress={requestPermission}
                >
                    <Text style={styles.buttonText}>
                        Grant Camera Permission
                    </Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.container}>

            <Text style={styles.title}>
                Face Enrollment
            </Text>

            <Text style={styles.subtitle}>
                Registering face for: {userName || 'User'}
            </Text>

            <View style={styles.cameraContainer}>

                {photoUri ? (
                    <Image
                        source={{ uri: photoUri }}
                        style={styles.camera}
                        resizeMode="cover"
                    />
                ) : (
                    <>
                        <CameraView
                            ref={cameraRef}
                            style={styles.camera}
                            facing="front"
                        />

                        <View style={styles.faceFrame} />
                    </>
                )}

            </View>

            {photoUri && (
                <Text style={styles.success}>
                    Photograph captured successfully!
                </Text>
            )}

            {!enrolled && (
                <Pressable
                    style={styles.button}
                    onPress={photoUri ? () => setPhotoUri(null) : captureFace}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.buttonText}>
                            {photoUri ? 'Retake Photograph' : 'Capture Face'}
                        </Text>
                    )}
                </Pressable>
            )}

            {photoUri && !enrolled && (
                <Pressable
                    style={styles.enrollButton}
                    onPress={submitFace}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.buttonText}>
                            Confirm & Enroll Face
                        </Text>
                    )}
                </Pressable>
            )}

            <Pressable
                onPress={() => router.back()}
                style={styles.backButton}
                disabled={loading}
            >
                <Text style={styles.backText}>
                    Back to Digital ID
                </Text>
            </Pressable>

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#0f172a',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },

    title: {
        color: '#ffffff',
        fontSize: 27,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },

    subtitle: {
        color: '#94a3b8',
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 21,
        marginBottom: 30,
    },

    cameraContainer: {
        width: 280,
        height: 350,
        borderRadius: 25,
        overflow: 'hidden',
        backgroundColor: '#1e293b',
        alignItems: 'center',
        justifyContent: 'center',
    },

    camera: {
        width: '100%',
        height: '100%',
    },

    faceFrame: {
        position: 'absolute',
        width: 190,
        height: 250,
        borderWidth: 3,
        borderColor: '#3b82f6',
        borderRadius: 100,
    },

    button: {
        backgroundColor: '#2563eb',
        paddingVertical: 15,
        paddingHorizontal: 35,
        borderRadius: 12,
        marginTop: 30,
        minWidth: 190,
        alignItems: 'center',
    },

    enrollButton: {
        backgroundColor: '#16a34a',
        paddingVertical: 15,
        paddingHorizontal: 35,
        borderRadius: 12,
        marginTop: 15,
        minWidth: 220,
        alignItems: 'center',
    },

    buttonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: 'bold',
    },

    success: {
        color: '#22c55e',
        marginTop: 20,
        fontWeight: 'bold',
    },

    backButton: {
        marginTop: 25,
        padding: 10,
    },

    backText: {
        color: '#60a5fa',
        fontSize: 15,
    },

});
