import { API_BASE_URL } from '../config/api';

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: 'pk_test_51ST36hLtdpcHp4l1u7DM6FiX4rugvS0VOYq093GLAsYk5kYlmzu10PFgqSsTKDr05wgz6kn7nM43EM9DPubJ1NjZ00ou7v09Oq',
  merchantIdentifier: 'merchant.physioprep.app',
  urlScheme: 'physioprep',
};

// Fetch publishable key from server (for production)
export const fetchPublishableKey = async (): Promise<string> => {
  try {
    // In development, return the test key directly
    if (__DEV__) {
      return STRIPE_CONFIG.publishableKey;
    }

    // In production, fetch from your server
    const response = await fetch(`${API_BASE_URL}/api/stripe/config`);
    const data = await response.json();
    
    if (data.success) {
      return data.data.publishableKey;
    }
    
    throw new Error('Failed to fetch publishable key');
  } catch (error) {
    console.error('Error fetching publishable key:', error);
    // Fallback to test key in case of error
    return STRIPE_CONFIG.publishableKey;
  }
};

// Test card numbers for development
export const TEST_CARDS = {
  SUCCESS: '4242424242424242',
  DECLINED: '4000000000000002',
  REQUIRES_AUTHENTICATION: '4000002500003155',
  INSUFFICIENT_FUNDS: '4000000000009995',
};

export default STRIPE_CONFIG;
