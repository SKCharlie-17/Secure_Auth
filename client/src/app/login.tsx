
import React, { useState } from 'react';

import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Pressable,
    SafeAreaView,
    Alert,
    ActivityIndicator,
} from 'react-native';

import { useRouter } from 'expo-router';

import { identifyUser } from '../services/api';

export default function Login() {

    const router = useRouter();

    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {

        if (!username.trim()) {
            Alert.alert('Error', 'Please enter your username or email.');
            return;
        }

        try {
            setLoading(true);

            const result = await identifyUser(username.trim());

            router.push({
                pathname: '/faceverify',
                params: {
                    userId: String(result.userId),
                    username: result.username,
                },
            });

        } catch (error: any) {

            Alert.alert(
                'Identification Failed',
                error.message || 'Could not identify your account.'
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>

                <Text style={styles.logo}>SecureAuth</Text>

                <Text style={styles.heading}>Welcome Back</Text>

                <Text style={styles.subtitle}>
                    Identify yourself to continue with face verification.
                </Text>

                <Text style={styles.label}>Username / Email</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Enter username or email"
                    placeholderTextColor="#64748b"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                />

                <Pressable
                    style={styles.loginButton}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.buttonText}>
                            Continue
                        </Text>
                    )}
                </Pressable>

                <View style={styles.registerContainer}>
                    <Text style={styles.registerText}>
                        Don't have an account?{' '}
                    </Text>

                    <Pressable
                        onPress={() => router.push('/register')}
                        disabled={loading}
                    >
                        <Text style={styles.registerLink}>
                            Register
                        </Text>
                    </Pressable>
                </View>

                <Pressable
                    onPress={() => router.back()}
                    disabled={loading}
                >
                    <Text style={styles.backText}>
                        Back to Home
                    </Text>
                </Pressable>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },

    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 28,
    },

    logo: {
        color: '#6366f1',
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 45,
    },

    heading: {
        color: '#ffffff',
        fontSize: 28,
        fontWeight: 'bold',
    },

    subtitle: {
        color: '#94a3b8',
        fontSize: 14,
        marginTop: 8,
        marginBottom: 35,
    },

    label: {
        color: '#e2e8f0',
        fontSize: 14,
        marginBottom: 9,
        fontWeight: '600',
    },

    input: {
        backgroundColor: '#1e293b',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 10,
        padding: 15,
        color: '#ffffff',
        marginBottom: 23,
    },

    loginButton: {
        backgroundColor: '#4f46e5',
        padding: 17,
        borderRadius: 10,
        alignItems: 'center',
    },

    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },

    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 28,
    },

    registerText: {
        color: '#94a3b8',
    },

    registerLink: {
        color: '#818cf8',
        fontWeight: 'bold',
    },

    backText: {
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: 25,
    },

});
