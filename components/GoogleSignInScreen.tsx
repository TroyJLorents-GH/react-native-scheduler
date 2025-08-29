import React, { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { authenticateWithGoogleSimple, GoogleUser } from '../services/googleAuthService';

export default function GoogleSignInScreen() {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function signInWithGoogle() {
    try {
      setIsLoading(true);
      console.log('=== GOOGLE AUTH DEBUG ===');
      console.log('Starting Google authentication...');
      
      const result = await authenticateWithGoogleSimple();
      
      console.log('Auth result:', result);

      if (result.success && result.user) {
        setUser(result.user);
        console.log('Authentication successful!');
        alert('✅ Successfully signed in as ' + result.user.name);
      } else {
        setUser(null);
        console.log('Authentication failed:', result.error);
        alert('❌ Authentication failed: ' + result.error);
      }
    } catch (error) {
      console.error('Google auth error:', error);
      alert('❌ Authentication error: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  function signOut() {
    setUser(null);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Google Sign-In Test</Text>
      
      <Button 
        title={isLoading ? "Signing in..." : "Sign in with Google"} 
        onPress={signInWithGoogle}
        disabled={isLoading}
      />
      
      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userInfo: {
    marginTop: 30,
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
  },
  signOutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  signOutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
