import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  RefreshControl,
  Image,
  TouchableOpacity,
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
import { useAtom } from 'jotai';
import { userAtom, isLoggedInAtom } from '../../store/auth';
import { proStatusAtom } from '../../store/pro';
import { useProAccess } from '../../hooks/useProAccess';
import { cancelProSubscription, getPaymentHistory } from '../../services/payment';
import api from '../../services/api';

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

// Utility functions
const formatDate = (d: string | null) => (d ? new Date(d).toLocaleDateString() : 'Never');

const formatMemberSince = (d: string | null) => {
  if (!d) return 'Unknown';
  const date = new Date(d);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });
};

const calculateDaysSince = (d: string | null) => {
  if (!d) return 0;
  const date = new Date(d);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
};

// Profile Header Component
const ProfileHeader = ({
  user,
  proInfo,
}: {
  user: any;
  proInfo: {
    hasProAccess: boolean;
    isPro: boolean;
    isProActive: boolean;
    proExpiresAt: Date | null;
    showUpgradePrompt: boolean;
  };
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
          colors={['#374151', '#4B5563', '#6B7280']}
          className="rounded-3xl p-4 shadow-2xl overflow-hidden"
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>

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
              <Text className="mb-1 text-base text-neutral-300">{user?.email}</Text>
              <Text className="mb-3 text-sm text-neutral-400">
                Member since {formatMemberSince(user?.createdAt)}
              </Text>

              <View className="flex-row flex-wrap items-center">
                {/* Pro Status Badge */}
                {proInfo.hasProAccess ? (
                  <View className="mb-2 mr-3 rounded-full bg-rose-500/20 px-4 py-2">
                    <Text className="text-sm font-semibold text-rose-400">Pro Active</Text>
                  </View>
                ) : (
                  <View className="mb-2 mr-3 rounded-full bg-neutral-500/20 px-4 py-2">
                    <Text className="text-sm font-semibold text-neutral-400">Free</Text>
                  </View>
                )}

                {/* Google OAuth Badge */}
                {user?.provider === 'google' && (
                  <View className="mb-2 mr-3 rounded-full bg-blue-500/20 px-4 py-2">
                    <Text className="text-sm font-semibold text-blue-400">Google</Text>
                  </View>
                )}

                {/* Admin Badge */}
                {user?.role === 'admin' && (
                  <View className="mb-2 mr-3 rounded-full bg-purple-500/20 px-4 py-2">
                    <Text className="text-sm font-semibold text-purple-400">Admin</Text>
                  </View>
                )}

                {/* Email Verified Badge */}
                {user?.isEmailVerified && (
                  <View className="mb-2 rounded-full bg-green-500/20 px-4 py-2">
                    <Text className="text-sm font-semibold text-green-400">Verified</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Pro Subscription Details */}
          {proInfo.hasProAccess && user?.proActivatedAt && (
            <View className="mt-4 border-t border-neutral-600/50 pt-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-sm font-medium text-white">Pro Subscription</Text>
                  <Text className="text-xs text-neutral-400">
                    Activated {formatDate(user.proActivatedAt)} • Lifetime Access
                  </Text>
                  <Text className="text-xs text-neutral-400">
                    {calculateDaysSince(user.proActivatedAt)} days active
                  </Text>
                </View>
                <View className="h-8 w-8 items-center justify-center rounded-full bg-rose-500/20">
                  <Ionicons name="star" size={16} color="#FB7185" />
                </View>
              </View>
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
  const [user, setUser] = useAtom(userAtom);
  const [proStatus, setProStatus] = useAtom(proStatusAtom);
  const { getProAccessInfo } = useProAccess();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellationLoading, setCancellationLoading] = useState(false);
  const scale = useSharedValue(1);

  // Get Pro access information
  const proInfo = getProAccessInfo();

  // Calculate cancellation eligibility
  const canCancelSubscription = () => {
    if (!proInfo.hasProAccess || !user?.proActivatedAt) return false;
    const daysSinceActivation = calculateDaysSince(user.proActivatedAt);
    return daysSinceActivation <= 5;
  };

  const daysRemainingForCancellation = () => {
    if (!user?.proActivatedAt) return 0;
    const daysSinceActivation = calculateDaysSince(user.proActivatedAt);
    return Math.max(0, 5 - daysSinceActivation);
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

        // Update Pro status atom with fresh data
        if (fresh) {
          setProStatus({
            isPro: fresh.isPro || false,
            isProActive: fresh.isPro || false,
            proExpiresAt: fresh.proExpiresAt ? new Date(fresh.proExpiresAt) : null,
            proActivatedAt: fresh.proActivatedAt ? new Date(fresh.proActivatedAt) : null,
            hasProAccess: fresh.isPro || false,
            isPremium: fresh.isPremium || false,
            isPremiumActive: fresh.isPremiumActive || false,
            premiumExpiry: fresh.premiumExpiry ? new Date(fresh.premiumExpiry) : null,
          });
        }
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

  // Handle Pro subscription cancellation
  const handleCancelSubscription = async () => {
    Alert.alert(
      'Cancel Pro Subscription',
      `Are you sure you want to cancel your Pro subscription? This action cannot be undone.\n\nYou have ${daysRemainingForCancellation()} day(s) remaining to cancel.`,
      [
        {
          text: 'Keep Pro',
          style: 'cancel',
        },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancellationLoading(true);
              const result = await cancelProSubscription();

              // Immediately update atoms to revoke Pro access
              setProStatus({
                isPro: false,
                isProActive: false,
                proExpiresAt: new Date(),
                proActivatedAt: user?.proActivatedAt ? new Date(user.proActivatedAt) : null,
                hasProAccess: false,
                isPremium: false,
                isPremiumActive: false,
                premiumExpiry: null,
              });

              // Update user atom
              if (user) {
                setUser({
                  ...user,
                  isPro: false,
                  isProActive: false,
                  proExpiresAt: new Date().toISOString(),
                });
              }

              Alert.alert(
                'Subscription Cancelled',
                'Your Pro subscription has been successfully cancelled. You now have access to free features only.',
                [{ text: 'OK' }]
              );
            } catch (error: any) {
              console.error('Cancellation error:', error);
              Alert.alert(
                'Cancellation Failed',
                error.message || 'Failed to cancel subscription. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setCancellationLoading(false);
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserProfile();
    setRefreshing(false);
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
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-32"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FB7185"
            colors={['#FB7185']}
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
              <ProfileHeader user={user} proInfo={proInfo} />

          {/* Pro Subscription Management Section */}
          {proInfo.hasProAccess && (
            <Animated.View entering={FadeInDown.delay(200).springify()} className="mb-6">
              <Text className="mb-4 text-xl font-bold text-neutral-800">Pro Subscription</Text>
              <LinearGradient
                colors={['#FB7185', '#F43F5E', '#E11D48']}
                className="rounded-2xl p-5 shadow-lg overflow-hidden"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <View className="mb-4 flex-row items-center justify-between">
                  <View>
                    <Text className="text-lg font-bold text-white">Pro Active</Text>
                    <Text className="text-sm text-white/80">Lifetime Access</Text>
                  </View>
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-white/20">
                    <Ionicons name="star" size={24} color="white" />
                  </View>
                </View>

                {user?.proActivatedAt && (
                  <View className="mb-4">
                    <Text className="text-sm text-white/80">
                      Activated: {formatDate(user.proActivatedAt)}
                    </Text>
                    <Text className="text-sm text-white/80">
                      Active for {calculateDaysSince(user.proActivatedAt)} days
                    </Text>
                  </View>
                )}

                <View className="flex-row gap-3">
                  <Button
                    title="Payment History"
                    onPress={() => router.push('/profile/payment-history' as any)}
                    className="flex-1 rounded-xl bg-white/20 p-3"
                    textClassName="text-sm font-medium text-white"
                    leftIcon="receipt-outline"
                    leftIconSize={16}
                    leftIconColor="white"
                  />

                  {canCancelSubscription() && (
                    <Button
                      title={`Cancel (${daysRemainingForCancellation()}d left)`}
                      onPress={handleCancelSubscription}
                      disabled={cancellationLoading}
                      className="flex-1 rounded-xl bg-white/20 p-3"
                      textClassName="text-sm font-medium text-white"
                      leftIcon="close-circle-outline"
                      leftIconSize={16}
                      leftIconColor="white"
                    />
                  )}
                </View>

                {cancellationLoading && (
                  <View className="mt-3 flex-row items-center justify-center">
                    <Text className="text-sm text-white/80">Processing cancellation...</Text>
                  </View>
                )}
              </LinearGradient>
            </Animated.View>
          )}

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
                colors={['#06B6D4', '#0891B2']}
                icon="document-text-outline"
                delay={200}
              />
              <StatsCard
                title="Average Score"
                value={`${Math.round((stats?.averageScore ?? user?.stats?.averageScore ?? 0) as number)}%`}
                colors={['#8B5CF6', '#7C3AED']}
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
                colors={['#A855F7', '#9333EA']}
                icon="help-circle-outline"
                delay={600}
              />
            </View>
          </Animated.View>



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
                rightIcon="exit-outline"
                rightIconSize={18}
                rightIconColor="#FEE2E2"
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
