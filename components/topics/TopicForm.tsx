import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, Text, Switch } from 'react-native';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollView } from 'react-native-gesture-handler';
import { handleError } from 'lib/utils';
import { AxiosError } from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { TopicFormValues } from 'types/types';

interface TopicFormProps {
  mode: 'add' | 'edit';
  initialValues?: TopicFormValues;
  loading?: boolean;
  onSubmit: (values: TopicFormValues) => Promise<void>;
  isAdmin?: boolean;
}

export function TopicForm({
  mode,
  initialValues,
  loading = false,
  onSubmit,
  isAdmin = false,
}: TopicFormProps) {
  const [topicName, setTopicName] = useState(initialValues?.topicName || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [isActive, setIsActive] = useState(initialValues?.isActive ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({ topicName, description, isActive });
    } catch (error) {
      handleError(error as AxiosError);
    } finally {
      setIsSubmitting(false);
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
          <Input
            label="Topic Name"
            placeholder="Enter topic name"
            value={topicName}
            onChangeText={setTopicName}
            editable={!isSubmitting && !loading}
            maxLength={60}
          />
          <Input
            label="Description"
            placeholder="Enter description"
            value={description}
            onChangeText={setDescription}
            editable={!isSubmitting && !loading}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
          {isAdmin && (
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-lg font-medium text-foreground">Active</Text>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                disabled={isSubmitting || loading}
                trackColor={{ false: '#f87171', true: '#34d399' }}
                thumbColor={isActive ? '#10b981' : '#ef4444'}
              />
            </View>
          )}
          {error && <Text className="mb-2 text-red-500">{error}</Text>}
        </ScrollView>
        <View className="p-6">
          <Button
            title={
              isSubmitting
                ? mode === 'add'
                  ? 'Adding...'
                  : 'Saving...'
                : mode === 'add'
                  ? 'Add Topic'
                  : 'Save Changes'
            }
            onPress={handleSubmit}
            disabled={isSubmitting || loading || !topicName.trim()}
            leftIcon={mode === 'add' ? 'add-circle-outline' : 'save-outline'}
            className="mt-4 bg-primary py-4 text-white disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-50 "
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
