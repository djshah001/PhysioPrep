import { atom } from 'jotai';
import { RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';

// Use the same ad ID as the subjects page (the original one)
const rewardAdId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-3904519861823527/9830101639';

// Create a single rewarded ad instance to be shared across the app
export const rewardedAdInstance = RewardedAd.createForAdRequest(rewardAdId, {
  requestNonPersonalizedAdsOnly: true,
});

// Atom to track if the ad is loaded
export const rewardedAdLoadedAtom = atom(false);

// Atom to track if the ad is loading
export const rewardedAdLoadingAtom = atom(false);

// Atom to track any ad errors
export const rewardedAdErrorAtom = atom<string | null>(null);

// Action atom to initialize the rewarded ad
export const initializeRewardedAdAtom = atom(
  null,
  (get, set) => {
    const setLoaded = (loaded: boolean) => set(rewardedAdLoadedAtom, loaded);
    const setLoading = (loading: boolean) => set(rewardedAdLoadingAtom, loading);
    const setError = (error: string | null) => set(rewardedAdErrorAtom, error);

    // Set up event listeners
    const unsubscribeLoaded = rewardedAdInstance.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        console.log('Shared rewarded ad loaded');
        setLoaded(true);
        setLoading(false);
        setError(null);
      }
    );

    const unsubscribeEarned = rewardedAdInstance.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        console.log('User earned reward of ', reward);
        setLoaded(false); // Reset loaded state after showing ad
      }
    );

    // const unsubscribeFailedToLoad = rewardedAdInstance.addAdEventListener(
    //   RewardedAdEventType.FAILED_TO_LOAD,
    //   (error) => {
    //     console.log('Rewarded ad failed to load:', error);
    //     setLoaded(false);
    //     setLoading(false);
    //     setError(error.message || 'Failed to load ad');
    //   }
    // );

    // Start loading the ad
    setLoading(true);
    rewardedAdInstance.load();

    // Return cleanup function
    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      // unsubscribeFailedToLoad();
    };
  }
);

// Action atom to load the rewarded ad
export const loadRewardedAdAtom = atom(
  null,
  (get, set) => {
    const isLoaded = get(rewardedAdLoadedAtom);
    const isLoading = get(rewardedAdLoadingAtom);

    // console.log('Loading rewarded ad:', isLoaded, isLoading);
    
    // Only load if not already loaded or loading
    if (!isLoaded || !isLoading) {
      set(rewardedAdLoadingAtom, true);
      set(rewardedAdErrorAtom, null);
      rewardedAdInstance.load();
    }
  }
);

// Action atom to show the rewarded ad
export const showRewardedAdAtom = atom(
  null,
  async (get, set) => {
    const isLoaded = get(rewardedAdLoadedAtom);
    
    if (isLoaded) {
      try {
        await rewardedAdInstance.show();
        set(rewardedAdLoadedAtom, false);
        // Automatically load the next ad
        set(loadRewardedAdAtom);
      } catch (error) {
        console.log('Error showing rewarded ad:', error);
        set(rewardedAdErrorAtom, 'Failed to show ad');
      }
    } else {
      console.log('Rewarded ad not loaded yet');
      set(rewardedAdErrorAtom, 'Ad not ready');
    }
  }
);
