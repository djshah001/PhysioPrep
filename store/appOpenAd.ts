import { atom } from 'jotai';
import { AppOpenAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

// Use the same ad ID as the layout (the original one)
const appOpenAdUnitId = __DEV__ ? TestIds.APP_OPEN : 'ca-app-pub-3904519861823527/9830101639';

// Create a single app open ad instance to be shared across the app
export const appOpenAdInstance = AppOpenAd.createForAdRequest(appOpenAdUnitId, {
  keywords: ['games','fashion','health','fitness','social media'],
});

// Atom to track if the ad is loaded
export const appOpenAdLoadedAtom = atom(false);

// Atom to track if the ad is loading
export const appOpenAdLoadingAtom = atom(false);

// Atom to track any ad errors
export const appOpenAdErrorAtom = atom<string | null>(null);

// Atom to track if this is the first launch
export const isFirstLaunchAtom = atom(true);

// Action atom to initialize the app open ad
export const initializeAppOpenAdAtom = atom(
  null,
  (get, set) => {
    const setLoaded = (loaded: boolean) => set(appOpenAdLoadedAtom, loaded);
    const setLoading = (loading: boolean) => set(appOpenAdLoadingAtom, loading);
    const setError = (error: string | null) => set(appOpenAdErrorAtom, error);

    // Set up event listeners
    const unsubscribeLoaded = appOpenAdInstance.addAdEventListener(
      AdEventType.LOADED,
      () => {
        console.log('Shared app open ad loaded');
        setLoaded(true);
        setLoading(false);
        setError(null);
      }
    );

    const unsubscribeError = appOpenAdInstance.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        console.log('Shared app open ad error:', error);
        setLoaded(false);
        setLoading(false);
        setError(error.message || 'Failed to load app open ad');
      }
    );

    const unsubscribeClosed = appOpenAdInstance.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        console.log('Shared app open ad closed');
        setLoaded(false);
        // Load a new ad for next time
        set(loadAppOpenAdAtom);
      }
    );

    // Start loading the ad
    setLoading(true);
    appOpenAdInstance.load();

    // Return cleanup function
    return () => {
      unsubscribeLoaded();
      unsubscribeError();
      unsubscribeClosed();
    };
  }
);

// Action atom to load the app open ad
export const loadAppOpenAdAtom = atom(
  null,
  (get, set) => {
    const isLoaded = get(appOpenAdLoadedAtom);
    const isLoading = get(appOpenAdLoadingAtom);
    
    // Only load if not already loaded or loading
    if (!isLoaded || !isLoading) {
      set(appOpenAdLoadingAtom, true);
      set(appOpenAdErrorAtom, null);
      appOpenAdInstance.load();
    }
  }
);

// Action atom to show the app open ad
export const showAppOpenAdAtom = atom(
  null,
  async (get, set) => {
    const isLoaded = get(appOpenAdLoadedAtom);
    
    if (isLoaded) {
      try {
        await appOpenAdInstance.show();
        set(appOpenAdLoadedAtom, false);
        // Automatically load the next ad
        set(loadAppOpenAdAtom);
      } catch (error) {
        console.log('Error showing app open ad:', error);
        set(appOpenAdErrorAtom, 'Failed to show ad');
      }
    } else {
      console.log('App open ad not loaded yet');
      set(appOpenAdErrorAtom, 'Ad not ready');
    }
  }
);

// Action atom to show app open ad on first launch
export const showAppOpenAdOnFirstLaunchAtom = atom(
  null,
  async (get, set, hasValidAuth: boolean) => {
    const isLoaded = get(appOpenAdLoadedAtom);
    const isFirstLaunch = get(isFirstLaunchAtom);
    
    if (isLoaded && isFirstLaunch && hasValidAuth) {
      console.log('Showing app open ad on first launch');
      set(isFirstLaunchAtom, false);
      await set(showAppOpenAdAtom);
    }
  }
);

// Action atom to show app open ad on foreground
export const showAppOpenAdOnForegroundAtom = atom(
  null,
  async (get, set, hasValidAuth: boolean) => {
    const isLoaded = get(appOpenAdLoadedAtom);
    
    if (isLoaded && hasValidAuth) {
      console.log('Showing app open ad on foreground');
      await set(showAppOpenAdAtom);
    }
    // set(loadAppOpenAdAtom);
  }
);
