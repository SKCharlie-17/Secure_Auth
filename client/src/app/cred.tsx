
import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';

import { useLocalSearchParams, router } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';

export default function CredentialScreen() {
  const { token, username, userId } = useLocalSearchParams<{
    token: string;
    username: string;
    userId: string;
  }>();

  const credentialToken = Array.isArray(token) ? token[0] : token;
  const userName = Array.isArray(username) ? username[0] : username;
  const accountId = Array.isArray(userId) ? userId[0] : userId;

  if (!credentialToken) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Credential Unavailable</Text>

        <Text style={styles.subtitle}>
          No credential token was received. Please register again.
        </Text>

        <Text
          style={styles.back}
          onPress={() => router.replace('/register')}
        >
          Register Again
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.success}>
        Registration Successful!
      </Text>

      <Text style={styles.title}>
        Your SecureAuth ID
      </Text>

      <Text style={styles.subtitle}>
        Your digital authentication credential is ready.
      </Text>

      {/* Digital ID Card */}
      <View style={styles.card}>
        <Text style={styles.brand}>
          SecureAuth
        </Text>

        <Text style={styles.cardSubtitle}>
          DIGITAL IDENTITY CARD
        </Text>

        <View style={styles.divider} />

        <Text style={styles.label}>
          USERNAME
        </Text>

        <Text style={styles.username}>
          {userName || 'User'}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.label}>
          YOUR QR CREDENTIAL
        </Text>

        <View style={styles.qrContainer}>
          <QRCode
            value={credentialToken}
            size={190}
            backgroundColor="white"
            color="black"
          />
        </View>

        <Text style={styles.qrNote}>
          Your unique authentication credential
        </Text>

        <View style={styles.divider} />

        <Text style={styles.footer}>
          SecureAuth DIGITAL ID
        </Text>
      </View>

      <Text style={styles.note}>
        Keep your QR credential private. Anyone who obtains
        it may be able to use it.
      </Text>

      {/* Face Enrollment Button */}
      <Pressable
        style={styles.faceButton}
        onPress={() => {
          if (!accountId) {
            alert('User ID is missing. Please register again.');
            return;
          }

          router.push({
            pathname: '/faceauth',
            params: {
              userId: accountId,
              username: userName || '',
              token: credentialToken,
            },
          });
        }}
      >
        <Text style={styles.buttonText}>
          Set Up Face Authentication
        </Text>
      </Pressable>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  success: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  title: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },

  subtitle: {
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 25,
  },

  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },

  brand: {
    color: '#2563eb',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 3,
  },

  cardSubtitle: {
    color: '#64748b',
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 6,
  },

  label: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
  },

  username: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
  },

  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 22,
  },

  qrContainer: {
    padding: 15,
    backgroundColor: '#ffffff',
    marginTop: 15,
    borderRadius: 12,
  },

  qrNote: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 15,
    textAlign: 'center',
  },

  footer: {
    color: '#64748b',
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: 'bold',
  },

  note: {
    color: '#fbbf24',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 12,
    lineHeight: 18,
  },

  faceButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    marginTop: 15,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  back: {
    color: '#60a5fa',
    fontSize: 16,
    marginTop: 25,
    fontWeight: 'bold',
  },
});
