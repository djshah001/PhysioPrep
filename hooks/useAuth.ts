import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import api from 'services/api';
import { userAtom, tokenAtom, isLoadingAtom, isLoggedInAtom } from '../store/auth';
import { useAtom } from 'jotai';
import { AxiosError } from 'axios';

export const useAuth = () => {
  const [user, setUser] = useAtom(userAtom);
  const [token, setToken] = useAtom(tokenAtom);
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const [isLoggedIn, setIsLoggedIn] = useAtom(isLoggedInAtom);

  const loadStoredAuth = async () => {
    try {
      console.log('Loading stored authentication state...'); // Debug log
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      const storedLoginState = await AsyncStorage.getItem('isLoggedIn');

      if (storedToken && storedUser && storedLoginState === 'true') {
        console.log('Found stored authentication state'); // Debug log

        // Set the API authorization header
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        router.replace('/home'); // Redirect to home if logged in
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
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data.data;

      if (response.data.success) {
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('isLoggedIn', 'true');

        setToken(token);
        setUser(user);
        setIsLoggedIn(true);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        router.replace('/home');
      } else {
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
      const { token, user } = response.data.data;

      if (response.data.success) {
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('isLoggedIn', 'true');

        setToken(token);
        setUser(user);
        setIsLoggedIn(true);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        router.replace('/home');
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
      delete api.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
      setIsLoggedIn(false);
      router.replace('/(auth)/login');
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

  return {
    user,
    token,
    isLoading,
    isLoggedIn,
    login,
    register,
    logout,
    updateUser,
    loadStoredAuth,
  };
};
