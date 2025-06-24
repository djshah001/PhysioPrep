import React from 'react';
import { View, Text } from 'react-native';
import { MenuOption, MenuOptionProps } from 'react-native-popup-menu';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from 'constants/Colors';

interface PopupMenuOptionProps extends Omit<MenuOptionProps, 'children'> {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  onSelect: () => void;
  style?: any;
  color?: string;
}

export const PopupMenuOption: React.FC<PopupMenuOptionProps> = ({
  icon,
  text,
  onSelect,
  style,
  color,
  ...rest
}) => (
  <MenuOption onSelect={onSelect} {...rest} customStyles={style}>
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 10,
          paddingHorizontal: 16,
          // borderBottomWidth: 1,
          // borderBottomColor: Colors.primary,
        },
        style?.optionWrapper,
      ]}>
      <Ionicons name={icon} size={20} color={color || Colors.primary} />
      <Text
        style={[
          {
            color: color || Colors.primary,
            fontSize: 16,
            fontWeight: '500',
            marginLeft: 10,
          },
          style?.optionText,
        ]}>
        {text}
      </Text>
    </View>
  </MenuOption>
);
