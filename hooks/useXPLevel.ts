import { useState } from 'react';
import { useAtom } from 'jotai';
import { homeStatsAtom, UserHomeStats } from 'store/home';
import { fetchUserStats, clearLevelUpFlag } from '../actions/user';
import { SheetManager } from 'react-native-actions-sheet';
import { proStatusAtom } from 'store/pro';
import { userAtom } from 'store/auth';

export interface UseXPLevelReturn {
  stats: UserHomeStats | null;
  loading: boolean;
  refreshStats: () => Promise<void>;
  clearLevelUp: () => Promise<void>;
  checkForLevelUp: () => Promise<void>;
}

/**
 * Custom hook to manage XP and level state with simplified level-up detection
 */
export function useXPLevel(): UseXPLevelReturn {
  const [stats, setStats] = useAtom(homeStatsAtom);
  const [,setUser] = useAtom(userAtom);
  const [, setProStatus] = useAtom(proStatusAtom);

  const [loading, setLoading] = useState(false);

  /**
   * Refresh user stats from the server and trigger level-up animation if needed
   */
  const refreshStats = async () => {
    try {
      setLoading(true);
      const response = await fetchUserStats();
      const newStats = response.data;

      // Check if user has leveled up using server-provided flag
      if (newStats.hasLeveledUp) {
        SheetManager.show('level-up-animation', {
          payload: {
            visible: true,
            newLevel: newStats.level,
            onComplete: () => clearLevelUp(),
          },
        });
      }

      setStats(newStats);
  setUser((prevUser) => {
    if (!prevUser) return prevUser;
    return {
      ...prevUser,
      xp: newStats.xp,
      level: newStats.level,
      isPro: newStats.isPro,
      isProActive: newStats.isPro,
      proExpiresAt: null,
      proActivatedAt: null,
      hasProAccess: newStats.isPro,
      // id: prevUser.id, // ensure id is always present and not undefined
    };
  });
      setProStatus({
        isPro: newStats.isPro,
        isProActive: newStats.isPro,
        proExpiresAt: newStats.proExpiresAt ? new Date(newStats.proExpiresAt) : null,
        proActivatedAt: newStats.proActivatedAt ? new Date(newStats.proActivatedAt) : null,
        hasProAccess: newStats.isPro,
      });
    } catch (error) {
      console.error('Error refreshing stats:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check for level up after XP-earning activities
   * Uses the same logic as refreshStats but optimized for post-activity checks
   */
  const checkForLevelUp = async () => {
    try {
      const response = await fetchUserStats();
      const newStats = response.data;

      // Check if user has leveled up using server-provided flag
      if (newStats.hasLeveledUp) {
        SheetManager.show('level-up-animation', {
          payload: {
            visible: true,
            newLevel: newStats.level,
            onComplete: clearLevelUp,
          },
        });
      }

      setStats(newStats);
    } catch (error) {
      console.error('Error checking for level up:', error);
    }
  };

  /**
   * Clear level up notification by calling the server to reset the flag
   */
  const clearLevelUp = async () => {
    try {
      await clearLevelUpFlag();
      // Refresh stats to get updated hasLeveledUp: false
      const response = await fetchUserStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error clearing level up flag:', error);
    }
  };

  return {
    stats,
    loading,
    refreshStats,
    clearLevelUp,
    checkForLevelUp,
  };
}

/**
 * Hook specifically for triggering level up checks after XP-earning activities
 */
export function useXPEarningActivity() {
  const { checkForLevelUp, clearLevelUp } = useXPLevel();

  /**
   * Call this after any activity that earns XP (quiz completion, daily questions, etc.)
   */
  const onXPEarned = async () => {
    // Add a small delay to ensure backend has processed the XP
    setTimeout(() => {
      checkForLevelUp();
    }, 500);
  };

  return {
    onXPEarned,
    clearLevelUp,
  };
}

/**
 * Utility function to format XP for display
 */
export function formatXPDisplay(xp: number): string {
  if (xp >= 1000000) {
    return `${(xp / 1000000).toFixed(1)}M`;
  } else if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`;
  }
  return xp.toLocaleString();
}

/**
 * Utility function to get level color based on level
 */
export function getLevelColor(level: number): string {
  if (level >= 100) return '#FFD700'; // Gold
  if (level >= 50) return '#E6E6FA'; // Lavender
  if (level >= 25) return '#FF6347'; // Tomato
  if (level >= 10) return '#32CD32'; // Lime Green
  if (level >= 5) return '#1E90FF'; // Dodger Blue
  return '#808080'; // Gray
}

/**
 * Utility function to calculate XP needed for next level
 */
export function calculateXPForLevel(level: number): number {
  // Example formula: each level requires 1000 * level XP
  // You can adjust this based on your game design
  return 1000 * level;
}
