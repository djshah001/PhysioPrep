import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, RefreshControl, Text, TextInput } from 'react-native';
import { useAuth } from 'hooks/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SubjectCard } from 'components/subject/SubjectCard';
import { EmptySubject } from 'components/subject/EmptySubject';
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

  // console.log(testState.Qs.length)

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
        <View className="mx-4 mt-4 animate-pulse rounded-2xl">
          <View className="h-12 w-full rounded-3xl bg-white shadow-lg " />
        </View>
        <ScrollView contentContainerClassName="flex-1 p-6 flex-row flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <View
              key={i}
              className={`mb-4 ${i % 2 !== 0 ? 'mr-3' : ''} h-40 w-[48%] animate-pulse rounded-2xl bg-card/30`}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background" edges={['bottom']}>
        <ScrollView
          contentContainerClassName="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={onRefresh}
              tintColor={colors.blue[500]}
            />
          }>
          <Text className="text-red-500">{error}</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!subjects || subjects.length === 0) {
    return (
      <SafeAreaView className="flex-1" edges={['bottom']}>
        <ScrollView
          className="p-6"
          contentContainerClassName="items-center justify-center flex-1"
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={onRefresh}
              tintColor={colors.blue[500]}
            />
          }>
          <EmptySubject type="subject" isAdmin={user?.role === 'admin'} href="/subjects/add" />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScrollView
        className="flex-1 p-6 py-6"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={colors.blue[500]} />
        }>
        <View className="mb-6">
          <View className="mb-3">
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search subjects"
              placeholderTextColor="#9CA3AF"
              className="h-13 rounded-3xl border border-neutral-400 bg-white px-4 text-base text-neutral-800 shadow-lg"
              accessibilityLabel="Search subjects"
            />
          </View>
          {/* <Button
            title="Start Comprehensive Test"
            onPress={() => router.push('/subjects/comprehensive-test')}
            className="h-12 justify-center rounded-3xl bg-neutral-900 shadow-md"
            textClassName="text-white font-bold"
          /> */}
        </View>

        <View className="flex flex-row flex-wrap">
          {filteredSubjects && filteredSubjects.length > 0 ? (
            filteredSubjects.map((subject, index) => (
              <View key={subject._id} className={`w-[48%] ${index % 2 === 0 ? 'mr-3' : ''}`}>
                <SubjectCard subject={subject} index={index} isAdmin={user?.role === 'admin'} />
              </View>
            ))
          ) : (
            <View className="mt-8 w-full items-center">
              <Text className="text-muted">No subjects match your search.</Text>
            </View>
          )}
        </View>
        <View className="h-32" />
      </ScrollView>
    </SafeAreaView>
  );
}
