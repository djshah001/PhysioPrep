# XP and Gamification System Implementation

## Overview
This document outlines the implementation of the XP (Experience Points) and leveling gamification system in the PhysioPrep frontend application, featuring simplified server-side level-up detection and ActionSheet-based animations.

## Features Implemented

### 1. XP/Level Display Components
- **XPLevelCard**: A reusable component that displays user's current level, XP progress, and level progress bar
- **LevelUpAnimation**: An ActionSheet-based animated celebration component that appears when users level up
- Both components use React Native Reanimated for smooth animations

### 2. State Management
- Updated `UserHomeStats` interface in `store/home.ts` to include XP and level fields:
  - `xp`: Total experience points
  - `level`: Current level
  - `xpToNextLevel`: XP required for next level
  - `xpInCurrentLevel`: XP earned in current level
  - `levelProgressPercent`: Progress percentage to next level
  - `hasLeveledUp`: Server-provided flag indicating if user has leveled up

### 3. Custom Hooks (Simplified)
- **useXPLevel**: Main hook for managing XP and level state using server-provided `hasLeveledUp` flag
- **useXPEarningActivity**: Specialized hook for triggering XP checks after earning activities

### 4. User Actions
- **fetchUserStats**: Fetches user stats including XP and level data
- **clearLevelUpFlag**: Clears the server-side level-up flag after animation is shown
- **refreshUserDataAfterXP**: Refreshes user data after XP-earning activities

### 5. UI Integration
- **BentoHome**: Updated to display XP/Level card in the bento grid layout
- **QuizReview**: Added XP earning display and automatic level-up detection after quiz completion

### 6. Backend Integration
- **clearLevelUpFlag endpoint**: `/users/me/clear-level-up` - Resets the `hasLeveledUp` flag
- **Server-side level calculation**: Level-up detection is handled by the backend using `user.getLevelProgress()`

## File Structure

```
frontend/
├── components/
│   ├── ui/
│   │   ├── XPLevelCard.tsx          # XP/Level display component
│   │   └── LevelUpAnimation.tsx     # Level-up celebration animation
│   ├── home/
│   │   └── BentoHome.tsx           # Updated with XP display
│   └── questions/
│       └── QuizReview.tsx          # Updated with XP earning
├── hooks/
│   └── useXPLevel.ts               # XP and level management hooks
├── actions/
│   └── user.ts                     # User-related API actions
├── store/
│   ├── auth.ts                     # Updated User interface
│   └── home.ts                     # Updated UserHomeStats interface
└── docs/
    └── XP_GAMIFICATION_IMPLEMENTATION.md
```

## Usage Examples

### Displaying XP/Level in Components
```tsx
import XPLevelCard from '../ui/XPLevelCard';

// In your component
<XPLevelCard
  xp={stats?.xp ?? 0}
  level={stats?.level ?? 1}
  xpToNextLevel={stats?.xpToNextLevel ?? 1000}
  xpInCurrentLevel={stats?.xpInCurrentLevel ?? 0}
  levelProgressPercent={stats?.levelProgressPercent ?? 0}
  currentBadge={stats?.currentBadge}
  variant="compact"
/>
```

### Using XP Earning Hook (Simplified)
```tsx
import { useXPEarningActivity } from '../hooks/useXPLevel';

function QuizComponent() {
  const { onXPEarned } = useXPEarningActivity();

  const handleQuizComplete = async () => {
    // Trigger XP check - level-up animation handled automatically
    await onXPEarned();
  };

  return (
    <>
      {/* Your quiz UI */}
      {/* Level-up animation is handled automatically via SheetManager */}
    </>
  );
}
```

### Managing XP State (Simplified)
```tsx
import { useXPLevel } from '../hooks/useXPLevel';

function StatsComponent() {
  const { stats, loading, refreshStats } = useXPLevel();

  return (
    <View>
      <Text>Level: {stats?.level}</Text>
      <Text>XP: {stats?.xp}</Text>
      <Button onPress={refreshStats} title="Refresh Stats" />
      {/* Level-up detection and animation handled automatically */}
    </View>
  );
}
```

### ActionSheet-based Level-Up Animation
The level-up animation is now triggered automatically via `SheetManager.show()`:
```tsx
// Automatically triggered in useXPLevel hook when stats.hasLeveledUp is true
SheetManager.show('level-up-animation', {
  payload: {
    visible: true,
    newLevel: stats.level,
    onComplete: clearLevelUp,
  },
});
```

## Backend Integration

### API Endpoints
- **GET `/users/me/stats`**: Returns user stats including XP, level, and `hasLeveledUp` flag
- **POST `/users/me/clear-level-up`**: Clears the server-side level-up flag

### Data Structure
The frontend expects the following data structure from the backend:

```typescript
interface UserStatsResponse {
  success: boolean;
  data: {
    xp: number;
    level: number;
    currentBadge: {
      name: string;
      icon: string;
      color: string;
      description: string;
    };
    xpToNextLevel: number;
    xpInCurrentLevel: number;
    levelProgressPercent: number;
    hasLeveledUp: boolean; // Server-calculated flag
    // ... other stats
  };
}
```

### Server-Side Level-Up Detection
The backend calculates `hasLeveledUp` using the `user.getLevelProgress()` method:
- Compares current XP against level requirements
- Returns `true` when user has enough XP to advance to the next level
- Flag is reset when `/users/me/clear-level-up` endpoint is called

## Styling and Animations

- Uses NativeWind (Tailwind CSS) for styling
- Implements React Native Reanimated for smooth animations
- Gradient backgrounds and shadow effects for visual appeal
- Responsive design that works on different screen sizes

## Future Enhancements

1. **Achievement System**: Add badges and achievements for specific milestones
2. **Leaderboards**: Compare XP and levels with other users
3. **XP Multipliers**: Bonus XP for streaks or special events
4. **Custom Animations**: More elaborate level-up celebrations
5. **Sound Effects**: Audio feedback for XP earning and level-ups
6. **Progress Tracking**: Detailed XP earning history and analytics

## Testing

To test the XP system:
1. Complete quizzes to earn XP
2. Check the home screen for updated XP display
3. Level up to see the celebration animation
4. Verify XP calculations match expected values

## Performance Considerations

- XP data is cached using Jotai atoms
- Level-up checks are debounced to prevent excessive API calls
- Animations are optimized using React Native Reanimated
- Components use React.memo where appropriate to prevent unnecessary re-renders
