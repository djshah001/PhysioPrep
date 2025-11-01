import { useEffect, useRef, useState } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../global.css';
import { configureGoogleSignIn } from '../services/googleAuth';
import { useAtom } from 'jotai';
import { isLoggedInAtom, refreshTokenAtom, tokenAtom, userAtom } from '../store/auth';
import { useAuth } from '~/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform, StatusBar } from 'react-native';
import { AppOpenAd, BannerAd, BannerAdSize, TestIds, useForeground, AdEventType } from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-3904519861823527/4617728433';
const appOpenAdUnitId = __DEV__ ? TestIds.APP_OPEN : 'ca-app-pub-3904519861823527/9830101639';

const RootLayout = () => {
  const [loaded, error] = useFonts({
    // Add your fonts here if needed
  });

  const [isLoggedIn] = useAtom(isLoggedInAtom);
  const [user] = useAtom(userAtom);
  const [token] = useAtom(tokenAtom);
  const [refreshToken] = useAtom(refreshTokenAtom);

  const hasValidAuth = isLoggedIn && user && token && refreshToken;

  const { loadStoredAuth } = useAuth();

  const bannerRef = useRef<BannerAd>(null);
  const appOpenAdRef = useRef<AppOpenAd | null>(null);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const isFirstLaunch = useRef(true);

  // Initialize app open ad
  useEffect(() => {
    const appOpenAd = AppOpenAd.createForAdRequest(appOpenAdUnitId, {
      keywords: ['fashion', 'clothing'],
    });

    // Set up event listeners
    const unsubscribeLoaded = appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log('App Open Ad loaded');
      setIsAdLoaded(true);
    });

    const unsubscribeError = appOpenAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.log('App Open Ad error:', error);
      setIsAdLoaded(false);
    });

    const unsubscribeClosed = appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('App Open Ad closed');
      setIsAdLoaded(false);
      // Load a new ad for next time
      appOpenAd.load();
    });

    appOpenAdRef.current = appOpenAd;

    // Load the initial ad
    appOpenAd.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeError();
      unsubscribeClosed();
    };
  }, []);

  // Show ad on first launch when loaded
  useEffect(() => {
    if (isAdLoaded && isFirstLaunch.current && appOpenAdRef.current) {
      console.log('Showing App Open Ad on first launch');
      isFirstLaunch.current = false;
      appOpenAdRef.current.show().catch((error) => {
        console.log('Error showing App Open Ad:', error);
      });
    }
  }, [isAdLoaded]);

  // Handle foreground events with useForeground hook
  useForeground(() => {
    console.log('App came to foreground');
    
    // Reload banner ad on iOS
    if (Platform.OS === 'ios') {
      bannerRef.current?.load();
    }

    // Handle app open ad
    if (appOpenAdRef.current) {
      if (isAdLoaded) {
        console.log('Showing App Open Ad on foreground');
        appOpenAdRef.current.show().catch((error) => {
          console.log('Error showing App Open Ad:', error);
        });
      } else {
        console.log('Loading App Open Ad on foreground');
        appOpenAdRef.current.load();
      }
    }
  });

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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-background" edges={['bottom', 'left', 'right']}>
        <StatusBar barStyle="dark-content" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={hasValidAuth as boolean}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="subjects" />
            <Stack.Screen name="topics/[topicId]" />
            <Stack.Screen name="profile" />
          </Stack.Protected>
          <Stack.Protected guard={!hasValidAuth}>
            <Stack.Screen name="login" />
          </Stack.Protected>
        </Stack>
        <BannerAd
          ref={bannerRef}
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default RootLayout;