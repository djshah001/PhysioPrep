import React, { useMemo } from 'react';
import { View, Text, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import colors from 'tailwindcss/colors';

// Components
import { Button } from 'components/ui/button';

// --- Types ---
interface SubmissionModalProps {
  visible: boolean;
  onClose: () => void;
  score: number;
  total: number;
  time: number;
}

// --- Helper: Stat Box ---
const StatBox = ({ label, value, icon, color, delay }: any) => (
  <Animated.View 
    entering={FadeInUp.delay(delay).springify()}
    className="items-center justify-center bg-slate-50 rounded-2xl p-3 flex-1 mx-1 border border-slate-100"
  >
    <MaterialCommunityIcons name={icon} size={20} color={color} style={{ marginBottom: 4 }} />
    <Text className="text-lg font-black text-slate-800">{value}</Text>
    <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</Text>
  </Animated.View>
);

// --- Main Component ---
export default function SubmissionModal({
  visible,
  onClose,
  score,
  total,
  time,
}: SubmissionModalProps) {

  // Determine UI state based on score
  const resultState = useMemo(() => {
    if (score >= 80) {
      return {
        title: 'Outstanding!',
        message: 'You have mastered this topic.',
        icon: 'trophy',
        colors: ['#F59E0B', '#D97706'], // Amber
        accent: colors.amber[500],
      };
    }
    if (score >= 50) {
      return {
        title: 'Good Job!',
        message: 'Keep practicing to reach the top.',
        icon: 'star-face',
        colors: ['#3B82F6', '#2563EB'], // Blue
        accent: colors.blue[500],
      };
    }
    return {
      title: 'Keep Trying',
      message: 'Don\'t give up, review your answers.',
      icon: 'book-open-page-variant',
      colors: ['#64748B', '#475569'], // Slate
      accent: colors.slate[500],
    };
  }, [score]);

  // Format time (e.g., 02:45)
  const formattedTime = `${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, '0')}`;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm">
        
        {/* Main Card */}
        <Animated.View 
          entering={ZoomIn.springify().damping(60)}
          className="w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl items-center"
        >
          
          {/* Header Icon */}
          <View className="mb-6 -mt-12 shadow-lg shadow-black/20">
            <LinearGradient
              colors={resultState.colors as any}
              className="h-24 w-24 rounded-full items-center justify-center border-4 border-white"
            >
              <MaterialCommunityIcons name={resultState.icon as any} size={48} color="white" />
            </LinearGradient>
          </View>

          {/* Text Content */}
          <Text className="text-3xl font-black text-slate-800 text-center mb-2">
            {resultState.title}
          </Text>
          <Text className="text-slate-500 text-center mb-8 px-4 leading-5">
            {resultState.message}
          </Text>

          {/* Stats Grid */}
          <View className="flex-row justify-between w-full mb-8">
            <StatBox 
              label="Score" 
              value={`${score}%`} 
              icon="percent" 
              color={resultState.accent} 
              delay={100} 
            />
            <StatBox 
              label="Correct" 
              value={`${Math.round((score / 100) * total)}/${total}`} 
              icon="check-circle-outline" 
              color={colors.emerald[500]} 
              delay={200} 
            />
            <StatBox 
              label="Time" 
              value={formattedTime} 
              icon="clock-outline" 
              color={colors.indigo[500]} 
              delay={300} 
            />
          </View>

          {/* Action Button */}
          <Button
            title="Review Answers"
            onPress={onClose}
            className=" bg-indigo-600 rounded-2xl py-4 shadow-lg shadow-indigo-100"
            // style={{ backgroundColor: colors.indigo[600] }}
            textClassName="text-white font-bold text-lg"
            rightIcon="arrow-forward"
          />

        </Animated.View>
      </View>
    </Modal>
  );
}