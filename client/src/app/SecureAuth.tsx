import { useRouter } from 'expo-router';
import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Alert,
} from 'react-native';

export default function SecureAuth() {

  const router = useRouter();

  const handleLogin = (method: string) => {
    Alert.alert(
      'SecureAuth',
      `${method} authentication will be implemented soon.`
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.logo}>SecureAuth</Text>

        <Text style={styles.tagline}>
          Smart Adaptive Multi-Factor Authentication
        </Text>
      </View>

      <View style={styles.content}>

        <Text style={styles.heading}>
          Welcome
        </Text>

        <Text style={styles.description}>
          Choose your preferred authentication method.
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.buttonText}>
            Username
          </Text>
        </Pressable>

        <Pressable
          style={styles.button}//check here done copilot
          onPress={() => router.push('/scan' as never)}>
          <Text style={styles.buttonText}>
            Scan QR Code
          </Text>
        </Pressable>

        <Pressable style={styles.button} onPress={() => router.push('/register')}>
          <Text style={styles.buttonText}>
            New User?
          </Text>
        </Pressable>
        <Text style={styles.footer}>
          Secure authentication. Smarter access.
        </Text>


      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },

  header: {
    alignItems: 'center',
    marginTop: 65,
  },

  logo: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  tagline: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },

  description: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 30,
  },

  button: {
    backgroundColor: '#1e293b',
    padding: 18,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },

  faceButton: {
    backgroundColor: '#4f46e5',
    padding: 18,
    borderRadius: 12,
    marginTop: 5,
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },

  footer: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 35,
  },

});
