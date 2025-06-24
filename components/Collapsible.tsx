import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Collapsible: React.FC<CollapsibleProps> = ({ title, children, className }) => {
  const [open, setOpen] = useState(false);
  return (
    <View className={className}>
      <TouchableOpacity onPress={() => setOpen((o) => !o)} className="flex-row items-center gap-1">
        <Text className="font-bold text-base">{title}</Text>
        <Text>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && <View className="mt-1 ml-6">{children}</View>}
    </View>
  );
};
