import { supabase } from './supabaseClient';

export const saveLocal = (tableName, dataObj) => {
  const existing = getLocal(tableName);
  const newItem = {
    ...dataObj,
    id: Date.now().toString(), // Simple local ID
    synced: false,
    timestamp: new Date().toISOString()
  };
  
  existing.push(newItem);
  localStorage.setItem(`offline_${tableName}`, JSON.stringify(existing));
  return newItem;
};

export const getLocal = (tableName) => {
  try {
    const data = localStorage.getItem(`offline_${tableName}`);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading from local storage", e);
    return [];
  }
};

export const syncWithSupabase = async (tableName) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: 'User not logged in' };

  const items = getLocal(tableName);
  const unsynced = items.filter(w => !w.synced);
  
  if (unsynced.length === 0) return { success: true, syncedCount: 0 };
  
  console.log(`Syncing ${tableName} to Supabase...`, unsynced);
  
  let successCount = 0;
  
  for (const item of unsynced) {
    // Strip local-only fields
    const { id, synced, timestamp, ...payload } = item;
    payload.user_id = session.user.id; // inject user id

    const { error } = await supabase
      .from(tableName)
      .insert([payload]);
      
    if (error) {
      console.error(`Error syncing ${tableName}`, error);
    } else {
      item.synced = true;
      successCount++;
    }
  }
  
  localStorage.setItem(`offline_${tableName}`, JSON.stringify(items));
  
  return { success: true, syncedCount: successCount };
};
