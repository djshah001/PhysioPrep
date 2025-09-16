import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

// Complete the auth session for web browsers
WebBrowser.maybeCompleteAuthSession();

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '118411292895-cu78fath7rnfmf8lmp66pmpmko78fe0j.apps.googleusercontent.com';
const GOOGLE_CLIENT_ID_WEB = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || '';

// Get the appropriate client ID based on platform
const getClientId = () => {
  if (Platform.OS === 'web') {
    return GOOGLE_CLIENT_ID_WEB;
  }
  return GOOGLE_CLIENT_ID;
};

// OAuth discovery document
const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export interface GoogleAuthResult {
  success: boolean;
  idToken?: string;
  accessToken?: string;
  error?: string;
}

export class GoogleAuthService {
  private static instance: GoogleAuthService;
  private request: AuthSession.AuthRequest | null = null;

  private constructor() {}

  public static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  /**
   * Initialize the Google OAuth request
   */
  public async initializeRequest(): Promise<void> {
    try {
      const clientId = getClientId();
      
      if (!clientId) {
        throw new Error('Google Client ID not configured');
      }

      // Generate code verifier for PKCE
      const codeVerifier = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        { encoding: Crypto.CryptoEncoding.BASE64 }
      );

      this.request = new AuthSession.AuthRequest({
        clientId,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.IdToken,
        redirectUri: AuthSession.makeRedirectUri({
          scheme: 'physioprep',
          path: 'auth',
        }),
        extraParams: {
          // Add any additional parameters if needed
        },
        prompt: AuthSession.Prompt.SelectAccount,
      });
    } catch (error) {
      console.error('Error initializing Google OAuth request:', error);
      throw error;
    }
  }

  /**
   * Start the Google OAuth flow
   */
  public async signIn(): Promise<GoogleAuthResult> {
    try {
      if (!this.request) {
        await this.initializeRequest();
      }

      if (!this.request) {
        throw new Error('Failed to initialize OAuth request');
      }

      const result = await this.request.promptAsync(discovery);

      if (result.type === 'success') {
        const { id_token, access_token } = result.params;
        
        if (!id_token) {
          throw new Error('No ID token received from Google');
        }

        return {
          success: true,
          idToken: id_token,
          accessToken: access_token,
        };
      } else if (result.type === 'cancel') {
        return {
          success: false,
          error: 'User cancelled the authentication',
        };
      } else {
        return {
          success: false,
          error: 'Authentication failed',
        };
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Sign out (revoke tokens if needed)
   */
  public async signOut(): Promise<void> {
    try {
      // Reset the request
      this.request = null;
      
      // Note: Token revocation would typically be handled by the backend
      // when the user logs out from the app
    } catch (error) {
      console.error('Google sign-out error:', error);
    }
  }

  /**
   * Get the redirect URI for the current platform
   */
  public getRedirectUri(): string {
    return AuthSession.makeRedirectUri({
      scheme: 'physioprep',
      path: 'auth',
    });
  }
}

// Export singleton instance
export const googleAuthService = GoogleAuthService.getInstance();

// Utility functions
export const isGoogleAuthConfigured = (): boolean => {
  const clientId = getClientId();
  return !!clientId && clientId.length > 0;
};

export const getGoogleAuthError = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.error_description) {
    return error.error_description;
  }
  
  return 'An unknown error occurred during Google authentication';
};
