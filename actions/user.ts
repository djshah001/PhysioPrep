import api from 'services/api';
import { User } from 'store/auth';
import { BadgeDetails, UserHomeStats } from 'store/home';

// --- Interfaces ---

export interface UserStatsResponse {
  success: boolean;
  data: UserHomeStats;
}

export interface UserProfileResponse {
  success: boolean;
  data: User & {
    // Add specific profile extensions returned by getProfile controller
    subscription?: {
      status: string;
      plan: string;
      expiresAt: string;
    };
    gamification?: {
      rank: number;
      badge: BadgeDetails;
      nextLevel: {
        percent: number;
        currentXP: number;
        requiredXP: number;
      };
    };
    stats?: {
      streak: number;
      totalQuestions: number;
      totalQuizzes: number;
      averageScore: number;
      accuracy: number;
      lastActive: string;
    };
    insights?: {
      strongestSubjects: { name: string; accuracy: number; color: string }[];
      weakestSubjects: { name: string; accuracy: number; color: string }[];
    };
  };
}

export interface LevelUpInfo {
  hasLeveledUp: boolean;
  newLevel?: number;
  xpEarned: number;
  totalXP: number;
  newBadge?: BadgeDetails;
}

// --- API Service Functions ---

/**
 * Fetch user home stats including XP and level information
 * Route: GET /api/users/stats/me
 */
export async function fetchUserStats(): Promise<UserStatsResponse> {
  try {
    const response = await api.get('/users/stats/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
}

/**
 * Fetch user profile information (The rich dashboard object)
 * Route: GET /api/users/profile/me
 */
export async function fetchUserProfile(): Promise<UserProfileResponse> {
  try {
    const response = await api.get('/users/profile/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Update user profile details (firstName, lastName, bio, etc.)
 * Route: PUT /api/users/profile/me
 */
export async function updateUserProfile(data: Partial<User>): Promise<UserProfileResponse> {
  try {
    const response = await api.put('/users/profile/me', data);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

export async function updateUserPreferences(data: any): Promise<UserProfileResponse> {
  try {
    const response = await api.put('/users/preferences/me', data);
    return response.data;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
}

/**
 * Update User Avatar
 * Route: PUT /api/users/profile/avatar
 */
export async function updateUserAvatar(avatarUrl: string): Promise<{ success: boolean; data: { avatar: string } }> {
  try {
    const response = await api.put('/users/profile/avatar', { avatarUrl });
    return response.data;
  } catch (error) {
    console.error('Error updating avatar:', error);
    throw error;
  }
}

/**
 * Clear the level-up flag on the server (Optional - if using flag logic)
 * Route: POST /api/users/profile/clear-level-up
 */
export async function clearLevelUpFlag(): Promise<void> {
  try {
    // Updated route based on your backend routes.js
    await api.post('/users/profile/clear-level-up'); 
  } catch (error) {
    console.error('Error clearing level-up flag:', error);
    // Non-critical error, don't throw blocking error usually
  }
}

/**
 * Check if user has leveled up by comparing previous level with fresh stats
 * typically used if you are NOT relying on the quiz response for level-up data
 */
export async function checkLevelUp(previousLevel: number): Promise<LevelUpInfo> {
  try {
    const statsResponse = await fetchUserStats();
    const currentLevel = statsResponse.data.level;
    const hasLeveledUp = currentLevel > previousLevel;
    
    return {
      hasLeveledUp,
      newLevel: hasLeveledUp ? currentLevel : undefined,
      xpEarned: 0, 
      totalXP: statsResponse.data.xp,
      newBadge: statsResponse.data.currentBadge // Return current badge as potential new badge
    };
  } catch (error) {
    console.error('Error checking level up:', error);
    return {
      hasLeveledUp: false,
      xpEarned: 0,
      totalXP: 0,
    };
  }
}

/**
 * Refresh user data after XP-earning activities
 * Returns level up information if applicable
 */
export async function refreshUserDataAfterXP(previousLevel: number): Promise<{
  stats: UserStatsResponse['data'];
  levelUpInfo: LevelUpInfo;
}> {
  try {
    const [statsResponse, levelUpInfo] = await Promise.all([
      fetchUserStats(),
      checkLevelUp(previousLevel),
    ]);

    return {
      stats: statsResponse.data,
      levelUpInfo,
    };
  } catch (error) {
    console.error('Error refreshing user data after XP:', error);
    throw error;
  }
}

// --- Helper Functions ---

/**
 * Calculate XP progress percentage
 * (Note: Backend now sends 'levelProgressPercent', so this is a fallback)
 */
export function calculateXPProgress(xpInCurrentLevel: number, xpToNextLevel: number): number {
  if (!xpToNextLevel || xpToNextLevel === 0) return 100;
  return Math.min(100, Math.round((xpInCurrentLevel / xpToNextLevel) * 100));
}

/**
 * Format XP number for display (e.g. 1.2K, 1M)
 */
export function formatXP(xp: number): string {
  if (!xp) return '0';
  if (xp >= 1000000) {
    return `${(xp / 1000000).toFixed(1)}M`;
  } else if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`;
  }
  return xp.toLocaleString();
}

/**
 * Get level badge emoji based on level (Fallback if backend badge icon is missing)
 */
export function getLevelBadgeEmoji(level: number): string {
  if (level >= 50) return '👑'; // Grandmaster
  if (level >= 30) return '⚔️'; // Legend
  if (level >= 20) return '💎'; // Master
  if (level >= 10) return '🥇'; // Expert
  if (level >= 5) return '🥈';  // Apprentice
  return '🥉';                 // Novice
}