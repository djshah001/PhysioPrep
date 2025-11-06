import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * Hook that invokes a callback when the app transitions to the foreground
 * @param callback - Function to call when app comes to foreground
 */
export const useForeground = (callback: () => void) => {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      // Check if app is transitioning from background/inactive to active
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        callback();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [callback]);
};

// Usage example:
// import { useForeground } from './useForeground';
//
// function MyComponent() {
//   useForeground(() => {
//     console.log('App came to foreground!');
//     // Refresh data, resume tasks, etc.
//   });
//
//   return <View>...</View>;
// }