import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../../hooks/useAuth';
import { useAtom } from 'jotai';
import { userAtom } from '../../store/auth';
import { useProAccess } from '../../hooks/useProAccess';
import { fetchUserProfile } from 'actions/user';
// Updated service import

// --- Components ---

const MenuItem = ({ 
  icon, 
  title, 
  subtitle, 
  color, 
  onPress, 
  delay = 0 
}: { 
  icon: keyof typeof Ionicons.glyphMap; 
  title: string; 
  subtitle: string; 
  color: string; 
  onPress: () => void;
  delay?: number;
}) => (
  <Animated.View entering={FadeInDown.delay(delay).springify()}>
    <TouchableOpacity 
      onPress={onPress}
      className="mb-3 flex-row items-center rounded-2xl bg-white p-4 shadow-sm active:bg-neutral-50"
    >
      <View className={`mr-4 h-12 w-12 items-center justify-center rounded-xl bg-opacity-10`} style={{ backgroundColor: `${color}20` }}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-neutral-800">{title}</Text>
        <Text className="text-xs text-neutral-500">{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
    </TouchableOpacity>
  </Animated.View>
);

const ProBanner = ({ hasPro, onPress }: { hasPro: boolean; onPress: () => void }) => (
  <Animated.View entering={FadeInDown.delay(200).springify()} className="mb-6">
    <TouchableOpacity onPress={onPress}>
      <LinearGradient
        colors={hasPro ? ['#10B981', '#059669'] : ['#6366F1', '#4F46E5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="relative overflow-hidden rounded-3xl p-6 shadow-lg shadow-indigo-500/20"
      >
        <View className="z-10 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-white">
              {hasPro ? 'Pro Active' : 'Upgrade to Pro'}
            </Text>
            <Text className="text-indigo-100">
              {hasPro ? 'You have full access' : 'Unlock unlimited tests & stats'}
            </Text>
          </View>
          <View className="h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <Ionicons name={hasPro ? "checkmark-circle" : "diamond"} size={24} color="white" />
          </View>
        </View>
        
        {/* Decorative Circles */}
        <View className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
        <View className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10" />
      </LinearGradient>
    </TouchableOpacity>
  </Animated.View>
);

export default function UserProfile() {
  const router = useRouter();
  const { logout } = useAuth();
  const [user, setUser] = useAtom(userAtom);
  const { getProAccessInfo } = useProAccess();
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Use the extended profile data structure from our new backend
  const [profileData, setProfileData] = useState<any>(null);

  const proInfo = getProAccessInfo();

  const loadData = async () => {
    try {
      const res = await fetchUserProfile();
      if (res.success) {
        setProfileData(res.data);
        setUser(prev => ({ ...prev, ...res.data })); // Sync basic user data
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout }
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="px-6 pt-4 pb-8">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-3xl font-bold text-neutral-900">Profile</Text>
            <TouchableOpacity onPress={() => router.push('/profile/settings')} className="p-2 bg-white rounded-full shadow-sm">
                <Ionicons name="settings-outline" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center">
            <View className="relative">
              <Image 
                source={{ uri: user?.avatar || 'https://ui-avatars.com/api/?name=' + user?.name }} 
                className="h-24 w-24 rounded-full border-4 border-white shadow-md"
              />
              <View className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full bg-indigo-500 border-2 border-white">
                <Text className="text-xs font-bold text-white">{profileData?.gamification?.level || 1}</Text>
              </View>
            </View>
            <View className="ml-5 flex-1">
              <Text className="text-2xl font-bold text-neutral-900">{user?.name}</Text>
              <Text className="text-neutral-500">{user?.email}</Text>
              <View className="mt-2 flex-row flex-wrap gap-2">
                 {/* Badge Chip */}
                 <View className="rounded-full bg-amber-100 px-3 py-1">
                    <Text className="text-xs font-bold text-amber-700">
                        {profileData?.gamification?.badge?.icon || '🥉'} {profileData?.gamification?.badge?.name || 'Novice'}
                    </Text>
                 </View>
                 {/* Rank Chip */}
                 <View className="rounded-full bg-slate-100 px-3 py-1">
                    <Text className="text-xs font-bold text-slate-700">
                        #{profileData?.gamification?.rank || '-'} Global
                    </Text>
                 </View>
              </View>
            </View>
          </View>
        </View>

        <View className="px-6">
            {/* Pro Banner */}
            <ProBanner 
                hasPro={proInfo.hasProAccess} 
                onPress={() => !proInfo.hasProAccess && router.push('/subscription')} 
            />

            {/* Stats Preview Card */}
            <Animated.View entering={FadeInDown.delay(300).springify()} className="mb-6">
                <TouchableOpacity 
                    onPress={() => router.push('/profile/stats')}
                    className="rounded-3xl bg-white p-5 shadow-sm border border-neutral-100"
                >
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold text-neutral-800">Overview</Text>
                        <Text className="text-indigo-600 font-semibold text-sm">See Details</Text>
                    </View>
                    <View className="flex-row justify-between">
                        <View className="items-center flex-1">
                            <Text className="text-2xl font-bold text-neutral-900">{profileData?.stats?.streak || 0}</Text>
                            <Text className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Streak</Text>
                        </View>
                        <View className="w-[1px] bg-neutral-100 h-full" />
                        <View className="items-center flex-1">
                            <Text className="text-2xl font-bold text-neutral-900">{profileData?.stats?.totalQuestions || 0}</Text>
                            <Text className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Questions</Text>
                        </View>
                        <View className="w-[1px] bg-neutral-100 h-full" />
                        <View className="items-center flex-1">
                            <Text className="text-2xl font-bold text-neutral-900">{profileData?.stats?.accuracy || 0}%</Text>
                            <Text className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Accuracy</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>

            <Text className="mb-4 text-lg font-bold text-neutral-800">Account</Text>

            <MenuItem 
                icon="person-outline" 
                title="Personal Details" 
                subtitle="Name, Bio, Avatar" 
                color="#3B82F6" 
                onPress={() => router.push('/profile/edit')}
                delay={400}
            />
            <MenuItem 
                icon="notifications-outline" 
                title="Notifications" 
                subtitle="Email & Push Preferences" 
                color="#F59E0B" 
                onPress={() => router.push('/profile/settings')}
                delay={500}
            />
            <MenuItem 
                icon="lock-closed-outline" 
                title="Security" 
                subtitle="Password & Authentication" 
                color="#10B981" 
                onPress={() => router.push('/profile/security')}
                delay={600}
            />

            <Animated.View entering={FadeInDown.delay(700).springify()} className="mt-4">
                <TouchableOpacity 
                    onPress={handleLogout}
                    className="flex-row items-center justify-center rounded-2xl border-2 border-red-100 bg-red-50 p-4"
                >
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    <Text className="ml-2 font-bold text-red-500">Log Out</Text>
                </TouchableOpacity>
            </Animated.View>

            <Text className="mt-8 text-center text-xs text-neutral-400">Version 1.0.0 • PhysioPrep</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}