import { supabase } from './supabaseClient';

const STORAGE_KEY = 'athlete_workouts';

export const saveWorkoutLocal = (workout) => {
  const existing = getLocalWorkouts();
  const newWorkout = {
    ...workout,
    id: Date.now().toString(), // Simple local ID
    synced: false,
    timestamp: new Date().toISOString()
  };
  
  existing.push(newWorkout);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  return newWorkout;
};

export const getLocalWorkouts = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading from local storage", e);
    return [];
  }
};

export const syncWithSupabase = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: 'User not logged in' };

  const workouts = getLocalWorkouts();
  const unsynced = workouts.filter(w => !w.synced);
  
  if (unsynced.length === 0) return { success: true, syncedCount: 0 };
  
  console.log("Syncing to Supabase...", unsynced);
  
  let successCount = 0;
  
  for (const w of unsynced) {
    const { data, error } = await supabase
      .from('workouts')
      .insert([
        { 
          user_id: session.user.id,
          date: w.date, 
          exercise: w.exercise, 
          distance: w.distance, 
          duration: w.duration 
        }
      ]);
      
    if (error) {
      console.error("Error syncing workout", error);
    } else {
      w.synced = true;
      successCount++;
    }
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
  
  return { success: true, syncedCount: successCount };
};
