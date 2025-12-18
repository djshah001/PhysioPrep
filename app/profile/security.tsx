import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const SecurityOption = ({
  icon,
  title,
  subtitle,
  onPress,
  destructive = false,
  value,
  onToggle,
}: any) => (
  <TouchableOpacity
    onPress={onToggle ? undefined : onPress}
    className="mb-4 flex-row items-center rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
    <View
      className={`h-10 w-10 items-center justify-center rounded-full ${destructive ? 'bg-red-50' : 'bg-neutral-50'}`}>
      <Ionicons name={icon} size={20} color={destructive ? '#EF4444' : '#4B5563'} />
    </View>
    <View className="ml-4 flex-1">
      <Text
        className={`text-base font-semibold ${destructive ? 'text-red-600' : 'text-neutral-900'}`}>
        {title}
      </Text>
      {subtitle && <Text className="mt-0.5 text-xs text-neutral-500">{subtitle}</Text>}
    </View>
    {onToggle ? (
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
      />
    ) : (
      <Ionicons name="chevron-forward" size={20} color={destructive ? '#FCA5A5' : '#D1D5DB'} />
    )}
  </TouchableOpacity>
);

export default function SecurityScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [biometrics, setBiometrics] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDeactivate = () => {
    Alert.alert(
      'Deactivate Account',
      'Your account will be hidden until you log in again. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await api.post('/users/profile/deactivate');
              logout();
            } catch {
              Alert.alert('Error', 'Could not deactivate account.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. You will lose all progress.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: () => router.push('/profile/delete-confirm'), // Separate screen for final password check
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['top']}>
      {/* <View className="px-6 py-4 flex-row items-center border-b border-neutral-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-neutral-100 rounded-full">
            <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-neutral-900">Security</Text>
      </View> */}

      <ScrollView className="p-6">
        {/* Authentication */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text className="mb-3 text-sm font-bold uppercase tracking-wider text-neutral-500">
            Authentication
          </Text>

          <SecurityOption
            icon="key-outline"
            title="Change Password"
            subtitle="Update your login password"
            onPress={() => router.push('/profile/password')}
          />

          <SecurityOption
            icon="finger-print-outline"
            title="Biometric Login"
            subtitle="Use FaceID or TouchID"
            value={biometrics}
            onToggle={setBiometrics}
          />
        </Animated.View>

        {/* Account Actions */}
        <Animated.View entering={FadeInDown.delay(200).springify()} className="mt-6">
          <Text className="mb-3 text-sm font-bold uppercase tracking-wider text-neutral-500">
            Account Actions
          </Text>

          <SecurityOption
            icon="moon-outline"
            title="Deactivate Account"
            subtitle="Temporarily disable your account"
            onPress={handleDeactivate}
          />

          <SecurityOption
            icon="trash-outline"
            title="Delete Account"
            subtitle="Permanently remove all data"
            destructive
            onPress={handleDelete}
          />
        </Animated.View>

        {loading && (
          <View className="absolute inset-0 items-center justify-center rounded-xl bg-black/20">
            <ActivityIndicator color="#6366F1" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
