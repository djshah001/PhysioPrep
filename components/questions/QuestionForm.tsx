import React, { useState } from 'react';
import { View, Text, Pressable} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { QuestionFormValues } from 'types/types';
import { Colors } from 'constants/Colors';
import { SimpleSelect } from 'components/ui/SimpleSelect';


interface QuestionFormProps {
  mode: 'add' | 'edit';
  initialValues?: QuestionFormValues;
  onSubmit: (values: QuestionFormValues) => void;
  loading?: boolean;
}

const DIFFICULTY_OPTIONS = [
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' },
];
const TIER_OPTIONS = [
  { label: 'Free', value: 'free' },
  { label: 'Premium', value: 'premium' },
];



export const QuestionForm: React.FC<QuestionFormProps> = ({
  mode,
  initialValues,
  onSubmit,
  loading,
}) => {
  const [form, setForm] = useState<QuestionFormValues>(
    initialValues || {
      text: '',
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
      ],
      explanation: '',
      difficulty: 'medium',
      tier: 'free',
    }
  );

  const handleTextChange = (field: keyof QuestionFormValues, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...form.options];
    newOptions[index].text = value;
    setForm((prev) => ({ ...prev, options: newOptions }));
  };

  const setCorrectOption = (index: number) => {
    const newOptions = form.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setForm((prev) => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    if (form.options.length < 5) {
      setForm((prev) => ({
        ...prev,
        options: [...prev.options, { text: '', isCorrect: false }],
      }));
    }
  };

  const removeOption = (index: number) => {
    if (form.options.length > 2) {
      let newOptions = form.options.filter((_, i) => i !== index);
      // Ensure there's always one correct answer
      if (!newOptions.some((opt) => opt.isCorrect)) {
        newOptions[0].isCorrect = true;
      }
      setForm((prev) => ({ ...prev, options: newOptions }));
    }
  };

  const handleSubmit = () => {
    // Basic validation
    if (!form.text.trim() || form.options.some((opt) => !opt.text.trim())) {
      // Add user-facing error
      return;
    }
    onSubmit(form);
  };

  return (
    <>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="p-6 pb-32"
        keyboardShouldPersistTaps="handled">
        <Input
          label="Question Text"
          value={form.text}
          onChangeText={(v) => handleTextChange('text', v)}
          multiline
          numberOfLines={3}
          blurTint="dark"
          blurIntensity={80}
        />
        <View className="my-4">
          <Text className="mb-2 text-lg font-medium text-foreground">Options</Text>
          {form.options.map((option, index) => (
            <View key={index} className="mb-3 flex-row items-center gap-2">
              <Pressable onPress={() => setCorrectOption(index)} className="p-2">
                <Ionicons
                  name={option.isCorrect ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color={option.isCorrect ? Colors.primary : Colors.grey}
                />
              </Pressable>
              <Input
                placeholder={`Option ${index + 1}`}
                value={option.text}
                onChangeText={(v) => handleOptionChange(index, v)}
                className="flex-1"
                blurTint="dark"
              />
              <Pressable
                onPress={() => removeOption(index)}
                disabled={form.options.length <= 2}
                className="p-2">
                <Ionicons name="remove-circle-outline" size={24} color={Colors.destructive} />
              </Pressable>
            </View>
          ))}
          <Button
            title="Add Option"
            onPress={addOption}
            disabled={form.options.length >= 5}
            leftIcon="add"
            className="mt-2 self-start bg-grey2 px-3 py-2"
            textClassName="text-foreground"
          />
        </View>

        <Input
          label="Explanation"
          value={form.explanation}
          onChangeText={(v) => handleTextChange('explanation', v)}
          multiline
          numberOfLines={3}
          blurTint="dark"
          blurIntensity={80}
        />

        <SimpleSelect
          label="Difficulty"
          value={form.difficulty}
          options={DIFFICULTY_OPTIONS}
          onSelect={(v) => handleTextChange('difficulty', v)}
        />
        <SimpleSelect
          label="Tier"
          value={form.tier}
          options={TIER_OPTIONS}
          onSelect={(v) => handleTextChange('tier', v)}
        />
      </ScrollView>
      <View className="px-6 pb-6">
        <Button
          title={mode === 'add' ? 'Add Question' : 'Save Changes'}
          onPress={handleSubmit}
          loading={loading}
          className="mt-6 bg-primary"
        />
      </View>
    </>
  );
};