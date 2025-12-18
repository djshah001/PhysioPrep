import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, RefreshControl, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuth } from 'hooks/useAuth';
import { SubjectCard } from 'components/subject/SubjectCard';
import { EmptySubject } from 'components/subject/EmptySubject';
import { SubjectsScreenSkeleton } from 'components/skeletons/SubjectsScreenSkeleton';
import { useAtom, useSetAtom } from 'jotai';
import { subjectsAtom, loadingAtom, errorAtom, fetchSubjectsAtom } from 'store/subject';
import colors from 'tailwindcss/colors';

export default function SubjectsPage() {
  const { user } = useAuth();
  const [subjects] = useAtom(subjectsAtom);
  const [loading] = useAtom(loadingAtom);
  const [error] = useAtom(errorAtom);
  const fetchSubjects = useSetAtom(fetchSubjectsAtom);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const onRefresh = () => {
    fetchSubjects();
  };

  const filteredSubjects = useMemo(() => {
    if (!query || !subjects) return subjects;
    const q = query.toLowerCase().trim();
    return subjects.filter((s: any) => {
      const title = (s.title || s.name || '').toString().toLowerCase();
      return title.includes(q);
    });
  }, [query, subjects]);

  // Loading State
  if (loading && !subjects?.length) {
    return <SubjectsScreenSkeleton />;
  }

  // Error State
  if (error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-neutral-50" edges={['top']}>
        <View className="items-center px-6">
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <Ionicons name="cloud-offline-outline" size={40} color="#EF4444" />
          </View>
          <Text className="text-center text-xl font-bold text-neutral-800">
            Unable to load subjects
          </Text>
          <Text className="mt-2 text-center text-neutral-500 mb-8 px-4">
            {error || "Check your internet connection and try again."}
          </Text>
          <TouchableOpacity
            onPress={onRefresh}
            className="rounded-full bg-neutral-900 px-8 py-3 shadow-lg"
          >
            <Text className="font-bold text-white">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={onRefresh} 
            tintColor={colors.indigo[500]} 
            colors={[colors.indigo[500]]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Animated.View entering={FadeInDown.duration(600).springify()} className="px-6 pt-6 pb-4">
          <View className="flex-row justify-between items-start mb-2">
            <View>
              <Text className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">
                Library
              </Text>
              <Text className="text-4xl font-black text-neutral-900 tracking-tight">
                Subjects
              </Text>
            </View>
            <TouchableOpacity 
              onPress={onRefresh}
              className="p-2 bg-white rounded-full shadow-sm border border-neutral-100"
            >
              <Ionicons name="reload" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
          <Text className="text-base text-neutral-500 leading-6 max-w-[90%]">
            Select a subject to start practicing questions and quizzes.
          </Text>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View 
          entering={FadeInDown.delay(100).duration(600).springify()} 
          className="px-6 pb-6 pt-2"
        >
          <View className="flex-row items-center rounded-[20px] bg-white px-5 py-4 shadow-sm border border-neutral-200/80">
            <Ionicons name="search" size={22} color="#9CA3AF" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search topics..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 text-base text-neutral-900 font-medium"
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={10}>
                <Ionicons name="close-circle" size={20} color="#D1D5DB" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Subjects Grid */}
        <View className="px-6">
          {!subjects || subjects.length === 0 ? (
            <Animated.View entering={FadeInUp.delay(200).springify()}>
                <EmptySubject type="subject" isAdmin={user?.role === 'admin'} href="/subjects/add" />
            </Animated.View>
          ) : filteredSubjects && filteredSubjects.length > 0 ? (
            <View className="flex-row flex-wrap justify-between">
              {filteredSubjects.map((subject, index) => (
                <Animated.View 
                  key={subject._id} 
                  // entering={FadeInUp.delay(index * 100).springify().damping(14)}
                  // layout={Layout.springify()}
                  className="w-[48%] mb-5" // 48% width allows 2 columns with a ~4% gap
                >
                  <SubjectCard 
                    subject={subject} 
                    index={index} 
                    isAdmin={user?.role === 'admin'} 
                  />
                </Animated.View>
              ))}
            </View>
          ) : (
            <Animated.View entering={FadeInUp.springify()} className="items-center py-24 px-10">
              <View className="h-24 w-24 rounded-full bg-neutral-100 items-center justify-center mb-6 border border-neutral-200">
                <Ionicons name="search-outline" size={40} color="#9CA3AF" />
              </View>
              <Text className="text-xl font-bold text-neutral-800 text-center">No matches found</Text>
              <Text className="text-neutral-500 text-center mt-2 leading-6">
                We couldn&#39;t find any subjects matching &quot;<Text className="font-semibold text-neutral-800">{query}</Text>&quot;.
              </Text>
              <TouchableOpacity 
                onPress={() => setQuery('')}
                className="mt-8"
              >
                <Text className="text-indigo-600 font-bold">Clear Search</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}