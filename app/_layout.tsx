import { useEffect } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../global.css';
import { configureGoogleSignIn } from '../services/googleAuth';


// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [loaded, error] = useFonts({
    // Add your fonts here if needed
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    // Configure Google Sign-In when the app starts
    configureGoogleSignIn();
  }, []);

  if (!loaded) {
    return null;
  }

  // console.log(pathname);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}>
            <Stack.Screen name="(protected)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="index" />
        </Stack>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
