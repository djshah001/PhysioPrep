import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from 'hooks/useAuth';
import { SubjectCard } from 'components/subject/SubjectCard';
import { EmptySubject } from 'components/subject/EmptySubject';
import { useAtom, useSetAtom } from 'jotai';
import { subjectsAtom, loadingAtom, errorAtom, fetchSubjectsAtom } from 'store/subject';
import colors from 'tailwindcss/colors';

// --- Skeleton Component for better UX ---
const ListSkeleton = () => (
  <View className="px-6">
    {[1, 2, 3, 4].map((i) => (
      <View key={i} className="mb-5 h-[140px] w-full rounded-[24px] bg-neutral-100 animate-pulse" />
    ))}
  </View>
);

export default function SubjectsPage() {
  const { user } = useAuth();
  const [subjects] = useAtom(subjectsAtom);
  const [loading] = useAtom(loadingAtom);
  const [error] = useAtom(errorAtom);
  const fetchSubjects = useSetAtom(fetchSubjectsAtom);
  const [query, setQuery] = useState('');

  // Initial Fetch
  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const onRefresh = useCallback(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // Optimized Filter
  const filteredSubjects = useMemo(() => {
    if (!query || !subjects) return subjects || [];
    const q = query.toLowerCase().trim();
    return subjects.filter((s: any) => {
      const title = (s.title || s.name || '').toString().toLowerCase();
      return title.includes(q);
    });
  }, [query, subjects]);

  // --- Render Components ---

  const renderHeader = () => (
    <Animated.View entering={FadeInDown.duration(500).springify()} className="bg-neutral-50 px-6 pt-4 pb-2">
      <View className="flex-row justify-between items-center mb-4">
        <View>
            <Text className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">
                Curriculum
            </Text>
            <Text className="text-4xl font-black text-neutral-900 tracking-tight">
                Subjects
            </Text>
        </View>
        {/* Admin Add Button (Optional) */}
        {user?.role === 'admin' && (
            <TouchableOpacity className="bg-indigo-600 h-10 w-10 rounded-full items-center justify-center shadow-lg shadow-indigo-200">
                <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );

  const renderSearchBar = () => (
    <View className="bg-neutral-50 px-6 pb-6 pt-2">
      <View className="flex-row items-center bg-white border border-neutral-200 rounded-2xl px-4 py-3.5 shadow-sm shadow-neutral-100">
        <Ionicons name="search" size={20} color={colors.neutral[400]} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search for a subject..."
          placeholderTextColor={colors.neutral[400]}
          className="flex-1 ml-3 text-base text-neutral-900 font-medium h-full"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={10}>
            <Ionicons name="close-circle" size={20} color={colors.neutral[300]} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="px-6 py-10 items-center">
      {!loading && (
        <>
            <View className="h-24 w-24 bg-neutral-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="library-outline" size={40} color={colors.neutral[400]} />
            </View>
            <Text className="text-lg font-bold text-neutral-800 text-center">
                {query ? 'No matches found' : 'No subjects available'}
            </Text>
            <Text className="text-neutral-500 text-center mt-2 mb-6">
                {query ? `We couldn't find "${query}".` : 'Check back later for new content.'}
            </Text>
            {user?.role === 'admin' && (
                <EmptySubject type="subject" isAdmin={true} href="/subjects/add" />
            )}
        </>
      )}
    </View>
  );

  // Main Render
  if (error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-neutral-50">
        <Ionicons name="cloud-offline" size={64} color={colors.red[400]} />
        <Text className="mt-4 font-bold text-lg text-neutral-800">Something went wrong</Text>
        <Text className="text-neutral-500 mb-6">{error}</Text>
        <TouchableOpacity onPress={onRefresh} className="bg-neutral-900 px-6 py-3 rounded-full">
          <Text className="text-white font-bold">Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['top']}>
      <FlatList
        data={filteredSubjects}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <View className="px-6">
             <SubjectCard subject={item} index={index} />
          </View>
        )}
        
        // Header Composition
        ListHeaderComponent={() => (
            <>
                {renderHeader()}
                {renderSearchBar()}
            </>
        )}
        stickyHeaderIndices={[0]} // Makes the header sticky! Ensure the index matches the component order if separating.
        // Actually, to make ONLY search bar sticky, we need to restructure.
        // For simplicity with this design, let's keep it fluid or use a different sticky strategy. 
        // NOTE: Sticky headers in FlatList refer to the index of the DATA.
        // To make a custom component sticky, we usually put it OUTSIDE the list or use `stickyHeaderIndices` on a SectionList.
        // Here, we will just let it scroll naturally for a cleaner "Magazine" feel.

        ListEmptyComponent={loading ? <ListSkeleton /> : renderEmptyState}
        
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={onRefresh}
        
        // Performance Props
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
  );
}