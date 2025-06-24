import React, { useEffect } from 'react';
import { View, ScrollView, RefreshControl, Text } from 'react-native';
import { useAuth } from 'hooks/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from 'constants/Colors';
import { SubjectCard } from 'components/subject/SubjectCard';
import { EmptySubject } from 'components/subject/EmptySubject';
import { useAtom, useSetAtom } from 'jotai';
import { subjectsAtom, loadingAtom, errorAtom, fetchSubjectsAtom } from 'store/subject';

export default function SubjectsPage() {
  const { user } = useAuth();
  const [subjects] = useAtom(subjectsAtom);
  const [loading] = useAtom(loadingAtom);
  const [error] = useAtom(errorAtom);
  const fetchSubjects = useSetAtom(fetchSubjectsAtom);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const onRefresh = () => {
    fetchSubjects();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
        <ScrollView className="flex-1 p-6">
          {[1, 2, 3].map((i) => (
            <View key={i} className="mb-4 h-32 animate-pulse rounded-2xl bg-card/50" />
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
        className="flex-1 p-6"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={Colors.primary} />
        }>
        <View className="flex flex-row flex-wrap gap-1">
          {subjects.map((subject, index) => (
            <View key={subject._id} className="w-full md:w-[48%]">
              <SubjectCard subject={subject} index={index} isAdmin={user?.role === 'admin'} />
            </View>
          ))}
        </View>
        <View className="h-32" /> 
      </ScrollView>
    </SafeAreaView>
  );
}
