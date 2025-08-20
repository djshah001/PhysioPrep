import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { Colors } from '~/Colors';
import { Ionicons } from '@expo/vector-icons';
import { cn } from 'lib/utils';
import { useState } from 'react';

export function SimpleSelect({
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
