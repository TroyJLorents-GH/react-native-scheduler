import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// Configure WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

// Types
export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface GoogleTokens {
  accessToken: string;
  expiresAt: number;
}

// Storage functions
const saveTokens = async (tokens: GoogleTokens) => {
  try {
    await AsyncStorage.setItem('google_tokens', JSON.stringify(tokens));
  } catch (error) {
    console.error('Error saving tokens:', error);
  }
};

const saveUser = async (user: GoogleUser) => {
  try {
    await AsyncStorage.setItem('google_user', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

// Ultra-simple authentication - minimal configuration
export const authenticateWithGoogleSimple = async (): Promise<{
  success: boolean;
  user?: GoogleUser;
  error?: string;
}> => {
  try {
    console.log('=== GOOGLE AUTH DEBUG ===');
    console.log('Starting ultra-simple authentication...');
    
    // Use the most basic scopes possible
    const request = new AuthSession.AuthRequest({
      clientId: '346580462980-facim1lm6d51cauq638vkkqcna1s34gh.apps.googleusercontent.com',
      scopes: ['openid'],
      redirectUri: 'https://auth.expo.io/@tlorents/react-native-scheduler',
      responseType: AuthSession.ResponseType.Token,
    });

    console.log('Auth request created');
    console.log('Redirect URI:', request.redirectUri);
    
    const result = await request.promptAsync({
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    });
    
    console.log('Auth result type:', result.type);
    console.log('Auth result:', result);

    if (result.type === 'success' && result.authentication?.accessToken) {
      console.log('Got access token!');
      
      // Get user info
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${result.authentication.accessToken}`,
        },
      });

      if (!userInfoResponse.ok) {
        console.error('Failed to get user info:', userInfoResponse.status);
        return { success: false, error: 'Failed to get user info' };
      }

      const userInfo = await userInfoResponse.json();
      console.log('User info received:', userInfo);

      const user: GoogleUser = {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      };

      // Save data
      await saveTokens({
        accessToken: result.authentication.accessToken,
        expiresAt: Date.now() + ((result.authentication.expiresIn || 3600) * 1000),
      });
      await saveUser(user);

      console.log('Authentication successful!');
      return { success: true, user };
    }

    console.log('Authentication failed:', result.type);
    return { success: false, error: `Authentication failed: ${result.type}` };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Authentication error: ' + (error as Error).message };
  }
};

// Get stored user
export const getStoredUser = async (): Promise<GoogleUser | null> => {
  try {
    const userData = await AsyncStorage.getItem('google_user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting stored user:', error);
    return null;
  }
};

// Get stored tokens
export const getStoredTokens = async (): Promise<GoogleTokens | null> => {
  try {
    const tokenData = await AsyncStorage.getItem('google_tokens');
    return tokenData ? JSON.parse(tokenData) : null;
  } catch (error) {
    console.error('Error getting stored tokens:', error);
    return null;
  }
};

// Sign out
export const signOut = async () => {
  try {
    await AsyncStorage.removeItem('google_user');
    await AsyncStorage.removeItem('google_tokens');
  } catch (error) {
    console.error('Error signing out:', error);
  }
};
