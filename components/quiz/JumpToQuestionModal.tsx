import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import colors from 'tailwindcss/colors';

const { height } = Dimensions.get('window');

interface JumpModalProps {
  visible: boolean;
  currentIndex: number;
  totalQuestions: number;
  answers?: (number | null)[]; // Optional array to show answered status
  onJump: (idx: number) => void;
  onClose: () => void;
  submitting?: boolean;
}

export default function JumpToQuestionModal({
  visible,
  currentIndex,
  totalQuestions,
  answers = [], // Default to empty if not provided
  onJump,
  onClose,
  submitting,
}: JumpModalProps) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {/* Backdrop with Blur effect */}
      <Animated.View
        entering={FadeIn}
        className="flex-1 items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm">
        {/* Main Card */}
        <Animated.View
          entering={ZoomIn.springify().damping(70)}
          className="w-full max-w-sm overflow-hidden rounded-[24px] bg-white shadow-2xl"
          style={{ maxHeight: height * 0.7 }}>
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons name="view-grid" size={20} color={colors.indigo[600]} />
              <Text className="text-lg font-bold text-slate-800">Question Map</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="rounded-full bg-slate-200/50 p-1">
              <Ionicons name="close" size={18} color={colors.slate[500]} />
            </TouchableOpacity>
          </View>

          {/* Grid Scroll Area */}
          <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
            <View className="flex-row flex-wrap justify-start gap-2">
              {Array.from({ length: totalQuestions }).map((_, idx) => {
                const isCurrent = currentIndex === idx;
                const isAnswered = answers[idx] !== undefined && answers[idx] !== null;

                // Determine Styles based on state
                let bgClass = 'bg-slate-50';
                let borderClass = 'border-slate-200';
                let textClass = 'text-slate-500';

                if (isCurrent) {
                  bgClass = 'bg-indigo-600';
                  borderClass = 'border-indigo-600';
                  textClass = 'text-white';
                } else if (isAnswered) {
                  bgClass = 'bg-indigo-50';
                  borderClass = 'border-indigo-200';
                  textClass = 'text-indigo-700';
                }

                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => onJump(idx)}
                    disabled={submitting}
                    className={`h-10 w-10 items-center justify-center rounded-xl border ${bgClass} ${borderClass}`}>
                    <Text className={`font-bold ${textClass}`}>{idx + 1}</Text>

                    {/* Tiny dot for answered state if not current */}
                    {!isCurrent && isAnswered && (
                      <View className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Legend Footer */}
          <View className="flex-row items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
            <View className="flex-row items-center gap-1.5">
              <View className="h-3 w-3 rounded-full bg-indigo-600" />
              <Text className="text-xs font-medium text-slate-500">Current</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="h-3 w-3 rounded-full border border-indigo-200 bg-indigo-50" />
              <Text className="text-xs font-medium text-slate-500">Answered</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="h-3 w-3 rounded-full border border-slate-200 bg-slate-50" />
              <Text className="text-xs font-medium text-slate-500">Empty</Text>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
