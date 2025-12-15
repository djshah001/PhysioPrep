import { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Button } from '../../components/ui/button';
import { getPaymentHistory, PaymentHistoryItem } from '../../services/payment';

export default function PaymentHistoryPage() {
  const router = useRouter();
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentHistory = async () => {
    try {
      setError(null);
      const data = await getPaymentHistory();
      setPaymentHistory(data.paymentHistory);
    } catch (err: any) {
      setError(err.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPaymentHistory();
    setRefreshing(false);
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'canceled': return 'text-neutral-600';
      default: return 'text-neutral-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded': return 'checkmark-circle';
      case 'failed': return 'close-circle';
      case 'canceled': return 'ban';
      default: return 'time';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <View className="flex-row items-center justify-between p-4 border-b border-neutral-200">
        <Button
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-neutral-100"
          leftIcon="arrow-back"
          leftIconSize={20}
          leftIconColor="#525252"
        />
        <Text className="text-lg font-bold text-neutral-800">Payment History</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View className="p-4">
          {loading ? (
            <Text className="text-center text-neutral-600">Loading...</Text>
          ) : error ? (
            <View className="rounded-xl border border-red-500/30 bg-red-500/15 p-4">
              <Text className="text-red-600">{error}</Text>
            </View>
          ) : paymentHistory.length === 0 ? (
            <View className="items-center py-8">
              <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
              <Text className="mt-4 text-lg font-medium text-neutral-600">No payments found</Text>
              <Text className="text-sm text-neutral-500">Your payment history will appear here</Text>
            </View>
          ) : (
            paymentHistory.map((payment, index) => (
              <Animated.View
                key={payment.stripePaymentIntentId}
                entering={FadeInDown.delay(index * 100)}
                className="mb-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-medium text-neutral-800">{payment.description}</Text>
                    <Text className="text-sm text-neutral-600">
                      {new Date(payment.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="font-bold text-neutral-800">
                      {formatAmount(payment.amount, payment.currency)}
                    </Text>
                    <View className="flex-row items-center">
                      <Ionicons
                        name={getStatusIcon(payment.status)}
                        size={16}
                        color={payment.status === 'succeeded' ? '#059669' : payment.status === 'failed' ? '#DC2626' : '#6B7280'}
                      />
                      <Text className={`ml-1 text-sm capitalize ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
