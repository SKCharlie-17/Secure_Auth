
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Alert,
    ActivityIndicator,
} from 'react-native';

import {
    CameraView,
    useCameraPermissions,
} from 'expo-camera';

import { useRouter } from 'expo-router';
import { authenticateQR } from '../services/api';

export default function ScanQR() {
    const router = useRouter();

    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleQRScan = async ({ data }: { data: string }) => {
        if (scanned || loading) return;

        setScanned(true);
        setLoading(true);

        try {
            const result = await authenticateQR(data);

            if (!result.userId) {
                throw new Error('Account identification failed. User ID missing.');
            }

            Alert.alert(
                'QR Recognized',
                `Account identified: ${result.username}\n\nProceeding to face verification.`,
                [
                    {
                        text: 'Continue',
                        onPress: () => {
                            router.replace({
                                pathname: '/faceverify',
                                params: {
                                    userId: String(result.userId),
                                    username: result.username,
                                },
                            });
                        },
                    },
                ]
            );

        } catch (error: any) {
            Alert.alert(
                'QR Identification Failed',
                error.message || 'Invalid QR credential.',
                [
                    {
                        text: 'Try Again',
                        onPress: () => setScanned(false),
                    },
                    {
                        text: 'Go Back',
                        onPress: () => router.back(),
                    },
                ]
            );

        } finally {
            setLoading(false);
        }
    };

    if (!permission) {
        return (
            <View style={styles.container}>
                <ActivityIndicator color="#ffffff" />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Camera Permission</Text>

                <Text style={styles.subtitle}>
                    SecureAuth needs camera access to scan your QR credential.
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
            <Text style={styles.title}>Scan Your QR</Text>

            <Text style={styles.subtitle}>
                Position your SecureAuth Digital ID QR code inside the frame.
            </Text>

            <View style={styles.cameraContainer}>
                <CameraView
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                    facing="back"
                    barcodeScannerSettings={{
                        barcodeTypes: ['qr'],
                    }}
                    onBarcodeScanned={
                        scanned ? undefined : handleQRScan
                    }
                />

                <View style={styles.scanFrame} />
            </View>

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#60a5fa" />
                    <Text style={styles.loadingText}>
                        Verifying credential...
                    </Text>
                </View>
            )}

            {!loading && scanned && (
                <Pressable
                    style={styles.button}
                    onPress={() => setScanned(false)}
                >
                    <Text style={styles.buttonText}>Scan Again</Text>
                </Pressable>
            )}

            <Pressable
                onPress={() => router.back()}
                style={styles.backButton}
            >
                <Text style={styles.backText}>Back to Home</Text>
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
    },

    subtitle: {
        color: '#94a3b8',
        textAlign: 'center',
        fontSize: 14,
        marginBottom: 30,
        lineHeight: 21,
    },

    cameraContainer: {
        width: 280,
        height: 280,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#1e293b',
        alignItems: 'center',
        justifyContent: 'center',
    },

    scanFrame: {
        width: 210,
        height: 210,
        borderWidth: 3,
        borderColor: '#3b82f6',
        borderRadius: 18,
        backgroundColor: 'transparent',
    },

    loadingContainer: {
        alignItems: 'center',
        marginTop: 25,
    },

    loadingText: {
        color: '#60a5fa',
        marginTop: 12,
        fontSize: 14,
    },

    button: {
        backgroundColor: '#2563eb',
        paddingVertical: 14,
        paddingHorizontal: 25,
        borderRadius: 12,
        marginTop: 25,
    },

    buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 15,
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


