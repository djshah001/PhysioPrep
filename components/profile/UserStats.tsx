import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStats } from '../../services/api';

interface Activity {
  date: string;
  type: 'quiz' | 'test';
  score: number;
}

interface SubjectStats {
  name: string;
  averageScore: number;
  quizCount: number;
}

interface Stats {
  quizHistory: any[];
  testHistory: any[];
  averageQuizScore: number;
  averageTestScore: number;
  recentActivity: Activity[];
  subjectStats: SubjectStats[];
}

export default function UserStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="p-4">
          <Text className="text-red-600">{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="p-4">
          <Text className="text-2xl font-bold text-black mb-6">
            Your Statistics
          </Text>

          <View className="space-y-4">
            {/* Overall Stats */}
            <View className="bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-lg font-semibold text-black mb-3">
                Overall Performance
              </Text>
              <View className="space-y-2">
                <Text className="text-base text-gray-700">
                  Total Quizzes Taken: {stats?.quizHistory?.length || 0}
                </Text>
                <Text className="text-base text-gray-700">
                  Total Tests Taken: {stats?.testHistory?.length || 0}
                </Text>
                <Text className="text-base text-gray-700">
                  Average Quiz Score: {stats?.averageQuizScore?.toFixed(1) || 0}%
                </Text>
                <Text className="text-base text-gray-700">
                  Average Test Score: {stats?.averageTestScore?.toFixed(1) || 0}%
                </Text>
              </View>
            </View>

            {/* Recent Activity */}
            <View className="bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-lg font-semibold text-black mb-3">
                Recent Activity
              </Text>
              <View className="space-y-3">
                {stats?.recentActivity?.map((activity, index) => (
                  <View key={index} className="border-b border-gray-100 pb-2">
                    <Text className="text-sm text-gray-500">
                      {new Date(activity.date).toLocaleDateString()}
                    </Text>
                    <Text className="text-base text-gray-700">
                      {activity.type === 'quiz' ? 'Quiz' : 'Test'}: {activity.score}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Subject Performance */}
            <View className="bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-lg font-semibold text-black mb-3">
                Subject Performance
              </Text>
              <View className="flex-row flex-wrap -mx-2">
                {stats?.subjectStats?.map((subject, index) => (
                  <View key={index} className="w-1/2 px-2 mb-4">
                    <View className="bg-gray-50 rounded-lg p-3">
                      <Text className="text-base font-medium text-black mb-2">
                        {subject.name}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        Average Score: {subject.averageScore?.toFixed(1) || 0}%
                      </Text>
                      <Text className="text-sm text-gray-600">
                        Quizzes Taken: {subject.quizCount || 0}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 