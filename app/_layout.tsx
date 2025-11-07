import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../global.css';
import { configureGoogleSignIn } from '../services/googleAuth';
import { useAtom, useSetAtom } from 'jotai';
import { isLoggedInAtom, refreshTokenAtom, tokenAtom, userAtom } from '../store/auth';
import { useAuth } from '~/useAuth';
import { Platform, StatusBar } from 'react-native';
import MobileAds, { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useForeground } from '~/useForground';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  appOpenAdLoadedAtom,
  initializeAppOpenAdAtom,
  showAppOpenAdOnFirstLaunchAtom,
  showAppOpenAdOnForegroundAtom,
} from '../store/appOpenAd';

const adUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-3904519861823527/4617728433';

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

  // Use shared app open ad state
  const [appOpenAdLoaded] = useAtom(appOpenAdLoadedAtom);
  const initializeAppOpenAd = useSetAtom(initializeAppOpenAdAtom);
  const showAppOpenAdOnFirstLaunch = useSetAtom(showAppOpenAdOnFirstLaunchAtom);
  const showAppOpenAdOnForeground = useSetAtom(showAppOpenAdOnForegroundAtom);

  useEffect(() => {
    // Initialize AdMob asynchronously
    MobileAds()
      .initialize()
      .then((adapterStatuses) => {
        console.log('✅ AdMob initialized:', adapterStatuses);
      })
      .catch((error) => {
        console.log('❌ AdMob initialization error:', error);
      });
  }, []);

  // Initialize app open ad
  useEffect(() => {
    // Initialize the shared app open ad
    const cleanup = initializeAppOpenAd();
    return cleanup;
  }, [initializeAppOpenAd]);

  // Show ad on first launch when loaded
  useEffect(() => {
    showAppOpenAdOnFirstLaunch(!!hasValidAuth);
  }, [appOpenAdLoaded, hasValidAuth, showAppOpenAdOnFirstLaunch]);

  // Handle foreground events with useForeground hook
  useForeground(() => {
    // console.log('App came to foreground');

    // Reload banner ad on iOS
    if (Platform.OS === 'ios') {
      bannerRef.current?.load();
    }

    // Handle app open ad
    showAppOpenAdOnForeground(!!hasValidAuth);
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
        {/* Only show banner ad when user is logged in */}
        {hasValidAuth && (
          <BannerAd
            ref={bannerRef}
            unitId={adUnitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
