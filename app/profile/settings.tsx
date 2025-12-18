import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAtom } from 'jotai';
import { userAtom } from '../../store/auth';
import { updateUserPreferences } from 'actions/user';

const SettingItem = ({ label, icon, value, onToggle, isLink, onPress, color = '#4B5563' }: any) => (
  <TouchableOpacity
    onPress={isLink ? onPress : undefined}
    className="flex-row items-center justify-between border-b border-neutral-100 py-4">
    <View className="flex-row items-center">
      <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-neutral-50">
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text className="text-base font-medium text-neutral-800">{label}</Text>
    </View>

    {isLink ? (
      <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
    ) : (
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
      />
    )}
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const [user, setUser] = useAtom(userAtom);
  const [prefs, setPrefs] = useState(
    user?.preferences || { notifications: true, theme: 'light' }
  );

  const updatePref = async (key: string, val: any) => {
    const newPrefs = { ...prefs, [key]: val };
    setPrefs(newPrefs);
    // Optimistic update
    setUser((prev) => ({ ...prev, preferences: newPrefs }) as any);
    // API call
    try {
      await updateUserPreferences(newPrefs);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['top']}>
      {/* <View className="flex-row items-center border-b border-neutral-200 bg-white px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4 rounded-full bg-neutral-100 p-2">
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-neutral-900">Settings</Text>
      </View> */}

      <ScrollView className="flex-1 px-6">
        <View className="mb-8 mt-6">
          <Text className="mb-2 text-sm font-bold uppercase tracking-wider text-neutral-500">
            Preferences
          </Text>
          <View className="rounded-2xl border border-neutral-100 bg-white px-4 shadow-sm">
            <SettingItem
              label="Push Notifications"
              icon="notifications-outline"
              color="#F59E0B"
              value={prefs.notifications}
              onToggle={(v: boolean) => updatePref('notifications', v)}
            />
            {/* <SettingItem
              label="Email Updates"
              icon="mail-outline"
              color="#EC4899"
              value={prefs.emailNotifications}
              onToggle={(v: boolean) => updatePref('emailNotifications', v)}
            /> */}
            <SettingItem
              label="Dark Mode"
              icon="moon-outline"
              color="#6366F1"
              value={prefs.theme === 'dark'}
              onToggle={(v: boolean) => updatePref('theme', v ? 'dark' : 'light')}
            />
          </View>
        </View>

        <View className="mb-8">
          <Text className="mb-2 text-sm font-bold uppercase tracking-wider text-neutral-500">
            Support
          </Text>
          <View className="rounded-2xl border border-neutral-100 bg-white px-4 shadow-sm">
            <SettingItem label="Help Center" icon="help-buoy-outline" isLink onPress={() => {}} />
            <SettingItem
              label="Privacy Policy"
              icon="lock-closed-outline"
              isLink
              onPress={() => {}}
            />
            <SettingItem
              label="Terms of Service"
              icon="document-text-outline"
              isLink
              onPress={() => {}}
            />
          </View>
        </View>

        <View className="items-center py-6">
          <Text className="text-xs text-neutral-400">PhysioPrep App v1.0.2 (Build 450)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
