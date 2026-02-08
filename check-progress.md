# Quick Progress Check

Run this in your browser console to see your actual progress data:

```javascript
fetch('https://neurotrace-academy.onrender.com/api/gamification/progress', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
})
.then(res => res.json())
.then(data => {
  console.log('📊 YOUR ACTUAL PROGRESS:', data);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🎮 Level: ${data.level}`);
  console.log(`⭐ XP: ${data.xp}`);
  console.log(`📈 XP to Next: ${data.xpToNextLevel}`);
  console.log(`🔥 Streak: ${data.streak?.current} days`);
  console.log(`🏅 Achievements: ${data.achievements?.length || 0}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('📊 Stats:');
  console.table(data.stats);
  
  console.log('\n🏆 Achievements Unlocked:');
  if (data.achievements && data.achievements.length > 0) {
    console.table(data.achievements.map(a => ({
      Name: a.achievement?.name || 'Unknown',
      Unlocked: new Date(a.unlockedAt).toLocaleDateString()
    })));
  } else {
    console.log('None yet');
  }
  
  // Compare with leaderboard data
  console.log('\n⚠️ COMPARISON:');
  console.log(`Leaderboard shows: Level 5, 3 XP`);
  console.log(`Your actual progress: Level ${data.level}, ${data.xp} XP`);
  
  if (data.level === 5 && data.xp === 3) {
    console.log('❌ Something went wrong - XP is way too low!');
    console.log('You should have ~506 XP from migration');
  } else if (data.xp > 100) {
    console.log('✅ Your actual XP looks correct!');
    console.log('The leaderboard might be showing cached/old data');
  }
})
.catch(err => console.error('Error:', err));
```

Please run this and tell me:
1. What level and XP does it show?
2. Does it match what the leaderboard is showing?
