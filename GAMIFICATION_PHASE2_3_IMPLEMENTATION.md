# Gamification System - Phase 2 & 3 Implementation Guide

**Status**: ✅ COMPLETED  
**Date**: February 5, 2026

This document covers the implementation of Phase 2 (Notifications & Showcase) and Phase 3 (Activity Integration) of the gamification system.

---

## 📋 Overview

### Phase 2: Notifications & Achievement Showcase
- ✅ Achievement unlock toast notifications
- ✅ Level-up celebration modals
- ✅ Achievement showcase page
- ✅ Notification system integration

### Phase 3: Activity Integration
- ✅ Automatic XP tracking after user actions
- ✅ Backend middleware for activity tracking
- ✅ Frontend hooks for progress checking
- ✅ Integration with cases, comments, and quizzes

---

## 🎨 Phase 2 Components

### 1. AchievementToast Component
**Location**: `src/components/Gamification/AchievementToast.jsx`

**Purpose**: Displays a toast notification when a user unlocks an achievement.

**Features**:
- Auto-dismisses after 8 seconds
- Shows achievement icon, name, description
- Displays XP reward and tier badge
- Animated entrance/exit
- Shimmer effect for visual appeal

**Usage**:
```jsx
import { useNotification } from '../contexts/NotificationContext';

const { showAchievementToast } = useNotification();

// Trigger notification
showAchievementToast({
    name: 'First Case',
    description: 'Shared your first case',
    icon: '📋',
    tier: 'bronze',
    xpReward: 50
});
```

### 2. LevelUpModal Component
**Location**: `src/components/Gamification/LevelUpModal.jsx`

**Purpose**: Displays a celebration modal when a user levels up.

**Features**:
- Full-screen modal with backdrop
- Dynamic level titles based on level number
- Motivational messages
- Animated floating particles
- Auto-dismisses after 5 seconds

**Level Titles**:
- Level 1-4: "Advancing Apprentice"
- Level 5-9: "Skilled Technologist"
- Level 10-24: "Senior Tech"
- Level 25-49: "Expert Technologist"
- Level 50+: "Master of EEG"

**Usage**:
```jsx
import { useNotification } from '../contexts/NotificationContext';

const { showLevelUp } = useNotification();

// Trigger level up celebration
showLevelUp(15); // New level number
```

### 3. NotificationContext
**Location**: `src/contexts/NotificationContext.jsx`

**Purpose**: Centralized notification management system.

**Features**:
- Manages multiple simultaneous toast notifications
- Handles level-up modal display
- Automatically positions and stacks notifications
- Provides clean API for triggering notifications

**Provider Setup** (already integrated in `App.jsx`):
```jsx
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  return (
    <NotificationProvider>
      {/* Your app components */}
    </NotificationProvider>
  );
}
```

### 4. Achievements Page
**Location**: `src/pages/Achievements.jsx`

**Purpose**: Comprehensive achievement showcase and tracking page.

**Features**:
- Displays user's current level, XP, and streak
- Shows progress: X/Y achievements unlocked
- Filterable by category (all, cases, quizzes, community, etc.)
- Filter by status (all, unlocked, locked)
- Grid display of achievement badges
- Click badge to see detailed modal
- Link to leaderboard

**Categories**:
- All
- Unlocked / Locked
- Cases
- Quizzes
- Community
- Learning
- Streaks
- Special

**Route**: `/achievements`

### 5. Custom Animations
**Location**: `src/index.css`

**Added Animations**:
- `shimmer`: Sliding shine effect for toasts
- `progress-fill`: Progress bar fill animation
- `float-1/2/3`: Floating particle animations for level-up
- `fade-in`: Smooth fade entrance
- `scale-in`: Scale and fade entrance

---

## 🔧 Phase 3 Integration

### 1. Backend Activity Tracking Middleware
**Location**: `server/src/middleware/trackActivity.js`

**Middleware Functions**:
- `trackQuizCompletion`: Awards XP after quiz completion
- `trackCaseShare`: Awards XP after case submission
- `trackCaseApproval`: Awards XP to author when case is approved
- `trackCommentPost`: Awards XP after posting a comment
- `trackDailyLogin`: Awards XP for daily login (first of the day)
- `trackStudy`: Awards XP for study session
- `trackHelpfulVote`: Awards XP when your content is voted helpful

**Integration Example**:
```javascript
// In server/src/routes/cases.js
import { trackCaseShare, trackCommentPost } from '../middleware/trackActivity.js';

// Add middleware to routes
router.post('/', auth, trackCaseShare, async (req, res) => {
    // Case creation logic
});

router.post('/:id/comment', auth, trackCommentPost, async (req, res) => {
    // Comment posting logic
});
```

**Already Integrated Routes**:
- ✅ `POST /api/cases` - Case sharing (trackCaseShare)
- ✅ `POST /api/cases/:id/comment` - Comment posting (trackCommentPost)
- ✅ `PUT /api/cases/:id/moderate` - Case approval (trackCaseApproval)

### 2. Frontend Gamification Hook
**Location**: `src/hooks/useGamification.js`

**Purpose**: Provides easy-to-use functions for checking gamification progress after user actions.

**Functions**:
- `checkProgress()`: Checks for new achievements and level-ups, triggers notifications
- `checkAchievements()`: Specifically checks for new achievements
- `refreshProgress()`: Gets updated progress data without notifications

**Usage Example**:
```jsx
import useGamification from '../hooks/useGamification';

function MyComponent() {
    const { checkProgress } = useGamification();

    const handleSubmit = async () => {
        // ... submit logic ...
        
        // Check for new achievements/level ups
        await checkProgress();
    };
}
```

### 3. Gamification Client Service
**Location**: `src/services/gamificationClient.js`

**Purpose**: Client-side service for managing gamification state and detecting changes.

**Features**:
- Compares previous and current progress to detect changes
- Stores progress in localStorage for comparison
- Triggers notifications via NotificationContext
- Detects level-ups and new achievements

**Methods**:
- `checkProgress(notificationContext)`: Main check function
- `checkAchievements(notificationContext)`: Achievement-specific check
- `getPreviousProgress()`: Retrieve stored progress
- `savePreviousProgress(progress)`: Update stored progress
- `clearStoredProgress()`: Clear on logout

### 4. Frontend Integration Points

**Integrated Components**:

1. **ShareCase.jsx** (`src/pages/cases/ShareCase.jsx`)
   - Checks progress after successful case submission
   - Triggers achievement/level notifications before navigation

2. **CaseDiscussion.jsx** (`src/components/CaseDiscussion.jsx`)
   - Checks progress after posting a comment
   - Awards XP for community participation

3. **QuizSession.jsx** (`src/pages/QuizSession.jsx`)
   - Checks progress after quiz completion
   - Awards XP based on quiz performance
   - Triggers notifications before showing results

4. **AuthContext.jsx** (`src/contexts/AuthContext.jsx`)
   - Clears gamification data on logout
   - Ensures clean state for new sessions

### 5. Navbar Updates
**Location**: `src/components/Navbar.jsx`

**Additions**:
- Added "🎖️ Badges" link to `/achievements`
- Available in both desktop and mobile menus

---

## 📊 XP Reward Structure

### Activity Types (from trackActivity.js)
| Activity | Base XP | Bonus Conditions |
|----------|---------|------------------|
| Daily Login | 10 XP | First login of the day |
| Case Share | 50 XP | +25 XP if approved |
| Case Approval | 75 XP | Awarded to case author |
| Comment Post | 10 XP | General discussion |
| Quiz Completion | 20-100 XP | Based on score % |
| Perfect Quiz | 100 XP | 100% score |
| Study Session | 5 XP | Per session |
| Helpful Vote | 5 XP | When content is upvoted |

### Level Progression
- XP to next level: `level * 100`
- Example: Level 5 → 6 requires 500 XP

---

## 🏆 Achievement System Integration

### Achievement Types
From `server/src/services/gamificationService.js`:

**Cases** (📋):
- First Case (bronze): Share your first case (50 XP)
- Case Contributor (silver): Share 10 cases (100 XP)
- Case Expert (gold): Share 50 cases (250 XP)
- Case Master (platinum): Share 100 cases (500 XP)

**Quizzes** (📝):
- First Quiz (bronze): Complete your first quiz (50 XP)
- Quiz Enthusiast (silver): Complete 25 quizzes (100 XP)
- Perfect Score (gold): Get 100% on any quiz (200 XP)
- Quiz Master (platinum): Complete 100 quizzes (500 XP)

**Community** (💬):
- First Comment (bronze): Post your first comment (25 XP)
- Conversationalist (silver): Post 50 comments (100 XP)
- Community Leader (gold): Post 200 comments (250 XP)
- Discussion Expert (platinum): Post 500 comments (500 XP)

**Learning** (📚):
- Dedicated Learner (bronze): 7-day streak (100 XP)
- Committed Scholar (silver): 30-day streak (250 XP)
- Learning Champion (gold): 90-day streak (500 XP)

**Streaks** (🔥):
- Week Warrior (bronze): 7-day streak (100 XP)
- Month Master (silver): 30-day streak (250 XP)
- Streak Legend (gold): 100-day streak (1000 XP)

**Special** (⭐):
- Early Adopter (platinum): Join in first month (500 XP)
- Community Champion (platinum): 1000 helpful votes (1000 XP)

---

## 🎯 Testing Checklist

### Phase 2 - Notifications
- [ ] Share a case → Achievement toast appears
- [ ] Gain enough XP → Level-up modal appears
- [ ] Toast auto-dismisses after 8 seconds
- [ ] Multiple toasts stack correctly
- [ ] Level-up modal auto-dismisses after 5 seconds
- [ ] Click X to manually close notifications
- [ ] Visit `/achievements` page
- [ ] Filter achievements by category
- [ ] Click achievement badge to see details
- [ ] Locked achievements show as grayed out

### Phase 3 - Activity Integration
- [ ] Share a case → XP awarded, notification triggered
- [ ] Post a comment → XP awarded, notification triggered
- [ ] Complete a quiz → XP awarded, notification triggered
- [ ] Admin approves case → Author receives XP
- [ ] Level up occurs → Modal shows new level
- [ ] Unlock achievement → Toast shows achievement
- [ ] Logout → Gamification data cleared
- [ ] Login → Progress loads from server

### Backend API Tests
- [ ] `GET /api/gamification/progress` returns user progress
- [ ] `GET /api/gamification/achievements` returns all achievements
- [ ] `GET /api/gamification/leaderboard/overall` returns rankings
- [ ] `POST /api/cases` triggers trackCaseShare middleware
- [ ] `POST /api/cases/:id/comment` triggers trackCommentPost
- [ ] `PUT /api/cases/:id/moderate` triggers trackCaseApproval for author

---

## 📁 File Structure

### New Files Created
```
src/
├── components/
│   └── Gamification/
│       ├── AchievementToast.jsx (Phase 2)
│       └── LevelUpModal.jsx (Phase 2)
├── contexts/
│   └── NotificationContext.jsx (Phase 2)
├── hooks/
│   └── useGamification.js (Phase 3)
├── pages/
│   └── Achievements.jsx (Phase 2)
└── services/
    └── gamificationClient.js (Phase 3)

server/src/
└── middleware/
    └── trackActivity.js (Phase 3 - already created in Phase 1)
```

### Modified Files
```
src/
├── App.jsx (Added NotificationProvider, Achievements route)
├── components/
│   ├── Navbar.jsx (Added Achievements link)
│   └── CaseDiscussion.jsx (Added gamification check)
├── contexts/
│   └── AuthContext.jsx (Added logout cleanup)
├── pages/
│   ├── cases/ShareCase.jsx (Added gamification check)
│   └── QuizSession.jsx (Added gamification check)
└── index.css (Added animations)

server/src/
└── routes/
    └── cases.js (Integrated activity tracking middleware)
```

---

## 🚀 Deployment

### Environment Variables
No new environment variables required for Phase 2 & 3.

### Database Changes
No database migrations required. Uses existing schemas from Phase 1:
- `UserProgress` model
- `Achievement` model

### Build & Deploy
```bash
# Frontend
npm run build

# Backend (if changes deployed)
git push origin main
# Render will auto-deploy
```

---

## 📈 Next Steps (Future Phases)

### Phase 4: Social & Competition (Future)
- Team challenges
- Friend comparisons
- Achievement sharing to social media
- Weekly/monthly competitions

### Phase 5: Advanced Analytics (Future)
- Detailed performance dashboards
- XP history graphs
- Achievement rarity statistics
- Personalized recommendations

---

## 🐛 Troubleshooting

### Notifications Not Appearing
1. Check that `NotificationProvider` is wrapping your app
2. Verify `useGamification` hook is imported and called
3. Check browser console for errors
4. Ensure localStorage is accessible (not in private mode)

### XP Not Being Awarded
1. Verify middleware is attached to the correct routes
2. Check backend logs for activity tracking errors
3. Ensure user is authenticated (JWT token valid)
4. Check MongoDB for `UserProgress` document creation

### Achievements Not Unlocking
1. Run `/api/gamification/initialize-achievements` endpoint once
2. Check achievement criteria in `gamificationService.js`
3. Verify `UserProgress.stats` are updating correctly
4. Check backend logs for achievement check errors

### Level-Up Not Triggering
1. Verify XP calculation: `level * 100` per level
2. Check `GamificationClient.checkProgress()` is being called
3. Ensure previous progress is stored in localStorage
4. Clear localStorage and refresh to reset state

---

## 📝 Developer Notes

### Adding New Achievement Types
1. Add to `gamificationService.js` → `initializeDefaultAchievements()`
2. Define criteria (count, threshold, streak, perfect, custom)
3. Update achievement check logic in `checkAchievements()`
4. Add icon and tier

### Adding New Activity Types
1. Add to `trackActivity.js` middleware
2. Define XP reward in `gamificationService.js` → `XP_REWARDS`
3. Update `updateStats()` to track the new activity
4. Integrate middleware in appropriate routes

### Customizing Notifications
- Edit `AchievementToast.jsx` for toast styling
- Edit `LevelUpModal.jsx` for level-up celebration
- Modify CSS animations in `index.css`
- Adjust auto-dismiss timers in component `useEffect`

---

## 📞 Support

For questions or issues:
1. Check console logs for detailed error messages
2. Review backend logs on Render
3. Verify database state in MongoDB Atlas
4. Check gamification service logic in `gamificationService.js`

---

**Implementation Complete**: Phase 2 & 3 ✅  
**Next Phase**: Testing and refinement based on user feedback
