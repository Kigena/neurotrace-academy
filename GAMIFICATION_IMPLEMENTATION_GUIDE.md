# Gamification System - Implementation Guide

**Version:** 1.0  
**Date:** February 8, 2026  
**Status:** Phase 1 Complete ✅

---

## 🎮 What Was Implemented

### ✅ Phase 1: Core Infrastructure (COMPLETE)

#### Backend:
1. **Database Models:**
   - `Achievement.js` - Stores all achievements/badges
   - `UserProgress.js` - Tracks user XP, level, streak, stats, and unlocked achievements

2. **Service Layer:**
   - `GamificationService` - Core logic for XP awards, achievement checking, leaderboards
   - `trackActivity` middleware - Automatic XP tracking for user actions

3. **API Routes** (`/api/gamification`):
   - `GET /progress` - Get user's progress
   - `GET /achievements` - Get all achievements
   - `GET /leaderboard/:type` - Get leaderboard (overall/streak/cases/quizzes/community)
   - `GET /rank` - Get user's current rank
   - `POST /achievements/:id/claim` - Mark achievement as viewed
   - `POST /award-xp` - Manual XP award (admin only)
   - `POST /initialize-achievements` - Initialize default achievements (admin only)

4. **17 Default Achievements:**
   - First Case (🎯) - Share your first case
   - Quiz Taker (📝) - Complete your first quiz
   - Discussion Starter (💬) - Post your first comment
   - Case Contributor (📋) - Share 10 approved cases
   - Case Master (🏆) - Share 50 approved cases
   - Quiz Enthusiast (📚) - Complete 25 quizzes
   - Perfectionist (💯) - Score 100% on 5 quizzes
   - Discussion Leader (🗣️) - Post 100 comments
   - Helpful Contributor (⭐) - Get 50 helpful votes
   - Week Warrior (🔥) - 7-day streak
   - Dedication Master (🔥) - 30-day streak
   - Century Club (💎) - 100-day streak
   - Pattern Explorer (🧠) - Study 50 patterns
   - Syndrome Scholar (📖) - Study 25 syndromes
   - Rising Star (⭐) - Reach level 10
   - Expert Technologist (🌟) - Reach level 25
   - Master of EEG (👑) - Reach level 50

#### Frontend:
1. **Components:**
   - `ProgressBar` - Level/XP display with tier colors
   - `AchievementBadge` - Badge display with hover tooltips
   - `StreakDisplay` - Fire streak counter with motivational messages

2. **Pages:**
   - `Leaderboard` - Full leaderboard with 5 categories
   - Updated `Dashboard` - Shows level, XP, streak, recent achievements

3. **Navigation:**
   - Added "🏆 Ranks" link in navbar (desktop and mobile)

---

## 🎯 XP Reward Structure

| Activity | XP | Activity Type |
|----------|----|----|
| Complete Quiz | 10 | `quiz_complete` |
| Perfect Quiz Score | 25 | `quiz_perfect` |
| Share Case | 25 | `case_share` |
| Case Approved by Admin | 50 | `case_approved` |
| Case Gets Helpful Vote | 5 | `case_helpful_vote` |
| Post Comment | 5 | `comment_post` |
| Comment Gets Helpful | 10 | `comment_helpful` |
| Study Pattern | 2 | `pattern_study` |
| Study Syndrome | 3 | `syndrome_study` |
| Watch Video | 5 | `video_watch` |
| Download Resource | 2 | `resource_download` |
| Daily Login | 5 | `daily_login` |
| Weekly Challenge | 100 | `weekly_challenge` |

---

## 📊 Level Progression

### Level Titles:
- **Level 1-4:** Apprentice
- **Level 5-9:** Technologist
- **Level 10-24:** Senior Tech
- **Level 25-49:** Expert
- **Level 50+:** Master

### XP Required per Level:
- Level 1 → 2: 100 XP
- Level 2 → 3: 150 XP
- Level 3 → 4: 225 XP
- Formula: `100 * (1.5 ^ (level - 1))` (exponential growth)

---

## 🔥 Streak System

### How It Works:
- Activity on a new day increments streak by 1
- Missing a day resets streak to 1
- Longest streak is tracked separately
- Streak milestones unlock achievements (7, 30, 100 days)

### What Counts as Activity:
- Any action that awards XP
- Daily login
- Completing a quiz
- Posting a comment
- Sharing a case
- Studying patterns/syndromes

---

## 🏆 Achievement Tiers

### Bronze 🥉
- Entry-level achievements
- 25-50 XP reward
- First-time actions

### Silver 🥈
- Intermediate achievements
- 100 XP reward
- Consistent participation

### Gold 🥇
- Advanced achievements
- 150-300 XP reward
- Significant milestones

### Platinum 💎
- Elite achievements
- 500-1000 XP reward
- Extraordinary dedication

---

## 🚀 How to Use (For Users)

### View Your Progress:
1. Go to **Dashboard** (`/dashboard`)
2. See your level, XP progress bar, and current streak
3. View recent achievements earned

### View Leaderboard:
1. Click **"🏆 Ranks"** in the navigation bar
2. Switch between tabs:
   - Overall (by level/XP)
   - Streak (by current streak)
   - Cases (by cases shared)
   - Quizzes (by quizzes completed)
   - Community (by comments posted)
3. See your rank highlighted
4. See top 50 users in each category

### Earn XP:
- Complete quizzes
- Share cases
- Comment on discussions
- Study patterns and syndromes
- Maintain daily streak
- Get helpful votes from community

### Unlock Achievements:
- Achievements unlock automatically when criteria is met
- You'll see a notification (coming in Phase 2)
- View all achievements on Dashboard or dedicated page (coming)

---

## 🛠️ How to Use (For Developers)

### Award XP Manually:
```javascript
import GamificationService from '../services/gamificationService.js';

// Award XP to a user
const result = await GamificationService.awardXP(
    userId,
    25, // XP amount
    'custom_activity', // activity type
    { reason: 'Special event' } // optional metadata
);

console.log(result);
// Returns: { xpAwarded, totalXP, level, levelUp, newAchievements, streak }
```

### Track Activities Automatically:
```javascript
import { trackCaseShare, trackCommentPost } from '../middleware/trackActivity.js';

// In your route:
router.post('/cases', auth, async (req, res) => {
    const newCase = await CommunityCase.create({...});
    req.newCase = newCase; // Required for middleware
    
    // XP will be awarded automatically
}, trackCaseShare);
```

### Initialize Achievements:
Achievements are automatically initialized on server startup. To manually initialize:

```bash
POST /api/gamification/initialize-achievements
Headers: Authorization: Bearer <admin-token>
```

### Check User Progress:
```javascript
const progress = await apiService.get('/gamification/progress');
console.log(progress);
// { level, xp, xpToNextLevel, streak, stats, achievements, activityHistory, rank }
```

---

## 📈 Next Steps (Phase 2 & 3)

### Phase 2: Achievement Notifications & Showcase
- [ ] Achievement unlock notifications (toast/modal)
- [ ] Achievement showcase page (all achievements)
- [ ] Level-up celebration animation
- [ ] Streak reminder notifications
- [ ] Weekly progress email digest

### Phase 3: Activity Integration
- [ ] Integrate `trackActivity` middleware into:
  - [ ] Quiz completion endpoints
  - [ ] Case sharing endpoints
  - [ ] Comment posting endpoints
  - [ ] Pattern/syndrome view tracking
- [ ] Track daily logins
- [ ] Track helpful votes on comments/cases

### Phase 4: Advanced Features
- [ ] Weekly challenges
- [ ] Achievement categories page
- [ ] Contribution graph (GitHub-style)
- [ ] XP transaction history
- [ ] Compare progress with friends
- [ ] Achievement sharing on social media

---

## 🐛 Testing Checklist

### Backend:
- [ ] Server starts without errors
- [ ] Achievements initialize on startup (check logs)
- [ ] `/api/gamification/progress` returns user progress
- [ ] `/api/gamification/leaderboard/overall` returns rankings
- [ ] XP awards work correctly
- [ ] Level progression calculates correctly
- [ ] Streak updates work correctly

### Frontend:
- [ ] Dashboard shows level/XP progress bar
- [ ] Dashboard shows streak display
- [ ] Dashboard shows recent achievements
- [ ] Leaderboard page loads correctly
- [ ] Leaderboard tabs switch correctly
- [ ] User's rank displays correctly
- [ ] Achievement badges render with correct colors/icons
- [ ] Tooltips show on achievement hover

---

## 💾 Database Schema

### Achievement Schema:
```javascript
{
    key: String (unique),
    name: String,
    description: String,
    icon: String,
    category: Enum['cases', 'quizzes', 'community', 'learning', 'special', 'streak'],
    tier: Enum['bronze', 'silver', 'gold', 'platinum'],
    xpReward: Number,
    criteria: {
        type: Enum['count', 'threshold', 'streak', 'perfect', 'custom'],
        target: Number,
        metric: String
    },
    isSecret: Boolean,
    isActive: Boolean,
    order: Number,
    createdAt: Date
}
```

### UserProgress Schema:
```javascript
{
    user: ObjectId (ref: User),
    level: Number,
    xp: Number,
    xpToNextLevel: Number,
    unlockedAchievements: [{
        achievement: ObjectId (ref: Achievement),
        unlockedAt: Date,
        claimed: Boolean
    }],
    stats: {
        casesShared: Number,
        casesApproved: Number,
        casesHelpfulVotes: Number,
        quizzesCompleted: Number,
        quizzesPerfect: Number,
        totalQuizScore: Number,
        commentsPosted: Number,
        helpfulComments: Number,
        discussionsStarted: Number,
        patternsStudied: Number,
        syndromesStudied: Number,
        videosWatched: Number,
        resourcesDownloaded: Number,
        totalStudyTime: Number,
        sessionsCount: Number
    },
    streak: {
        current: Number,
        longest: Number,
        lastActivityDate: Date
    },
    rank: {
        overall: Number,
        weekly: Number,
        category: Map
    },
    activityHistory: [{
        date: Date,
        xpEarned: Number,
        activities: [String]
    }],
    createdAt: Date,
    updatedAt: Date
}
```

---

## 🔧 Configuration

### Customize XP Rewards:
Edit `server/src/services/gamificationService.js`:
```javascript
static XP_REWARDS = {
    QUIZ_COMPLETE: 10, // Change these values
    CASE_SHARE: 25,
    // ...
};
```

### Add New Achievements:
Edit the `defaultAchievements` array in `GamificationService.initializeDefaultAchievements()`.

### Adjust Level Progression:
Edit the formula in `UserProgress.addXP()` method:
```javascript
this.xpToNextLevel = Math.floor(100 * Math.pow(1.5, this.level - 1));
```

---

## 📊 Analytics to Track

### Key Metrics:
- % of users who unlock at least one achievement
- Average level of active users
- Streak retention rate (% maintaining 7+ days)
- Leaderboard engagement (page views)
- Time to first achievement
- Achievement unlock rate by type

---

## 🎨 UI Customization

### Colors:
- **Bronze:** `from-amber-600 to-amber-800`
- **Silver:** `from-slate-400 to-slate-600`
- **Gold:** `from-yellow-400 to-yellow-600`
- **Platinum:** `from-indigo-400 to-purple-600`

### Level Colors:
- **Apprentice (1-4):** `from-green-500 to-teal-500`
- **Technologist (5-9):** `from-green-500 to-teal-500`
- **Senior (10-24):** `from-blue-500 to-indigo-500`
- **Expert (25-49):** `from-yellow-500 to-orange-500`
- **Master (50+):** `from-purple-500 to-pink-500`

---

## 🚨 Known Limitations (To Address in Phase 2)

1. **No Activity Tracking Yet:**
   - Middleware is created but not yet integrated into existing endpoints
   - Users won't earn XP automatically yet (need to integrate in Phase 3)

2. **No Notifications:**
   - Users don't get notified when they unlock achievements
   - No level-up celebration
   - Coming in Phase 2

3. **No Achievement Showcase:**
   - No dedicated page to view all achievements
   - Dashboard only shows recent 5
   - Coming in Phase 2

4. **No Helpful Voting:**
   - Can't vote on comments/cases as "helpful"
   - Need to add voting feature first

5. **Manual Testing Required:**
   - Use admin endpoint to manually award XP for testing
   - Or integrate tracking middleware into one endpoint at a time

---

## 🧪 Testing Instructions

### 1. Initialize Achievements (One Time):

After deployment, run this once as admin:

```bash
POST https://neurotrace-academy.onrender.com/api/gamification/initialize-achievements
Headers: Authorization: Bearer <your-admin-token>
```

Or via browser console:
```javascript
await fetch('https://neurotrace-academy.onrender.com/api/gamification/initialize-achievements', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    }
});
```

### 2. View Your Progress:

1. Go to `/dashboard`
2. You should see:
   - Level 1 with 0 XP
   - 0-day streak
   - No achievements yet

### 3. View Leaderboard:

1. Click "🏆 Ranks" in navbar
2. Try switching between tabs
3. See yourself in the rankings (even at level 1)

### 4. Manually Award XP (Testing):

As admin, award yourself XP:

```javascript
await fetch('https://neurotrace-academy.onrender.com/api/gamification/award-xp', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        userId: '<your-user-id>',
        xp: 100,
        reason: 'Testing gamification'
    })
});
```

Then refresh Dashboard to see XP increase.

---

## 🔄 Phase 2 Implementation Plan

### Next Priority Tasks:

1. **Achievement Unlock Notifications:**
   - Create toast notification component
   - Show when achievement is unlocked
   - Confetti/celebration animation

2. **Level-Up Celebration:**
   - Modal popup when user levels up
   - Show new level and rewards
   - Motivational message

3. **Achievement Showcase Page:**
   - `/achievements` route
   - Grid of all achievements
   - Show locked/unlocked status
   - Progress toward locked achievements
   - Filter by category

4. **Integrate Activity Tracking:**
   - Add `trackCaseShare` to case creation endpoint
   - Add `trackCommentPost` to comment endpoints
   - Add `trackQuizCompletion` to quiz endpoints
   - Add `trackDailyLogin` to auth middleware

5. **Helpful Voting Feature:**
   - Add "Helpful" button to comments
   - Track votes in database
   - Award XP to comment author
   - Display helpful count

---

## 📝 Code Examples

### How to Add Activity Tracking to an Endpoint:

**Before:**
```javascript
router.post('/cases', auth, async (req, res) => {
    const newCase = await CommunityCase.create(req.body);
    res.json(newCase);
});
```

**After:**
```javascript
import { trackCaseShare } from '../middleware/trackActivity.js';

router.post('/cases', auth, async (req, res, next) => {
    const newCase = await CommunityCase.create(req.body);
    req.newCase = newCase; // Attach to request for middleware
    res.json(newCase);
    next(); // Call next to trigger middleware
}, trackCaseShare);
```

### How to Check for Achievements:

Achievements are checked automatically when XP is awarded. But you can also manually trigger:

```javascript
const newAchievements = await GamificationService.checkAchievements(userId, progress);
if (newAchievements.length > 0) {
    console.log('New achievements unlocked:', newAchievements);
    // Send notification to user
}
```

---

## 🎨 UI Components Usage

### Progress Bar:
```jsx
import ProgressBar from '../components/Gamification/ProgressBar';

<ProgressBar 
    level={10}
    xp={250}
    xpToNextLevel={500}
    showDetails={true}
/>
```

### Streak Display:
```jsx
import StreakDisplay from '../components/Gamification/StreakDisplay';

<StreakDisplay 
    currentStreak={7}
    longestStreak={30}
    compact={false}
/>
```

### Achievement Badge:
```jsx
import AchievementBadge from '../components/Gamification/AchievementBadge';

<AchievementBadge 
    achievement={achievementObject}
    unlocked={true}
    onClick={() => console.log('Badge clicked')}
/>
```

---

## 🔐 Security Considerations

1. **XP Awards:**
   - Only backend can award XP (no client-side manipulation)
   - All activity tracked server-side
   - Validation on all actions

2. **Achievement Unlock:**
   - Criteria checked server-side only
   - No client-side unlock possible
   - Prevent duplicate unlocks

3. **Leaderboard:**
   - Public data (no sensitive info)
   - Rate limiting on queries
   - Cached for performance

---

## 🐛 Troubleshooting

### Achievements Not Showing:
1. Check if achievements were initialized: Look for "✅ Gamification system initialized" in server logs
2. Manually initialize via admin endpoint
3. Check MongoDB `achievements` collection

### XP Not Updating:
1. Check if activity tracking middleware is attached to endpoint
2. Verify `req.user` exists (auth middleware)
3. Check server logs for errors
4. Verify `UserProgress` document exists for user

### Leaderboard Empty:
1. Check if users have `UserProgress` documents
2. Award some XP to test users
3. Check MongoDB `userprogresses` collection

---

## 📚 Related Files

### Backend:
- `server/src/models/Achievement.js`
- `server/src/models/UserProgress.js`
- `server/src/services/gamificationService.js`
- `server/src/routes/gamification.js`
- `server/src/middleware/trackActivity.js`
- `server/src/index.js` (routes registration)

### Frontend:
- `src/components/Gamification/ProgressBar.jsx`
- `src/components/Gamification/AchievementBadge.jsx`
- `src/components/Gamification/StreakDisplay.jsx`
- `src/pages/Leaderboard.jsx`
- `src/pages/Dashboard.jsx` (integration)
- `src/components/Navbar.jsx` (navigation)
- `src/App.jsx` (routing)

---

## 🎯 Success Criteria

Phase 1 is successful if:
- ✅ Achievements initialize on server startup
- ✅ API endpoints return correct data
- ✅ Dashboard displays level/XP/streak
- ✅ Leaderboard loads and displays rankings
- ✅ UI components render correctly
- ✅ No console errors

---

**Status:** Phase 1 deployed and ready for testing! 🚀

**Next Action:** Test the system, then proceed to Phase 2 (Notifications & Showcase) or Phase 3 (Activity Integration).
