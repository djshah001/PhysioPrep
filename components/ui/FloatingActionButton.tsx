import React, { useState } from 'react';
import { View, Text, Pressable, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Action {
  icon: string;
  label: string;
  onPress: () => void;
}

interface FloatingActionButtonProps {
  actions: Action[];
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ actions }) => {
  const [open, setOpen] = useState(false);

  return (
    <View className="absolute bottom-8 right-6 z-50">
      <Pressable
        className="bg-primary rounded-full p-4 shadow-lg"
        onPress={() => setOpen(true)}
        accessibilityLabel="Open actions menu"
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/30 justify-end"
          activeOpacity={1}
          onPressOut={() => setOpen(false)}
        >
          <View className="bg-card rounded-t-3xl p-6 pb-10">
            {actions.map((action, idx) => (
              <Pressable
                key={action.label}
                className="flex-row items-center py-3"
                onPress={() => {
                  setOpen(false);
                  setTimeout(action.onPress, 200);
                }}
                accessibilityLabel={action.label}
              >
                <Ionicons name={action.icon as any} size={22} color="#6366F1" className="mr-3" />
                <Text className="text-lg text-foreground">{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}; 