
import React, { useState } from 'react';
import { useRouter } from 'expo-router';

import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { registerUser } from '../services/api';

export default function Register() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !username.trim() || !email.trim() || !password) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Enter a valid email address.');
      return;
    }

    if (password && password.length < 8) {
      Alert.alert('Error', 'Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      const result = await registerUser({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      router.replace({
        pathname: '/cred',
        params: {
          token: result.credentialToken,
          username: username.trim(),
          userId: String(result.userId),
        },
      });

      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully!'
      );

      console.log('Registered User ID:', result.userId);

    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error.message || 'Unable to connect to server.'
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <Text style={styles.logo}>SecureAuth</Text>

        <Text style={styles.heading}>Create Account</Text>

        <Text style={styles.subtitle}>
          Set up your secure authentication profile.
        </Text>

        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          placeholderTextColor="#64748b"
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>Username *</Text>
        <TextInput
          style={styles.input}
          placeholder="Choose a username"
          placeholderTextColor="#64748b"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Email Address *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#64748b"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password *</Text>
        <TextInput
          style={styles.input}
          placeholder="Create a password"
          placeholderTextColor="#64748b"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {password.length > 0 && (
          <>
            <Text style={styles.label}>Confirm Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor="#64748b"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </>
        )}

        <Text style={styles.note}>
          You can use facial authentication as your primary
          authentication method instead of setting a password.
        </Text>

        <Pressable
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>
              Continue Registration
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.backText}>
            Back to Home
          </Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 28,
  },

  logo: {
    color: '#6366f1',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 35,
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
    marginBottom: 30,
  },

  label: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 9,
  },

  input: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    padding: 15,
    color: '#ffffff',
    marginBottom: 20,
  },

  note: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 19,
    marginBottom: 25,
  },

  registerButton: {
    backgroundColor: '#4f46e5',
    padding: 17,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  backText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 25,
  },
});
