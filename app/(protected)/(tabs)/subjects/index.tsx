import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, RefreshControl, Text, TextInput } from 'react-native';
import { useAuth } from 'hooks/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from 'constants/Colors';
import { SubjectCard } from 'components/subject/SubjectCard';
import { EmptySubject } from 'components/subject/EmptySubject';
import { useAtom, useSetAtom } from 'jotai';
import { subjectsAtom, loadingAtom, errorAtom, fetchSubjectsAtom } from 'store/subject';
import { Button } from 'components/ui/button';
import { useRouter } from 'expo-router';

export default function SubjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
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
        <Text className="text-red-500">{error}</Text>
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
            <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={Colors.primary} />
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
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={Colors.primary} />
        }>
        <View className="mb-4">
          <View className="flex-1 mb-2">
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search subjects..."
              placeholderTextColor="rgba(0,0,0,0.4)"
              className="h-12 px-4 rounded-2xl bg-card/10 text-base"
              accessibilityLabel="Search subjects"
            />
          </View>
            <Button
              title="Start Comprehensive Test"
              onPress={() => router.push('/subjects/comprehensive-test')}
              className="rounded-2xl bg-indigo-500 h-12 justify-center"
              textClassName="text-white font-bold"
            />
        </View>

        <View className="flex flex-row flex-wrap">
          {filteredSubjects && filteredSubjects.length > 0 ? (
            filteredSubjects.map((subject, index) => (
              <View key={subject._id} className={`w-[48%] ${index % 2 === 0 ? 'mr-3' : ''}`}>
                <SubjectCard subject={subject} index={index} isAdmin={user?.role === 'admin'} />
              </View>
            ))
          ) : (
            <View className="w-full items-center mt-8">
              <Text className="text-muted">No subjects match your search.</Text>
            </View>
          )}
        </View>
        <View className="h-32" />
      </ScrollView>
    </SafeAreaView>
  );
}
