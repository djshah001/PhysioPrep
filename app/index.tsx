import { ActivityIndicator, Text } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuth } from '~/useAuth';
import colors from 'tailwindcss/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
const Index = () => {
  const { loadStoredAuth } = useAuth();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStoredAuth().catch((err) => {
      console.error('Failed to load auth:', err);
      setError(err.message);
    });
  }, []);

  if (error) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.neutral[200] }}
        className="items-center justify-center p-4">
        <Text className="mb-4 text-center text-red-500">Failed to initialize app</Text>
        <Text className="text-center text-neutral-600">{error}</Text>
      </SafeAreaView>
    );
  }

  // if (__DEV__) {
  //   const oldError = console.error;
  //   console.error = (...args) => {
  //     if (
  //       typeof args[0] === 'string' &&
  //       args[0].includes('Text strings must be rendered within a <Text>')
  //     ) {
  //       console.log('🚨 Invalid text placement detected!');
  //       // args[1] contains the component stack trace
  //       console.log(args[1]);
  //     }
  //     oldError(...args);
  //   };
  // }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.neutral[200] }}
      className="items-center justify-center">
      <ActivityIndicator size="large" color={colors.blue[400]} />
    </SafeAreaView>
  );
};

export default Index;
