import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../global.css';
import { configureGoogleSignIn } from '../services/googleAuth';
import { useAtom } from 'jotai';
import { isLoggedInAtom, refreshTokenAtom, tokenAtom, userAtom } from '../store/auth';
import { useAuth } from '~/useAuth';

// Keep the splash screen visible while we fetch resources
// SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [loaded, error] = useFonts({
    // Add your fonts here if needed
  });

  const [isLoggedIn] = useAtom(isLoggedInAtom);
  const [user] = useAtom(userAtom);
  const [token] = useAtom(tokenAtom);
  const [refreshToken] = useAtom(refreshTokenAtom);

  const hasValidAuth = isLoggedIn && user && token && refreshToken ;

  const { loadStoredAuth } = useAuth();

  // const loadStoredAuth = async () => {
  //   try {
  //     console.log('Loading stored authentication state...'); // Debug log
  //     const storedToken = await AsyncStorage.getItem('token');
  //     const storedUser = await AsyncStorage.getItem('user');
  //     const storedLoginState = await AsyncStorage.getItem('isLoggedIn');
  //     const storedRefreshToken = await AsyncStorage.getItem('refreshToken');

  //     const hasValidAuth =
  //       storedToken && storedRefreshToken && storedUser && storedLoginState === 'true';

  //     if (hasValidAuth) {
  //       console.log('Found stored authentication state'); // Debug log
  //       setIsLoggedIn(true);
  //     } else {
  //       setIsLoggedIn(false);
  //     }
  //   } catch (error) {
  //     console.error('Error loading auth state:', error);
  //     setIsLoggedIn(false);
  //   }
  // };

  useEffect(() => {
    loadStoredAuth();

    if (error) throw error;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Configure Google Sign-In when the app starts
    configureGoogleSignIn();
  }, []);

  if (!loaded) {
    return null;
  }

  // console.log(isLoggedIn);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={hasValidAuth as boolean}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* <Stack.Screen name="profile" /> */}
          <Stack.Screen name="subjects" />
          <Stack.Screen name="topics/[topicId]" />
          {/* <Stack.Screen name="quiz" /> */}
          {/* <Stack.Screen name="comprehensive-test" /> */}
          {/* <Stack.Screen name="daily-question" /> */}
        </Stack.Protected>
        <Stack.Protected guard={!hasValidAuth}>
          <Stack.Screen name="login" />
        </Stack.Protected>
      </Stack>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
