import { useStripe } from '@stripe/stripe-react-native';
import api from './api';
import { useAtom } from 'jotai';
import { userAtom } from 'store/auth';
import { proStatusAtom } from 'store/pro';

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export interface PaymentConfirmationResponse {
  message: string;
  user: {
    id: string;
    isPro: boolean;
    proActivatedAt: string;
    proExpiresAt: string | null;
  };
}

export interface PaymentHistoryItem {
  amount: number;
  currency: string;
  date: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  stripePaymentIntentId: string;
  description: string;
}

export interface PaymentHistoryResponse {
  paymentHistory: PaymentHistoryItem[];
  totalPayments: number;
  totalAmount: number;
}

// Create a payment intent for Pro subscription
export const createPaymentIntent = async (): Promise<PaymentIntentResponse> => {
  try {
    const response = await api.post('/stripe/create-payment-intent');

    if (!response.data.success) {
      throw new Error(response.data.errors?.[0]?.msg || 'Failed to create payment intent');
    }

    return response.data.data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Confirm payment and activate Pro subscription
export const confirmPayment = async (
  paymentIntentId: string
): Promise<PaymentConfirmationResponse> => {
  try {
    const response = await api.post('/stripe/confirm-payment', { paymentIntentId });

    if (!response.data.success) {
      throw new Error(response.data.errors?.[0]?.msg || 'Failed to confirm payment');
    }

    return response.data.data;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

// Get user's payment history
export const getPaymentHistory = async (): Promise<PaymentHistoryResponse> => {
  try {
    const response = await api.get('/stripe/payment-history');

    if (!response.data.success) {
      throw new Error(response.data.errors?.[0]?.msg || 'Failed to fetch payment history');
    }

    return response.data.data;
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
};

// Payment processing hook
export const usePaymentProcessing = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [user, setUser] = useAtom(userAtom);
  const [isPro, setIsPro] = useAtom(proStatusAtom);

  const processPayment = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      // Step 1: Create payment intent
      const paymentIntent = await createPaymentIntent();

      // Step 2: Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'PhysioPrep',
        paymentIntentClientSecret: paymentIntent.clientSecret,
        defaultBillingDetails: {
          name: 'PhysioPrep User',
        },
        allowsDelayedPaymentMethods: false,
        returnURL: 'physioprep://payment-return',
      });

      if (initError) {
        console.error('Error initializing payment sheet:', initError);
        return { success: false, error: initError.message };
      }

      // Step 3: Present payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        console.error('Error presenting payment sheet:', presentError);
        return { success: false, error: presentError.message };
      }

      // Step 4: Confirm payment on backend
      const confirmation = await confirmPayment(paymentIntent.paymentIntentId);
      console.log('Payment confirmed:', confirmation);

      setUser((prevUser) =>
        prevUser
          ? {
              ...prevUser,
              isPro: confirmation.user.isPro,
              proActivatedAt: confirmation.user.proActivatedAt,
              proExpiresAt: confirmation.user.proExpiresAt,
            }
          : prevUser
      );

      setIsPro((prevProStatus) => (
        prevProStatus
          ? {
              ...prevProStatus,
              isPro: confirmation.user.isPro,
              isProActive: confirmation.user.isPro,
              proExpiresAt: confirmation.user.proExpiresAt ? new Date(confirmation.user.proExpiresAt) : null,
              proActivatedAt: confirmation.user.proActivatedAt ? new Date(confirmation.user.proActivatedAt) : null,
              hasProAccess: confirmation.user.isPro,
            }
          : prevProStatus

       
      ));

      return { success: true };
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    }
  };

  return { processPayment };
};
