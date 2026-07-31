// Formula engine translating the Excel formulas into JavaScript

export const calculateAthleteScore = (dailyLog, userSettings, currentRecoveryScore) => {
  if (!dailyLog || !userSettings) return 0;
  
  const { steps, sleep_hrs, water_l, cal_in, cal_burned } = dailyLog;
  const { step_goal, sleep_goal, water_goal, cal_goal } = userSettings;
  
  // Weights based on the Excel formula:
  // (Steps 20%) + (Sleep 20%) + (Workout 25%) + (Recovery 15%) + (Water 10%) + (Calories 10%)
  
  let score = 0;
  
  // Steps (20%)
  if (steps && step_goal) {
    score += Math.min(steps / step_goal, 1) * 100 * 0.2;
  }
  
  // Sleep (20%)
  if (sleep_hrs && sleep_goal) {
    score += Math.min(sleep_hrs / sleep_goal, 1) * 100 * 0.2;
  }
  
  // Water (10%)
  if (water_l && water_goal) {
    score += Math.min(water_l / water_goal, 1) * 100 * 0.1;
  }
  
  // Calories (10%)
  if (cal_in && cal_goal) {
    score += Math.max(0, 100 - Math.min(Math.abs(cal_in - cal_goal) / cal_goal, 1) * 100) * 0.1;
  }
  
  // Recovery (15%)
  if (currentRecoveryScore) {
    score += currentRecoveryScore * 0.15;
  }
  
  // Workout is complex (needs workout logs), so we assume a simplified 25% if they logged a workout that day
  // This will be added in the main component
  
  return Math.round(score);
};

export const calculateStreaks = (logsArray, targetDate) => {
  // Sort logs by date descending
  const sorted = [...logsArray].sort((a, b) => new Date(b.date) - new Date(a.date));
  let currentStreak = 0;
  
  for (let i = 0; i < sorted.length; i++) {
    // Check if dates are consecutive (simplified for this utility)
    const logDate = new Date(sorted[i].date);
    const expectedDate = new Date(targetDate);
    expectedDate.setDate(expectedDate.getDate() - i);
    
    if (logDate.toDateString() === expectedDate.toDateString()) {
      currentStreak++;
    } else {
      break; // Streak broken
    }
  }
  
  return currentStreak;
};
