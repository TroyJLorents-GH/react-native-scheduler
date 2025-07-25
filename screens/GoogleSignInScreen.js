import * as AuthSession from 'expo-auth-session';
import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

const CLIENT_ID = '346580462980-facim1lm6d51cauq638vkkqcna1s34gh.apps.googleusercontent.com'; // <-- Paste your actual Client ID here

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

export default function GoogleSignInScreen() {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);

  async function signInWithGoogle() {
    const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
    const scopes = [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/calendar.readonly',
      'openid',
      'profile',
      'email',
    ].join(' ');

    const result = await AuthSession.startAsync({
      authUrl:
        `${discovery.authorizationEndpoint}` +
        `?client_id=${CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=token` +
        `&scope=${encodeURIComponent(scopes)}`,
    });

    if (result.type === 'success') {
      setAccessToken(result.params.access_token);
      fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${result.params.access_token}` },
      })
        .then(res => res.json())
        .then(data => setUser(data));
    } else {
      setAccessToken(null);
      setUser(null);
    }
  }

  return (
    <View style={styles.container}>
      <Button title="Sign in with Google" onPress={signInWithGoogle} />
      {accessToken && (
        <View style={{ marginTop: 30 }}>
          <Text style={styles.tokenLabel}>Access Token:</Text>
          <Text style={styles.token}>{accessToken.slice(0, 24)}...</Text>
        </View>
      )}
      {user && (
        <View style={{ marginTop: 30 }}>
          <Text>Signed in as:</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tokenLabel: { fontWeight: 'bold', marginBottom: 5 },
  token: { fontSize: 10 },
  email: { fontWeight: 'bold', color: '#222', marginTop: 5 },
});
