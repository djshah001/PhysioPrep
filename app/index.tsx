import { ActivityIndicator } from 'react-native';

import { useEffect } from 'react';
import { useAuth } from '~/useAuth';
import colors from 'tailwindcss/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
const Index = () => {
  const { loadStoredAuth } = useAuth();

  useEffect(() => {
    loadStoredAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // console.log(token, isLoggedIn);

  if (__DEV__) {
    const oldError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('Text strings must be rendered within a <Text>')
      ) {
        console.log('🚨 Invalid text placement detected!');
        // args[1] contains the component stack trace
        console.log(args[1]);
      }
      oldError(...args);
    };
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.neutral[200] }}
      className="items-center justify-center">
      <ActivityIndicator size="large" color={colors.blue[400]} />
    </SafeAreaView>
  );
};

export default Index;
