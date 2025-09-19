import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '118411292895-cu78fath7rnfmf8lmp66pmpmko78fe0j.apps.googleusercontent.com';
const GOOGLE_CLIENT_ID_WEB = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || '118411292895-cu78fath7rnfmf8lmp66pmpmko78fe0j.apps.googleusercontent.com';

// Get the appropriate client ID based on platform
export const getClientId = () => {
  if (Platform.OS === 'web') {
    return GOOGLE_CLIENT_ID_WEB;
  }
  return GOOGLE_CLIENT_ID;
};

// Configure Google Sign-In
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: getClientId(), // server client ID of type WEB for your server
    offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
    hostedDomain: '', // specifies a hosted domain restriction
    forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
    accountName: '', // [Android] specifies an account name on the device that should be used
    iosClientId: GOOGLE_CLIENT_ID, // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
    googleServicePlistPath: '', // [iOS] if you renamed your GoogleService-Info.plist you'll need to add this line.
    profileImageSize: 120, // [iOS] The desired height (and width) of the profile image. Defaults to 120px
  });
};

export interface GoogleAuthResult {
  success: boolean;
  idToken?: string;
  accessToken?: string;
  error?: string;
}

// Check if Google Play Services are available
export const checkGooglePlayServices = async (): Promise<boolean> => {
  try {
    await GoogleSignin.hasPlayServices();
    return true;
  } catch (error) {
    console.error('Google Play Services not available:', error);
    return false;
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<GoogleAuthResult> => {
  try {
    // Check if Google Play Services are available
    const hasPlayServices = await checkGooglePlayServices();
    if (!hasPlayServices) {
      return {
        success: false,
        error: 'Google Play Services not available',
      };
    }

    // Sign in
    const userInfo = await GoogleSignin.signIn();

    // Get the ID token from the user info
    const idToken = userInfo.data?.idToken;

    if (idToken) {
      return {
        success: true,
        idToken: idToken,
        accessToken: userInfo.data?.serverAuthCode || undefined,
      };
    } else {
      return {
        success: false,
        error: 'No ID token received from Google',
      };
    }
  } catch (error: any) {
    console.error('Google sign-in error:', error);

    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return {
        success: false,
        error: 'User cancelled the sign-in',
      };
    } else if (error.code === statusCodes.IN_PROGRESS) {
      return {
        success: false,
        error: 'Sign-in is already in progress',
      };
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return {
        success: false,
        error: 'Google Play Services not available',
      };
    } else {
      return {
        success: false,
        error: error.message || 'Google sign-in failed',
      };
    }
  }
};

// Sign out from Google
export const signOutFromGoogle = async (): Promise<void> => {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Google sign-out error:', error);
  }
};

// Check if user is signed in
export const isSignedIn = (): boolean => {
  try {
    const currentUser = GoogleSignin.getCurrentUser();
    return !!currentUser;
  } catch (error) {
    console.error('Error checking Google sign-in status:', error);
    return false;
  }
};

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
