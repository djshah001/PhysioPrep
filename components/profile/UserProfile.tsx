import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, RefreshControl, ActivityIndicator, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeInUp,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { useAuth } from '../../hooks/useAuth';
import { useUser } from '../../store/auth';
import api from '../../services/api';

const { width } = Dimensions.get('window');

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
  delay = 0
}: {
  title: string;
  value: string | number;
  colors: readonly [string, string];
  icon: keyof typeof Ionicons.glyphMap;
  delay?: number;
}) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).springify()}
      style={animatedStyle}
      className="flex-1 min-w-[45%] mb-3"
    >
      <LinearGradient colors={colors as any} className="rounded-2xl p-4 shadow-lg">
        <View className="flex-row items-center justify-between mb-2">
          <Ionicons name={icon} size={24} color="white" />
          <Text className="text-2xl font-bold text-white">{String(value)}</Text>
        </View>
        <Text className="text-white/80 text-sm font-medium">{title}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

// Utility function
const formatDate = (d: string | null) => (d ? new Date(d).toLocaleDateString() : 'Never');

// Profile Header Component
const ProfileHeader = ({
  user,
  premiumStatus,
  onClose
}: {
  user: any;
  premiumStatus: { text: string; color: string };
  onClose: () => void;
}) => {
  const headerScale = useSharedValue(0);
  const avatarRotation = useSharedValue(0);

  useEffect(() => {
    headerScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    avatarRotation.value = withTiming(360, { duration: 1000 });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${avatarRotation.value}deg` }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(100).springify()}
      style={headerAnimatedStyle}
      className="mb-6"
    >
      <LinearGradient
        colors={['#1F2937', '#374151', '#4B5563']}
        className="rounded-3xl p-6 shadow-2xl"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header with close button */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-bold text-white">Profile</Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Close profile"
            onPress={onClose}
            className="w-12 h-12 rounded-full bg-gray-800/50 items-center justify-center border border-white/10"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View className="flex-row items-center">
          <Animated.View
            style={avatarAnimatedStyle}
            className="w-24 h-24 rounded-full overflow-hidden mr-6 border-2 border-white/20 shadow-lg"
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <LinearGradient
                colors={['#6366F1', '#8B5CF6', '#EC4899']}
                className="flex-1 justify-center items-center"
              >
                <Text className="text-3xl font-bold text-white">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </Text>
              </LinearGradient>
            )}
          </Animated.View>

          <View className="flex-1">
            <Text className="text-2xl font-bold text-white mb-1">
              {user?.name || 'User'}
            </Text>
            <Text className="text-gray-300 mb-3 text-base">
              {user?.email}
            </Text>

            <View className="flex-row items-center flex-wrap">
              <View
                className="px-4 py-2 rounded-full mr-3 mb-2"
                style={{ backgroundColor: `${premiumStatus.color}20` }}
              >
                <Text
                  style={{ color: premiumStatus.color }}
                  className="text-sm font-semibold"
                >
                  {premiumStatus.text}
                </Text>
              </View>

              {user?.role === 'admin' && (
                <View className="px-4 py-2 rounded-full bg-purple-500/20 mb-2">
                  <Text className="text-purple-400 text-sm font-semibold">Admin</Text>
                </View>
              )}

              {user?.isEmailVerified && (
                <View className="px-4 py-2 rounded-full bg-green-500/20 mb-2">
                  <Text className="text-green-400 text-sm font-semibold">Verified</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Premium Expiry */}
        {user?.isPremium && user?.premiumExpiry && (
          <View className="border-t border-gray-600/50 pt-4 mt-4">
            <Text className="text-gray-400 text-sm">
              Premium expires: {formatDate(user.premiumExpiry)}
            </Text>
          </View>
        )}
      </LinearGradient>
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
          theme: (fresh?.preferences?.theme as 'light' | 'dark' | 'auto') ?? 'auto'
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
    transform: [{ scale: scale.value }]
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
          onPress: () => console.log('Logout cancelled')
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
          }
        }
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
      colors: ['#6366F1', '#8B5CF6'] as const
    },
    {
      title: 'Change Password',
      description: 'Update your password',
      icon: 'lock-closed-outline' as const,
      route: '/profile/password',
      colors: ['#F59E0B', '#EF4444'] as const
    },
    {
      title: 'Statistics',
      description: 'View detailed performance stats',
      icon: 'bar-chart-outline' as const,
      route: '/profile/stats',
      colors: ['#10B981', '#059669'] as const
    },
    {
      title: 'Delete Account',
      description: 'Permanently delete your account',
      icon: 'trash-outline' as const,
      route: '/profile/delete',
      colors: ['#EF4444', '#DC2626'] as const
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F0F]">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF6B6B"
            colors={['#FF6B6B']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="p-6">
          {/* Error State */}
          {!!error && (
            <Animated.View
              entering={FadeInDown.springify()}
              className="mb-4 rounded-xl bg-red-500/15 border border-red-500/30 p-4"
            >
              <View className="flex-row items-center mb-2">
                <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
                <Text className="text-red-400 font-semibold ml-2">Error</Text>
              </View>
              <Text className="text-red-300 mb-3">{error}</Text>
              <TouchableOpacity
                onPress={onRefresh}
                className="self-start px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30"
              >
                <Text className="text-red-300 text-sm font-medium">Retry</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Loading State */}
          {loadingProfile && (
            <Animated.View
              entering={FadeInDown.springify()}
              className="mb-4 items-center py-8"
            >
              <ActivityIndicator size="large" color="#FF6B6B" />
              <Text className="text-gray-400 mt-2">Loading profile...</Text>
            </Animated.View>
          )}

          {/* Profile Header */}
          <ProfileHeader
            user={user}
            premiumStatus={premiumStatus}
            onClose={() => router.back()}
          />

          {/* Enhanced Statistics Section */}
          <Animated.View entering={FadeInDown.delay(300).springify()} className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-white">Statistics</Text>
              <TouchableOpacity
                onPress={() => router.push('/profile/stats' as any)}
                className="flex-row items-center px-3 py-1 rounded-full bg-blue-500/20"
              >
                <Text className="text-blue-400 text-sm mr-1">View All</Text>
                <Ionicons name="chevron-forward" size={16} color="#60A5FA" />
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap gap-3">
              <StatsCard
                title="Quizzes Taken"
                value={stats?.totalQuizzesTaken ?? user?.stats?.totalQuizzesTaken ?? 0}
                colors={['#10B981','#059669']}
                icon="library-outline"
                delay={100}
              />
              <StatsCard
                title="Tests Taken"
                value={stats?.totalTestsTaken ?? user?.stats?.totalTestsTaken ?? 0}
                colors={['#22D3EE','#06B6D4']}
                icon="document-text-outline"
                delay={200}
              />
              <StatsCard
                title="Average Score"
                value={`${Math.round((stats?.averageScore ?? user?.stats?.averageScore ?? 0) as number)}%`}
                colors={['#6366F1','#8B5CF6']}
                icon="trophy-outline"
                delay={300}
              />
              <StatsCard
                title="Current Streak"
                value={stats?.currentStreak ?? user?.stats?.currentStreak ?? 0}
                colors={['#F59E0B','#D97706']}
                icon="flame-outline"
                delay={400}
              />
              <StatsCard
                title="Correct Answers"
                value={stats?.correctAnswers ?? user?.stats?.correctAnswers ?? 0}
                colors={['#EF4444','#DC2626']}
                icon="checkmark-circle-outline"
                delay={500}
              />
              <StatsCard
                title="Total Answered"
                value={stats?.totalQuestionsAnswered ?? user?.stats?.totalQuestionsAnswered ?? 0}
                colors={['#A78BFA','#7C3AED']}
                icon="help-circle-outline"
                delay={600}
              />
            </View>
          </Animated.View>

          {/* Enhanced Preferences Section */}
          <Animated.View entering={FadeInDown.delay(400).springify()} className="mb-6">
            <Text className="text-xl font-bold text-white mb-4">Preferences</Text>
            <LinearGradient
              colors={['#1F2937', '#374151', '#4B5563']}
              className="rounded-2xl p-5 shadow-lg"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Notifications Toggle */}
              <Animated.View
                entering={SlideInRight.delay(100)}
                className="flex-row justify-between items-center mb-5 p-3 rounded-xl bg-black/10"
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center mr-3">
                    <Ionicons name="notifications-outline" size={20} color="#60A5FA" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-semibold">Push Notifications</Text>
                    <Text className="text-gray-400 text-sm">Get notified about new content</Text>
                  </View>
                </View>
                <TouchableOpacity
                  accessibilityRole="switch"
                  accessibilityState={{ checked: !!prefs.notifications }}
                  disabled={savingPrefs}
                  onPress={() => applyPrefsUpdate({ notifications: !prefs.notifications })}
                  className={`w-14 h-8 rounded-full p-1 ${prefs.notifications ? 'bg-green-500' : 'bg-gray-600'}`}
                >
                  <Animated.View
                    className={`w-6 h-6 rounded-full bg-white shadow-lg ${prefs.notifications ? 'ml-6' : 'ml-0'}`}
                    style={{
                      transform: [{ translateX: prefs.notifications ? 0 : 0 }]
                    }}
                  />
                </TouchableOpacity>
              </Animated.View>

              {/* Daily Reminder Toggle */}
              <Animated.View
                entering={SlideInRight.delay(200)}
                className="flex-row justify-between items-center mb-5 p-3 rounded-xl bg-black/10"
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-full bg-orange-500/20 items-center justify-center mr-3">
                    <Ionicons name="alarm-outline" size={20} color="#FB923C" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-semibold">Daily Reminder</Text>
                    <Text className="text-gray-400 text-sm">Daily study reminders</Text>
                  </View>
                </View>
                <TouchableOpacity
                  accessibilityRole="switch"
                  accessibilityState={{ checked: !!prefs.dailyReminder }}
                  disabled={savingPrefs}
                  onPress={() => applyPrefsUpdate({ dailyReminder: !prefs.dailyReminder })}
                  className={`w-14 h-8 rounded-full p-1 ${prefs.dailyReminder ? 'bg-green-500' : 'bg-gray-600'}`}
                >
                  <Animated.View
                    className={`w-6 h-6 rounded-full bg-white shadow-lg ${prefs.dailyReminder ? 'ml-6' : 'ml-0'}`}
                    style={{
                      transform: [{ translateX: prefs.dailyReminder ? 0 : 0 }]
                    }}
                  />
                </TouchableOpacity>
              </Animated.View>

              {/* Theme Selection */}
              <Animated.View entering={SlideInRight.delay(300)} className="mb-2">
                <View className="flex-row items-center mb-3">
                  <View className="w-10 h-10 rounded-full bg-purple-500/20 items-center justify-center mr-3">
                    <Ionicons name="color-palette-outline" size={20} color="#A78BFA" />
                  </View>
                  <View>
                    <Text className="text-white font-semibold">Theme</Text>
                    <Text className="text-gray-400 text-sm">Choose your preferred theme</Text>
                  </View>
                </View>

                <View className="flex-row bg-black/20 rounded-xl p-1">
                  {(['auto','light','dark'] as const).map((t) => (
                    <TouchableOpacity
                      key={t}
                      disabled={savingPrefs}
                      onPress={() => applyPrefsUpdate({ theme: t })}
                      className={`flex-1 py-3 rounded-lg ${prefs.theme === t ? 'bg-white/10 shadow-lg' : ''}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: prefs.theme === t }}
                      accessibilityLabel={`Set theme to ${t}`}
                    >
                      <View className="items-center">
                        <Ionicons
                          name={t === 'auto' ? 'phone-portrait-outline' : t === 'light' ? 'sunny-outline' : 'moon-outline'}
                          size={20}
                          color={prefs.theme === t ? '#FFFFFF' : '#9CA3AF'}
                        />
                        <Text className={`text-center text-sm mt-1 ${prefs.theme === t ? 'text-white font-semibold' : 'text-gray-400'}`}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>

              {savingPrefs && (
                <Animated.View
                  entering={FadeInUp}
                  className="flex-row items-center justify-center mt-3 p-2 rounded-lg bg-blue-500/10"
                >
                  <ActivityIndicator size="small" color="#60A5FA" />
                  <Text className="text-blue-400 text-sm ml-2">Saving preferences...</Text>
                </Animated.View>
              )}
            </LinearGradient>
          </Animated.View>

          {/* Enhanced Account Section */}
          <Animated.View entering={FadeInDown.delay(500).springify()} className="mb-6">
            <Text className="text-xl font-bold text-white mb-4">Account Settings</Text>
            <View className="space-y-3">
              {menuItems.map((item, index) => (
                <Animated.View
                  key={item.title}
                  entering={FadeInRight.delay(600 + index * 100).springify()}
                >
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={item.title}
                    onPress={() => router.push(item.route as any)}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    className="rounded-2xl overflow-hidden shadow-lg"
                    style={buttonAnimatedStyle}
                  >
                    <LinearGradient
                      colors={item.colors}
                      className="p-5 flex-row items-center"
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mr-4">
                        <Ionicons name={item.icon} size={24} color="white" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-white mb-1">{item.title}</Text>
                        <Text className="text-white/80 text-sm">{item.description}</Text>
                      </View>
                      <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center">
                        <Ionicons name="chevron-forward" size={18} color="white" />
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Enhanced Logout Section */}
          <Animated.View entering={FadeInDown.delay(1000).springify()}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Logout"
              onPress={handleLogout}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={buttonAnimatedStyle}
              className="bg-red-500/10 border-2 border-red-500/30 p-5 rounded-2xl flex-row items-center justify-center shadow-lg"
            >
              <View className="w-12 h-12 rounded-full bg-red-500/20 items-center justify-center mr-4">
                <Ionicons name="log-out-outline" size={24} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className="text-red-500 font-bold text-lg">Logout</Text>
                <Text className="text-red-400/80 text-sm">Sign out of your account</Text>
              </View>
              <View className="w-8 h-8 rounded-full bg-red-500/20 items-center justify-center">
                <Ionicons name="exit-outline" size={18} color="#EF4444" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

