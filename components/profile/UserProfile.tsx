import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { Button } from '../ui/button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileSkeleton } from '../../components/skeletons/ProfileSkeleton';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useAuth } from '../../hooks/useAuth';
import { useUser } from '../../store/auth';
import api from '../../services/api';
import colors from 'tailwindcss/colors';

interface ProfileStats {
  totalQuizzesTaken: number;
  totalTestsTaken: number;
  correctAnswers: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  totalQuestionsAnswered?: number;
}

// Enhanced Stats Card Component
const StatsCard = ({
  title,
  value,
  colors,
  icon,
  delay = 0,
}: {
  title: string;
  value: string | number;
  colors: readonly [string, string];
  icon: keyof typeof Ionicons.glyphMap;
  delay?: number;
}) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    // entering/layout animation applied to the outer wrapper only
    <Animated.View
      entering={FadeInUp.delay(delay).springify()}
      className="mb-1 min-w-[45%] flex-1">
      {/* inner Animated.View holds the transform so it won't be overwritten by layout animation */}
      <Animated.View style={animatedStyle} className="w-full">
        <LinearGradient colors={colors as any} className="rounded-2xl p-4 shadow-lg overflow-hidden">
          <View className="mb-2 flex-row items-center justify-between">
            <Ionicons name={icon} size={24} color="white" />
            <Text className="text-2xl font-bold text-white">{String(value)}</Text>
          </View>
          <Text className="text-sm font-medium text-white/80">{title}</Text>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
};

// Utility function
const formatDate = (d: string | null) => (d ? new Date(d).toLocaleDateString() : 'Never');

// Profile Header Component
const ProfileHeader = ({
  user,
  premiumStatus,
  onClose,
}: {
  user: any;
  premiumStatus: { text: string; color: string };
  onClose: () => void;
}) => {
  const headerScale = useSharedValue(0);
  const avatarRotation = useSharedValue(0);

  useEffect(() => {
    headerScale.value = withSpring(1, { damping: 100});
    avatarRotation.value = withTiming(360, { duration: 1000 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${avatarRotation.value}deg` }],
  }));

  return (
    // entering applied here
    <Animated.View
      entering={FadeInDown.delay(100).springify()}
      className="mb-6">
      {/* transform applied to this inner Animated.View (no entering on this one) */}
      <Animated.View style={headerAnimatedStyle}>
        <LinearGradient
          colors={['#1F2937', '#374151', '#4B5563']}
          className="rounded-3xl p-4 shadow-2xl overflow-hidden"
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          {/* Header with close button */}
          {/* <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-white">Profile</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Close profile"
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-gray-800/50">
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View> */}

          {/* User Info */}
          <View className="flex-row items-center">
            <Animated.View
              style={avatarAnimatedStyle}
              className="mr-6 h-24 w-24 overflow-hidden rounded-full border-2 border-white/20 shadow-lg">
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} className="h-full w-full" resizeMode="cover" />
              ) : (
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6', '#EC4899']}
                  className="flex-1 items-center justify-center">
                  <Text className="text-3xl font-bold text-white">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </Text>
                </LinearGradient>
              )}
            </Animated.View>

            <View className="flex-1">
              <Text className="mb-1 text-2xl font-bold text-white">{user?.name || 'User'}</Text>
              <Text className="mb-3 text-base text-gray-300">{user?.email}</Text>

              <View className="flex-row flex-wrap items-center">
                <View
                  className="mb-2 mr-3 rounded-full px-4 py-2"
                  style={{ backgroundColor: `${premiumStatus.color}20` }}>
                  <Text style={{ color: premiumStatus.color }} className="text-sm font-semibold">
                    {premiumStatus.text}
                  </Text>
                </View>

                {user?.role === 'admin' && (
                  <View className="mb-2 rounded-full bg-purple-500/20 px-4 py-2">
                    <Text className="text-sm font-semibold text-purple-400">Admin</Text>
                  </View>
                )}

                {user?.isEmailVerified && (
                  <View className="mb-2 rounded-full bg-green-500/20 px-4 py-2">
                    <Text className="text-sm font-semibold text-green-400">Verified</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Premium Expiry */}
          {user?.isPremium && user?.premiumExpiry && (
            <View className="mt-4 border-t border-gray-600/50 pt-4">
              <Text className="text-sm text-gray-400">
                Premium expires: {formatDate(user.premiumExpiry)}
              </Text>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
};

export default function UserProfile() {
  const router = useRouter();
  const { logout, updateUser } = useAuth();
  const [user, setUser] = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const scale = useSharedValue(1);

  const [prefs, setPrefs] = useState({
    notifications: user?.preferences?.notifications ?? true,
    dailyReminder: user?.preferences?.dailyReminder ?? false,
    theme: (user?.preferences?.theme as 'light' | 'dark' | 'auto') ?? 'auto',
  });

  const applyPrefsUpdate = async (partial: Partial<typeof prefs>) => {
    const prev = prefs;
    const next = { ...prefs, ...partial };
    setPrefs(next);
    try {
      setSavingPrefs(true);
      await updateUser({ preferences: next } as any);
    } catch {
      setPrefs(prev);
      Alert.alert('Update failed', 'Could not update preferences. Please try again.');
    } finally {
      setSavingPrefs(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserProfile = async () => {
    try {
      setError(null);
      setLoadingProfile(true);
      const res = await api.get('/users/profile');
      if (res.data?.success) {
        const fresh = res.data.data;
        setStats(fresh?.stats || null);
        setUser(fresh);
        setPrefs({
          notifications: fresh?.preferences?.notifications ?? true,
          dailyReminder: fresh?.preferences?.dailyReminder ?? false,
          theme: (fresh?.preferences?.theme as 'light' | 'dark' | 'auto') ?? 'auto',
        });
      } else {
        setError('Failed to load profile');
      }
    } catch (e: any) {
      console.error('Failed to fetch profile:', e);
      setError(e?.response?.data?.errors?.[0]?.msg || 'Failed to load profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserProfile();
    setRefreshing(false);
  };

  const getPremiumStatus = () => {
    if (!user?.isPremium) return { text: 'Free', color: '#6B7280' as const };
    if (user.isPremiumActive) return { text: 'Premium Active', color: '#10B981' as const };
    return { text: 'Premium Expired', color: '#EF4444' as const };
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const premiumStatus = getPremiumStatus();

  // Enhanced logout handler with confirmation
  const handleLogout = () => {
    Alert.alert(
      'Logout Confirmation',
      'Are you sure you want to logout? You will need to sign in again to access your account.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log('Logout cancelled'),
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Navigation will be handled by the useAuth hook
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const menuItems = [
    {
      title: 'Account Settings',
      description: 'Manage your account preferences',
      icon: 'settings-outline' as const,
      route: '/profile',
      colors: ['#6366F1', '#8B5CF6'] as const,
      isActive: true,
    },
    {
      title: 'Change Password',
      description: 'Update your password',
      icon: 'lock-closed-outline' as const,
      route: '/profile/password',
      colors: ['#F59E0B', '#EF4444'] as const,
      isActive: user?.provider !== 'google',
    },
    {
      title: 'Statistics',
      description: 'View detailed performance stats',
      icon: 'bar-chart-outline' as const,
      route: '/profile/stats',
      colors: ['#10B981', '#059669'] as const,
      isActive: true,
    },
    {
      title: 'Delete Account',
      description: 'Permanently delete your account',
      icon: 'trash-outline' as const,
      route: '/profile/delete',
      colors: ['#EF4444', '#DC2626'] as const,
      isActive: false,
    },
  ];

  // console.log(JSON.stringify(user, null, 2));

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-32"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF6B6B"
            colors={['#FF6B6B']}
          />
        }
        showsVerticalScrollIndicator={false}>
        <View className="p-6">
          {/* Error State */}
          {!!error && (
            <Animated.View
              entering={FadeInDown.springify()}
              className="mb-4 rounded-xl border border-red-500/30 bg-red-500/15 p-4">
              <View className="mb-2 flex-row items-center">
                <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
                <Text className="ml-2 font-semibold text-red-400">Error</Text>
              </View>
              <Text className="mb-3 text-red-300">{error}</Text>
              <Button
                title="Retry"
                onPress={onRefresh}
                className="self-start rounded-lg border border-red-500/30 bg-red-500/20 px-4 py-2"
                textClassName="text-sm font-medium text-red-300"
              />
            </Animated.View>
          )}

          {/* Loading State */}
          {loadingProfile ? (
            <ProfileSkeleton />
          ) : (
            <>
              {/* Profile Header */}
              <ProfileHeader user={user} premiumStatus={premiumStatus} onClose={() => router.back()} />

          {/* Enhanced Statistics Section */}
          <Animated.View entering={FadeInDown.delay(300).springify()} className="mb-6">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-neutral-800">Statistics</Text>
              <Button
                title="View All"
                onPress={() => router.push('/profile/stats' as any)}
                className="flex-row items-center rounded-full bg-blue-500/20 px-3 py-1"
                textClassName="mr-1 text-sm text-blue-400"
                rightIcon="chevron-forward-outline"
                rightIconSize={16}
                rightIconColor="#60A5FA"
              />
            </View>

            <View className="flex-row flex-wrap gap-3">
              <StatsCard
                title="Quizzes Taken"
                value={stats?.totalQuizzesTaken ?? user?.stats?.totalQuizzesTaken ?? 0}
                colors={['#10B981', '#059669']}
                icon="library-outline"
                delay={100}
              />
              <StatsCard
                title="Tests Taken"
                value={stats?.totalTestsTaken ?? user?.stats?.totalTestsTaken ?? 0}
                colors={['#22D3EE', '#06B6D4']}
                icon="document-text-outline"
                delay={200}
              />
              <StatsCard
                title="Average Score"
                value={`${Math.round((stats?.averageScore ?? user?.stats?.averageScore ?? 0) as number)}%`}
                colors={['#6366F1', '#8B5CF6']}
                icon="trophy-outline"
                delay={300}
              />
              <StatsCard
                title="Current Streak"
                value={stats?.currentStreak ?? user?.stats?.currentStreak ?? 0}
                colors={['#F59E0B', '#D97706']}
                icon="flame-outline"
                delay={400}
              />
              <StatsCard
                title="Correct Answers"
                value={stats?.correctAnswers ?? user?.stats?.correctAnswers ?? 0}
                colors={['#EF4444', '#DC2626']}
                icon="checkmark-circle-outline"
                delay={500}
              />
              <StatsCard
                title="Total Answered"
                value={stats?.totalQuestionsAnswered ?? user?.stats?.totalQuestionsAnswered ?? 0}
                colors={['#A78BFA', '#7C3AED']}
                icon="help-circle-outline"
                delay={600}
              />
            </View>
          </Animated.View>

          {/* Enhanced Preferences Section */}
          {/* <Animated.View entering={FadeInDown.delay(400).springify()} className="mb-6">
            <Text className="mb-4 text-xl font-bold text-neutral-800">Preferences</Text>
            <LinearGradient
              colors={['#1F2937', '#374151', '#4B5563']}
              className="rounded-2xl p-5 shadow-lg"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}> */}
              {/* Notifications Toggle */}
              {/* <Animated.View
                entering={SlideInRight.delay(100)}
                className="mb-5 flex-row items-center justify-between rounded-xl bg-black/10 p-3">
                <View className="flex-1 flex-row items-center">
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
                    <Ionicons name="notifications-outline" size={20} color="#60A5FA" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-white">Push Notifications</Text>
                    <Text className="text-sm text-gray-400">Get notified about new content</Text>
                  </View>
                </View>
                <TouchableOpacity
                  accessibilityRole="switch"
                  accessibilityState={{ checked: !!prefs.notifications }}
                  disabled={savingPrefs}
                  onPress={() => applyPrefsUpdate({ notifications: !prefs.notifications })}
                  className={`h-8 w-14 rounded-full p-1 ${prefs.notifications ? 'bg-green-500' : 'bg-gray-600'}`}>
                  <Animated.View
                    className={`h-6 w-6 rounded-full bg-white shadow-lg ${prefs.notifications ? 'ml-6' : 'ml-0'}`}
                    style={{
                      transform: [{ translateX: prefs.notifications ? 0 : 0 }],
                    }}
                  />
                </TouchableOpacity>
              </Animated.View> */}

              {/* Daily Reminder Toggle */}
              {/* <Animated.View
                entering={SlideInRight.delay(200)}
                className="mb-5 flex-row items-center justify-between rounded-xl bg-black/10 p-3">
                <View className="flex-1 flex-row items-center">
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-orange-500/20">
                    <Ionicons name="alarm-outline" size={20} color="#FB923C" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-white">Daily Reminder</Text>
                    <Text className="text-sm text-gray-400">Daily study reminders</Text>
                  </View>
                </View>
                <TouchableOpacity
                  accessibilityRole="switch"
                  accessibilityState={{ checked: !!prefs.dailyReminder }}
                  disabled={savingPrefs}
                  onPress={() => applyPrefsUpdate({ dailyReminder: !prefs.dailyReminder })}
                  className={`h-8 w-14 rounded-full p-1 ${prefs.dailyReminder ? 'bg-green-500' : 'bg-gray-600'}`}>
                  <Animated.View
                    className={`h-6 w-6 rounded-full bg-white shadow-lg ${prefs.dailyReminder ? 'ml-6' : 'ml-0'}`}
                    style={{
                      transform: [{ translateX: prefs.dailyReminder ? 0 : 0 }],
                    }}
                  />
                </TouchableOpacity>
              </Animated.View> */}

              {/* Theme Selection */}
              {/* <Animated.View entering={SlideInRight.delay(300)} className="mb-2">
                <View className="mb-3 flex-row items-center">
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-purple-500/20">
                    <Ionicons name="color-palette-outline" size={20} color="#A78BFA" />
                  </View>
                  <View>
                    <Text className="font-semibold text-white">Theme</Text>
                    <Text className="text-sm text-gray-400">Choose your preferred theme</Text>
                  </View>
                </View>

                <View className="flex-row rounded-xl bg-black/20 p-1">
                  {(['auto', 'light', 'dark'] as const).map((t) => (
                    <TouchableOpacity
                      key={t}
                      disabled={savingPrefs}
                      onPress={() => applyPrefsUpdate({ theme: t })}
                      className={`flex-1 rounded-lg py-3 ${prefs.theme === t ? 'bg-white/10 shadow-lg' : ''}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: prefs.theme === t }}
                      accessibilityLabel={`Set theme to ${t}`}>
                      <View className="items-center">
                        <Ionicons
                          name={
                            t === 'auto'
                              ? 'phone-portrait-outline'
                              : t === 'light'
                                ? 'sunny-outline'
                                : 'moon-outline'
                          }
                          size={20}
                          color={prefs.theme === t ? '#FFFFFF' : '#9CA3AF'}
                        />
                        <Text
                          className={`mt-1 text-center text-sm ${prefs.theme === t ? 'font-semibold text-white' : 'text-gray-400'}`}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View> */}

              {/* {savingPrefs && (
                <Animated.View
                  entering={FadeInUp}
                  className="mt-3 flex-row items-center justify-center rounded-lg bg-blue-500/10 p-2">
                  <ActivityIndicator size="small" color="#60A5FA" />
                  <Text className="ml-2 text-sm text-blue-400">Saving preferences...</Text>
                </Animated.View>
              )}
            </LinearGradient>
          </Animated.View> */}

          {/* Enhanced Account Section */}
          <Animated.View entering={FadeInDown.delay(500).springify()} className="mb-6">
            <Text className="mb-4 text-xl font-bold text-neutral-800">Account Settings</Text>
            <View className="gap-2">
              {menuItems.map((item) => (
                item.isActive && ( // Only render active items
                  <Button
                    key={item.title}
                    onPress={() => router.push(item.route as any)}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    className="overflow-hidden rounded-2xl bg-transparent p-0 "
                    // Button supports children; render the existing gradient content
                  >
                    <LinearGradient
                      colors={item.colors}
                      className="flex-row items-center p-5 overflow-hidden rounded-2xl"
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      >
                      <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-white/20">
                        <Ionicons name={item.icon} size={24} color="white" />
                      </View>
                      <View className="flex-1">
                        <Text className="mb-1 text-lg font-bold text-white">{item.title}</Text>
                        <Text className="text-sm text-white/80">{item.description}</Text>
                      </View>
                      <View className="h-8 w-8 items-center justify-center rounded-full bg-white/20">
                        <Ionicons name="chevron-forward" size={18} color="white" />
                      </View>
                    </LinearGradient>
                  </Button>
                ) // End of conditional rendering for active items
              ))}
            </View>
          </Animated.View>

          {/* Enhanced Logout Section */}
          <Animated.View entering={FadeInDown.delay(1000).springify()}>
            <Animated.View style={buttonAnimatedStyle}>
              <Button
                title="Logout"
                onPress={handleLogout}
                className="flex-row items-center justify-center rounded-2xl border-2 border-red-500/30 bg-red-500 p-5 shadow-lg"
                textClassName="text-lg font-bold text-red-100"
                // leftIcon={<Ionicons name="log-out-outline" size={24} color={colors.red[100]} />}
                rightIcon={<Ionicons name="exit-outline" size={18} color={colors.red[100]} />}
              />
            </Animated.View>
          </Animated.View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
