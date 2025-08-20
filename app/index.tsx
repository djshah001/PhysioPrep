import { View, Text, ActivityIndicator } from 'react-native';
import { isLoadingAtom, isLoggedInAtom, tokenAtom, userAtom } from 'store/auth';
import { useAtom } from 'jotai';
import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '~/useAuth';
import colors from 'tailwindcss/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
const Index = () => {
  const [token] = useAtom(tokenAtom);
  const [isLoggedIn] = useAtom(isLoggedInAtom);
  const { loadStoredAuth } = useAuth();

  useEffect(() => {
    loadStoredAuth();
  }, []);

  // console.log(token, isLoggedIn);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.neutral[200] }}
      className="items-center justify-center">
      <ActivityIndicator size="large" color={colors.blue[400]} />;
    </SafeAreaView>
  );
};

export default Index;
