import RazorpayCheckout from 'react-native-razorpay';
import { useAtom } from 'jotai';
import { userAtom } from 'store/auth';
import { proStatusAtom } from 'store/pro';
import api from './api';

// Razorpay API functions
const getOrderId = async (): Promise<{ order_id: string; amount: number; currency: string; key: string }> => {
  try {
    const response = await api.get('/razorpay/order');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching Razorpay order ID:', error);
    throw error;
  }
};

const verifyPayment = async (paymentData: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => {
  try {
    const response = await api.post('/razorpay/verify-signature', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

// Get payment history
export const getPaymentHistory = async (limit = 10) => {
  try {
    const response = await api.get(`/razorpay/payments?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
};

// Restore subscription
export const restoreSubscription = async () => {
  try {
    const response = await api.post('/razorpay/restore');
    return response.data;
  } catch (error) {
    console.error('Error restoring subscription:', error);
    throw error;
  }
};

// Payment processing hook
export const usePaymentProcessing = () => {
  const [user, setUser] = useAtom(userAtom);
  const [, setIsPro] = useAtom(proStatusAtom);

  const processPayment = async (): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      // Step 1: Get Razorpay order details from backend
      const orderData = await getOrderId();

      // Step 2: Open Razorpay checkout
      const options = {
        description: 'Lifetime Access to PhysioPrep Pro',
        image: 'assets/logo.png', // Logo image path
        currency: orderData.currency,
        key: orderData.key,
        amount: orderData.amount.toString(),
        name: 'PhysioPrep Pro',
        order_id: orderData.order_id,
        prefill: {
          email: user?.email || '',
          name: user?.name || '',
        },
        theme: { color: '#F59E0B' }, // Amber color to match Pro theme
      };

      // Step 3: Open Razorpay payment interface
      const paymentResult = await RazorpayCheckout.open(options);

      if (paymentResult.razorpay_order_id && paymentResult.razorpay_payment_id && paymentResult.razorpay_signature) {
        // Step 4: Verify payment with backend
        const verificationResult = await verifyPayment({
          razorpay_order_id: paymentResult.razorpay_order_id,
          razorpay_payment_id: paymentResult.razorpay_payment_id,
          razorpay_signature: paymentResult.razorpay_signature,
        });

        if (verificationResult.success) {
          // Step 5: Update local state with server-confirmed data
          const userData = verificationResult.data.user;

          setIsPro({
            isPro: userData.isPro,
            isProActive: userData.isProActive,
            hasProAccess: userData.hasProAccess,
            proActivatedAt: new Date(userData.proActivatedAt),
            proExpiresAt: null, // Lifetime access
          });

          if (user) {
            setUser((prevUser) =>
              prevUser
                ? {
                    ...prevUser,
                    isPro: userData.isPro,
                    isProActive: userData.isProActive,
                    hasProAccess: userData.hasProAccess,
                    proActivatedAt: userData.proActivatedAt,
                    proExpiresAt: null,
                  }
                : prevUser
            );
          }

          return {
            success: true,
            message: 'Payment successful! Pro subscription activated.',
          };
        } else {
          return {
            success: false,
            error: 'Payment verification failed. Please contact support.'
          };
        }
      } else {
        return {
          success: false,
          error: 'Payment was not completed successfully.'
        };
      }

    } catch (error) {
      console.error('Payment processing error:', error);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('User cancelled')) {
          return { success: false, error: 'Payment was cancelled.' };
        }
        if (error.message.includes('Network')) {
          return { success: false, error: 'Network error. Please check your connection and try again.' };
        }
      }

      return {
        success: false,
        error: 'Payment failed. Please try again or contact support.',
      };
    }
  };

  return { processPayment };
};

// Subscription restoration hook
export const useSubscriptionRestore = () => {
  const [user, setUser] = useAtom(userAtom);
  const [, setIsPro] = useAtom(proStatusAtom);

  const restorePurchase = async (): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      const result = await restoreSubscription();

      if (result.success) {
        // Update local state with restored subscription data
        const userData = result.data.user;

        setIsPro({
          isPro: userData.isPro,
          isProActive: userData.isProActive,
          hasProAccess: userData.hasProAccess,
          proActivatedAt: new Date(userData.proActivatedAt),
          proExpiresAt: null, // Lifetime access
        });

        if (user) {
          setUser((prevUser) =>
            prevUser
              ? {
                  ...prevUser,
                  isPro: userData.isPro,
                  isProActive: userData.isProActive,
                  hasProAccess: userData.hasProAccess,
                  proActivatedAt: userData.proActivatedAt,
                  proExpiresAt: null,
                }
              : prevUser
          );
        }

        return {
          success: true,
          message: result.data.message,
        };
      } else {
        return {
          success: false,
          error: 'No previous purchases found to restore.',
        };
      }
    } catch (error) {
      console.error('Subscription restore error:', error);
      return {
        success: false,
        error: 'Failed to restore subscription. Please try again.',
      };
    }
  };

  return { restorePurchase };
};
