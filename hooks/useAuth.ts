import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import api from 'services/api';
import {
  userAtom,
  tokenAtom,
  refreshTokenAtom,
  isLoadingAtom,
  isLoggedInAtom,
} from '../store/auth';
import { useAtom } from 'jotai';
import { AxiosError } from 'axios';
import { GoogleAuthResult, signInWithGoogle, configureGoogleSignIn, signOutFromGoogle } from '../services/googleAuth';

export const useAuth = () => {
  const [user, setUser] = useAtom(userAtom);
  const [token, setToken] = useAtom(tokenAtom);
  const [refreshToken, setRefreshToken] = useAtom(refreshTokenAtom);
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const [isLoggedIn, setIsLoggedIn] = useAtom(isLoggedInAtom);

  const loadStoredAuth = async () => {
    try {
      console.log('Loading stored authentication state...'); // Debug log
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      const storedLoginState = await AsyncStorage.getItem('isLoggedIn');
      const storedRefreshToken = await AsyncStorage.getItem('refreshToken');

      const hasValidAuth =
        storedToken && storedRefreshToken && storedUser && storedLoginState === 'true';

      if (hasValidAuth) {
        console.log('Found stored authentication state'); // Debug log

        // Set the API authorization header
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setRefreshToken(storedRefreshToken);
        setIsLoggedIn(true);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        api.defaults.headers.common['RefreshToken'] = `Bearer ${storedRefreshToken}`;
        return true;
        // router.replace('/home'); // Redirect to home if logged in
      } else {
        // Clear any partial auth state
        await logout();
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Login initiated...'); // Debug log
      const response = await api.post('/auth/login', { email, password });
      const { token, user, refreshToken } = response.data.data;

      if (response.data.success) {
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('isLoggedIn', 'true');

        setToken(token);
        setRefreshToken(refreshToken);
        setUser(user);
        setIsLoggedIn(true);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        api.defaults.headers.common['RefreshToken'] = `Bearer ${refreshToken}`;
        router.replace('/');
      } else {
        await signOutFromGoogle();
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Login error:', error.response?.data);
        throw error;
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
      });
      const { token, user, refreshToken } = response.data.data;

      if (response.data.success) {
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('isLoggedIn', 'true');
        await AsyncStorage.setItem('refreshToken', refreshToken);

        setToken(token);
        setUser(user);
        setIsLoggedIn(true);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        api.defaults.headers.common['RefreshToken'] = `Bearer ${refreshToken}`;
        router.replace('/');
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Registration error:', error.response?.data);
        throw error;
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log(`Logging out user: ${user?.name || 'Unknown'}`); // Debug log
      setIsLoading(true);
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('isLoggedIn');
      await AsyncStorage.removeItem('refreshToken');
      delete api.defaults.headers.common['Authorization'];
      delete api.defaults.headers.common['RefreshToken'];
      setToken(null);
      setUser(null);
      setIsLoggedIn(false);
      router.replace('/login');
      await signOutFromGoogle();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, try to clear the state
      setToken(null);
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<typeof user>) => {
    try {
      setIsLoading(true);
      const response = await api.put('/users/profile', userData);
      const updatedUser = response.data.data;

      if (response.data.success) {
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Update user error:', error.response?.data);
        throw error;
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const googleSignIn = async (): Promise<GoogleAuthResult> => {
    console.log('Google sign-in initiated...'); // Debug log
    try {
      setIsLoading(true);

      // Configure Google Sign-In
      configureGoogleSignIn();

      // Sign in with Google
      const googleResult = await signInWithGoogle();

      if (!googleResult.success || !googleResult.idToken) {
        return googleResult;
      }

      // Send the ID token to our backend for verification
      const response = await api.post('/auth/google', { token: googleResult.idToken });
      // console.log('Google sign-in response:', response.data); // Debug log
      const { token, user, refreshToken } = response.data.data;

      if (response.data.success) {
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('isLoggedIn', 'true');

        setToken(token);
        setRefreshToken(refreshToken);
        setUser(user);
        setIsLoggedIn(true);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        api.defaults.headers.common['RefreshToken'] = `Bearer ${refreshToken}`;
        router.replace('/');

        return { success: true };
      } else {
        throw new Error(response.data.message || 'Google authentication failed');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      if (error instanceof AxiosError) {
        await signOutFromGoogle();
        const errorMessage =
          error.response?.data?.errors?.[0]?.msg ||
          error.response?.data?.message ||
          'Google authentication failed';
        return { success: false, error: errorMessage };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const linkGoogleAccount = async (): Promise<GoogleAuthResult> => {
    try {
      setIsLoading(true);

      // Configure Google Sign-In
      configureGoogleSignIn();

      // Sign in with Google
      const googleResult = await signInWithGoogle();

      if (!googleResult.success || !googleResult.idToken) {
        return googleResult;
      }

      // Send the ID token to our backend for linking
      const response = await api.post('/auth/google/link', { token: googleResult.idToken });
      const updatedUser = response.data.data.user;

      if (response.data.success) {
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);

        return { success: true };
      } else {
        throw new Error(response.data.message || 'Failed to link Google account');
      }
    } catch (error) {
      console.error('Link Google account error:', error);
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.errors?.[0]?.msg ||
          error.response?.data?.message ||
          'Failed to link Google account';
        return { success: false, error: errorMessage };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    token,
    refreshToken,
    isLoading,
    isLoggedIn,
    login,
    register,
    logout,
    updateUser,
    loadStoredAuth,
    googleSignIn,
    linkGoogleAccount,
  };
};
