import React, { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { QuestionFormValues } from 'types/types';
import { Colors } from 'constants/Colors';
import { cn } from 'lib/utils';


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

function SimpleSelect({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onSelect: (v: string) => void;
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const selected = options.find((o) => o.value === value)?.label || '';
  return (
    <View className="mb-2">
      <Text className="mb-1 text-lg font-medium text-foreground">{label}</Text>
      <Pressable
        className="border-border flex-row items-center justify-between rounded-lg border bg-card px-4 py-3"
        onPress={() => setModalVisible(true)}>
        <Text className="text-base text-white">{selected}</Text>
        <Ionicons name="chevron-down" size={20} color={Colors.primary} />
      </Pressable>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <Pressable
          className="flex-1 items-center justify-center bg-black/40"
          onPress={() => setModalVisible(false)}>
          <View className="w-72 rounded-xl bg-card p-4">
            <Text className="mb-2 text-lg font-bold text-foreground">Select {label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  className="flex-row items-center px-2 py-3"
                  onPress={() => {
                    onSelect(item.value);
                    setModalVisible(false);
                  }}>
                  <Text
                    className={cn(
                      'text-base',
                      value === item.value ? 'font-bold text-primary' : 'text-foreground'
                    )}>
                    {item.label}
                  </Text>
                  {value === item.value && (
                    <Ionicons name="checkmark" size={18} color={Colors.primary} className="ml-2" />
                  )}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

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

export { SimpleSelect };
