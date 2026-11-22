
import React, { useRef, useState } from 'react';

import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ActivityIndicator,
    Image,
    Alert,
    TextInput,
} from 'react-native';

import {
    CameraView,
    useCameraPermissions,
} from 'expo-camera';

import { useLocalSearchParams, router } from 'expo-router';

import {
    authenticateFace,
    authenticatePasswordFallback,
} from '../services/api';

export default function FaceVerify() {

    const { userId, username } = useLocalSearchParams<{
        userId: string;
        username: string;
    }>();

    const accountId = Array.isArray(userId) ? userId[0] : userId;
    const userName = Array.isArray(username) ? username[0] : username;

    const [permission, requestPermission] = useCameraPermissions();

    const cameraRef = useRef<CameraView | null>(null);

    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [verified, setVerified] = useState(false);

    // Password fallback states
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [fallbackAvailable, setFallbackAvailable] = useState(false);
    const [passwordAvailable, setPasswordAvailable] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordLocked, setPasswordLocked] = useState(false);

    // Capture fresh photograph
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

    // Verify captured face
    const verifyFace = async () => {

        if (!photoUri || !accountId) {
            Alert.alert('Error', 'Photograph or account information is missing.');
            return;
        }

        try {
            setLoading(true);

            const result = await authenticateFace(accountId, photoUri);

            if (result.authenticated) {

                setVerified(true);

                Alert.alert(
                    'Access Granted',
                    result.message || 'Face verification successful!',
                    [
                        {
                            text: 'Continue',
                            onPress: () => {
                                router.replace('/');
                            },
                        },
                    ]
                );

            } else {

                const attempts = result.failedAttempts ?? failedAttempts + 1;

                setFailedAttempts(attempts);
                setFallbackAvailable(result.fallbackAvailable ?? attempts >= 3);
                setPasswordAvailable(result.passwordAvailable ?? false);

                setPhotoUri(null);

                if (attempts >= 3) {

                    if (result.passwordAvailable) {
                        Alert.alert(
                            'Face Verification Failed',
                            'You have reached three failed attempts. You can now use your registered password.'
                        );
                    } else {
                        Alert.alert(
                            'Face Verification Failed',
                            'You have reached three failed attempts. Password fallback is unavailable because no password was registered.'
                        );
                    }

                } else {

                    Alert.alert(
                        'Verification Failed',
                        `Your face did not match.\n\nAttempts: ${attempts}/3\nRemaining: ${3 - attempts}`
                    );
                }
            }

        } catch (error: any) {

            Alert.alert(
                'Verification Error',
                error.message || 'Could not verify your face.'
            );

        } finally {
            setLoading(false);
        }
    };

    // Password fallback authentication
    const verifyPassword = async () => {

        if (!password.trim()) {
            Alert.alert('Password Required', 'Please enter your password.');
            return;
        }

        if (!accountId) {
            Alert.alert('Error', 'Account information is missing.');
            return;
        }

        try {
            setLoading(true);

            const result = await authenticatePasswordFallback(
                accountId,
                password
            );

            if (result.authenticated) {

                setVerified(true);
                setPassword('');

                Alert.alert(
                    'Access Granted',
                    'Password fallback successful!',
                    [
                        {
                            text: 'Continue',
                            onPress: () => {
                                router.replace('/');
                            },
                        },
                    ]
                );
            }

        } catch (error: any) {

            const message = error.message || 'Password verification failed.';

            if (message.toLowerCase().includes('locked')) {
                setPasswordLocked(true);
            }

            Alert.alert('Password Verification Failed', message);
            setPassword('');

        } finally {
            setLoading(false);
        }
    };

    // Account validation
    if (!accountId) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Account Information Missing</Text>

                <Text style={styles.subtitle}>
                    Your account ID is missing. Please identify your account again.
                </Text>

                <Pressable
                    style={styles.button}
                    onPress={() => router.replace('/')}
                >
                    <Text style={styles.buttonText}>Return to Home</Text>
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
                <Text style={styles.title}>Face Verification</Text>

                <Text style={styles.subtitle}>
                    SecureAuth needs camera permission to verify your identity.
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
                {fallbackAvailable ? 'Password Fallback' : 'Face Verification'}
            </Text>

            <Text style={styles.subtitle}>
                Verifying identity for: {userName || 'User'}
            </Text>

            {/* FACE VERIFICATION */}

            {!fallbackAvailable && (

                <>
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

                    <Text style={styles.attemptText}>
                        Failed attempts: {failedAttempts}/3
                    </Text>

                    {!verified && (
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

                    {photoUri && !verified && (
                        <Pressable
                            style={styles.verifyButton}
                            onPress={verifyFace}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <Text style={styles.buttonText}>
                                    Verify Identity
                                </Text>
                            )}
                        </Pressable>
                    )}
                </>
            )}

            {/* PASSWORD FALLBACK */}

            {fallbackAvailable && (

                <View style={styles.passwordContainer}>

                    {passwordAvailable ? (
                        <>
                            <Text style={styles.fallbackTitle}>
                                Face verification limit reached
                            </Text>

                            <Text style={styles.subtitle}>
                                Enter your registered password to continue.
                            </Text>

                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Enter your password"
                                placeholderTextColor="#94a3b8"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                                editable={!loading && !passwordLocked}
                            />

                            <Pressable
                                style={[
                                    styles.verifyButton,
                                    passwordLocked && styles.disabledButton
                                ]}
                                onPress={verifyPassword}
                                disabled={loading || passwordLocked}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#ffffff" />
                                ) : (
                                    <Text style={styles.buttonText}>
                                        Verify Password
                                    </Text>
                                )}
                            </Pressable>

                            {passwordLocked && (
                                <Text style={styles.errorText}>
                                    Password fallback is locked. Please contact support.
                                </Text>
                            )}
                        </>
                    ) : (
                        <>
                            <Text style={styles.fallbackTitle}>
                                Password Fallback Unavailable
                            </Text>

                            <Text style={styles.subtitle}>
                                You did not register a password for this account.
                                Please contact support for account recovery.
                            </Text>
                        </>
                    )}

                </View>
            )}

            <Pressable
                onPress={() => router.back()}
                style={styles.backButton}
                disabled={loading}
            >
                <Text style={styles.backText}>
                    Back
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

    verifyButton: {
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

    attemptText: {
        color: '#fbbf24',
        marginTop: 18,
        fontSize: 14,
        fontWeight: '600',
    },

    passwordContainer: {
        width: '100%',
        maxWidth: 350,
        alignItems: 'center',
    },

    fallbackTitle: {
        color: '#fbbf24',
        fontSize: 19,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },

    passwordInput: {
        width: '100%',
        backgroundColor: '#1e293b',
        borderWidth: 1,
        borderColor: '#475569',
        borderRadius: 12,
        padding: 15,
        color: '#ffffff',
        fontSize: 16,
    },

    disabledButton: {
        backgroundColor: '#475569',
    },

    errorText: {
        color: '#f87171',
        textAlign: 'center',
        marginTop: 15,
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
