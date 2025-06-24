import { useState } from 'react';
import { ScrollView, Alert, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from 'services/api';
import { Button } from '~/ui/button';
import { AxiosError } from 'axios';
import { SubjectForm } from 'components/subject/SubjectForm';
import { Subject } from 'types/types';
import { useSetAtom } from 'jotai';
import { subjectsAtom } from 'store/subject';
import { handleError } from 'lib/utils';

const initialSubjectState: Partial<Subject> = {
  name: '',
  description: '',
  icon: 'heart-outline',
  color: '#FF0000',
  isActive: true,
};

export default function AddSubjectPage() {
  const router = useRouter();
  const [subject, setSubject] = useState<Subject>(initialSubjectState as Subject);
  const [loading, setLoading] = useState(false);
  const setSubjects = useSetAtom(subjectsAtom);

  const handleChange = (field: keyof Subject, value: string | boolean) => {
    setSubject((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const trimmedName = subject.name?.trim();

    if (!trimmedName) {
      Alert.alert('Error', 'Please enter a subject name');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: trimmedName,
        description: subject.description?.trim() || '',
        icon: subject.icon,
        color: subject.color,
        isActive: subject.isActive,
      };
      const response = await api.post('/subjects', payload);
      const newSubject = response.data.data;
      console.log(`Created subject: ${JSON.stringify(newSubject, null, 2)}`);

      setSubjects((prev) => [...prev, newSubject]);
      router.back();
    } catch (error) {
      handleError(error as AxiosError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView
          contentContainerClassName="p-6 pb-32"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <SubjectForm subject={subject} onFieldChange={handleChange} loading={loading} />
        </ScrollView>
        <View className="p-6 pt-2">
          <Button
            onPress={handleSubmit}
            disabled={loading || !subject.name?.trim()}
            className="py-4"
            title="Create Subject"
            leftIcon="add-outline"
            loading={loading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
