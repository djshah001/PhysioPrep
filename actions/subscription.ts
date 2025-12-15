'use server';

import { cancelProSubscription } from '../services/payment';
import { handleApiError } from '../utils/handleApiError';

export async function cancelSubscription() {
  try {
    const result = await cancelProSubscription();
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return handleApiError(error);
  }
}
