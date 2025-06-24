import React from 'react';
import { View, Text, Switch } from 'react-native';
import { Subject } from 'types/types';
import { Input } from '~/ui/input';
import { Colors } from 'constants/Colors';

interface SubjectFormProps {
  subject: Partial<Subject>;
  onFieldChange: (field: keyof Subject, value: string | boolean) => void;
  loading: boolean;
}

export const SubjectForm: React.FC<SubjectFormProps> = ({ subject, onFieldChange, loading }) => {
  return (
    <>
      <View className="mb-6">
        <Text className="mb-2 text-lg font-medium text-foreground">Subject Name</Text>
        <Input
          value={subject.name || ''}
          onChangeText={(v) => onFieldChange('name', v)}
          placeholder="Enter subject name"
          editable={!loading}
          autoFocus
        />
      </View>

      <View className="mb-6">
        <Text className="mb-2 text-lg font-medium text-foreground">Description</Text>
        <Input
          value={subject.description || ''}
          onChangeText={(v) => onFieldChange('description', v)}
          placeholder="Enter subject description"
          editable={!loading}
          multiline
          className="h-28"
          textAlignVertical="top"
        />
      </View>

      <View className="mb-6">
        <Text className="mb-2 text-lg font-medium text-foreground">Icon Name</Text>
        <Input
          value={subject.icon || ''}
          onChangeText={(v) => onFieldChange('icon', v)}
          placeholder="e.g., 'heart-outline' (from Ionicons)"
          editable={!loading}
        />
      </View>

      <View className="mb-6">
        <Text className="mb-2 text-lg font-medium text-foreground">Color</Text>
        <Input
          value={subject.color || ''}
          onChangeText={(v) => onFieldChange('color', v)}
          placeholder="e.g., '#FF6347' or 'blue'"
          editable={!loading}
        />
      </View>

      <View className="mb-6 flex-row items-center justify-between rounded-xl bg-card/50 p-4">
        <Text className="text-lg font-medium text-foreground">Active Subject</Text>
        <Switch
          trackColor={{ false: Colors.grey, true: Colors.primary }}
          thumbColor={Colors.white}
          ios_backgroundColor={Colors.grey}
          onValueChange={(v) => onFieldChange('isActive', v)}
          value={subject.isActive === undefined ? true : subject.isActive}
          disabled={loading}
        />
      </View>
    </>
  );
};
