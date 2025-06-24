import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from 'services/api';
import { CustomHeader } from 'components/common/CustomHeader';
import { useAtom, useSetAtom } from 'jotai';
import { subjectAtom, subjectsAtom } from 'store/subject';
import { Subject } from 'types/types';
import { Button } from '~/ui/button';
import { Colors } from 'constants/Colors';
import { SubjectForm } from 'components/subject/SubjectForm';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditSubjectPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [subjects, setSubjects] = useAtom(subjectsAtom);
  const sub = useSetAtom(subjectAtom);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (subjects.length > 0 && id) {
      const foundSubject = subjects.find((sub) => sub._id === id);
      if (foundSubject) {
        setSubject(foundSubject);
      } else {
        Alert.alert('Error', 'Subject not found');
        router.back();
      }
    }
    setInitialLoading(false);
  }, [id, subjects, router]);

  const handleChange = (field: keyof Subject, value: string | boolean) => {
    setSubject((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSubmit = async () => {
    if (!subject?.name?.trim()) {
      Alert.alert('Error', 'Please enter a subject name');
      return;
    }
    if (!subject) return;

    setLoading(true);
    try {
      const payload = {
        name: subject.name.trim(),
        description: subject.description?.trim() || '',
        icon: subject.icon,
        color: subject.color,
        isActive: subject.isActive,
      };
      const res = await api.put(`/subjects/${id}`, payload);
      console.log(`Updated subject:`, JSON.stringify(res.data.data, null, 2));
      const updatedSubject = res.data.data;
      sub(updatedSubject); // Update the subject atom

      setSubjects((prevSubjects) =>
        prevSubjects.map((s) => (s._id === id ? { ...s, ...payload } : s))
      );

      router.back();
    } catch (error) {
      console.error('Error updating subject:', error);
      Alert.alert('Error', 'Failed to update subject. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading || !subject) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <CustomHeader title="Loading..." showBack />
        <View className="flex-1 items-center justify-center">
          <Ionicons name="sync" size={24} color={Colors.primary} className="animate-spin" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <CustomHeader title="Edit Subject" showBack />
      <ScrollView className="flex-1 p-6" contentContainerClassName="pb-20">
        <SubjectForm subject={subject} onFieldChange={handleChange} loading={loading} />
        <Button
          title="Save Changes"
          onPress={handleSubmit}
          className="mt-4 rounded-full py-4"
          loading={loading}
          disabled={loading || !subject?.name?.trim()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
