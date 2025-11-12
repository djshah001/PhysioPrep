
import api from '~/api';
import { ProStatus, ProFeature } from '../store/pro';

// API response interfaces
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  errors?: { msg: string }[];
}

interface ProStatusResponse {
  isPro: boolean;
  isProActive: boolean;
  proExpiresAt: string | null;
  proActivatedAt: string | null;
  hasProAccess: boolean;
  isPremium: boolean;
  isPremiumActive: boolean;
  premiumExpiry: string | null;
}

interface ProFeaturesResponse {
  features: ProFeature[];
  totalFeatures: number;
}

interface ProStatsResponse {
  totalProUsers: number;
  activeProUsers: number;
  expiredProUsers: number;
  conversionRate: string;
}

// Get user's pro status
export const getProStatus = async (): Promise<ProStatus> => {
  try {
    const response = await api.get<ApiResponse<ProStatusResponse>>('/pro/status');
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.errors?.[0]?.msg || 'Failed to fetch pro status');
    }

    const data = response.data.data;
    return {
      isPro: data.isPro,
      isProActive: data.isProActive,
      proExpiresAt: data.proExpiresAt ? new Date(data.proExpiresAt) : null,
      proActivatedAt: data.proActivatedAt ? new Date(data.proActivatedAt) : null,
      hasProAccess: data.hasProAccess,
      isPremium: data.isPremium,
      isPremiumActive: data.isPremiumActive,
      premiumExpiry: data.premiumExpiry ? new Date(data.premiumExpiry) : null,
    };
  } catch (error: any) {
    console.error('Get pro status error:', error);
    throw new Error(error.response?.data?.errors?.[0]?.msg || 'Failed to fetch pro status');
  }
};

// Get pro features list
export const getProFeatures = async (): Promise<ProFeature[]> => {
  try {
    const response = await api.get<ApiResponse<ProFeaturesResponse>>('/pro/features');
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.errors?.[0]?.msg || 'Failed to fetch pro features');
    }

    return response.data.data.features;
  } catch (error: any) {
    console.error('Get pro features error:', error);
    throw new Error(error.response?.data?.errors?.[0]?.msg || 'Failed to fetch pro features');
  }
};

// Activate pro subscription (admin/testing only for now)
export const activatePro = async (userId?: string, expiresAt?: Date): Promise<ProStatus> => {
  try {
    const requestData: any = {};
    if (userId) requestData.userId = userId;
    if (expiresAt) requestData.expiresAt = expiresAt.toISOString();

    const response = await api.post<ApiResponse<{ message: string; user: ProStatusResponse }>>('/pro/activate', requestData);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.errors?.[0]?.msg || 'Failed to activate pro subscription');
    }

    const userData = response.data.data.user;
    return {
      isPro: userData.isPro,
      isProActive: userData.isProActive,
      proExpiresAt: userData.proExpiresAt ? new Date(userData.proExpiresAt) : null,
      proActivatedAt: userData.proActivatedAt ? new Date(userData.proActivatedAt) : null,
      hasProAccess: userData.hasProAccess,
      isPremium: userData.isPremium,
      isPremiumActive: userData.isPremiumActive,
      premiumExpiry: userData.premiumExpiry ? new Date(userData.premiumExpiry) : null,
    };
  } catch (error: any) {
    console.error('Activate pro error:', error);
    throw new Error(error.response?.data?.errors?.[0]?.msg || 'Failed to activate pro subscription');
  }
};

// Deactivate pro subscription (admin/testing only for now)
export const deactivatePro = async (userId?: string): Promise<ProStatus> => {
  try {
    const requestData: any = {};
    if (userId) requestData.userId = userId;

    const response = await api.post<ApiResponse<{ message: string; user: ProStatusResponse }>>('/pro/deactivate', requestData);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.errors?.[0]?.msg || 'Failed to deactivate pro subscription');
    }

    const userData = response.data.data.user;
    return {
      isPro: userData.isPro,
      isProActive: userData.isProActive,
      proExpiresAt: userData.proExpiresAt ? new Date(userData.proExpiresAt) : null,
      proActivatedAt: userData.proActivatedAt ? new Date(userData.proActivatedAt) : null,
      hasProAccess: userData.hasProAccess,
      isPremium: userData.isPremium,
      isPremiumActive: userData.isPremiumActive,
      premiumExpiry: userData.premiumExpiry ? new Date(userData.premiumExpiry) : null,
    };
  } catch (error: any) {
    console.error('Deactivate pro error:', error);
    throw new Error(error.response?.data?.errors?.[0]?.msg || 'Failed to deactivate pro subscription');
  }
};

// Get pro statistics (admin only)
export const getProStats = async (): Promise<ProStatsResponse> => {
  try {
    const response = await api.get<ApiResponse<ProStatsResponse>>('/pro/stats');
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.errors?.[0]?.msg || 'Failed to fetch pro statistics');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Get pro stats error:', error);
    throw new Error(error.response?.data?.errors?.[0]?.msg || 'Failed to fetch pro statistics');
  }
};
