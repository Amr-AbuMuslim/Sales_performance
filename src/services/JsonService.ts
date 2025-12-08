// src/services/JsonService.ts
import { type TeamTargets } from "../types/index";

// const API_URL = "http://localhost:3001/api";
const LS_DB_KEY = "all_monthly_targets"; // Acts as our "Database"

// ------------------------------------
// LOCAL STORAGE HELPERS (The "Mock Database")
// ------------------------------------

// Returns the entire array of months from Local Storage
const lsGetDB = (): TeamTargets[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(LS_DB_KEY);
  return data ? JSON.parse(data) : [];
};

// Saves the entire array back to Local Storage
const lsSetDB = (data: TeamTargets[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_DB_KEY, JSON.stringify(data));
};

// ------------------------------------
// READ OPERATIONS
// ------------------------------------

export const getMonthlyData = async (
  year: number,
  month: number
): Promise<TeamTargets | null> => {
  // ==========================================
  // 🟢 DEMO MODE: Local Storage (Mock DB)
  // ==========================================
  try {
    const db = lsGetDB();
    // Find the specific record for the requested Month & Year
    const found = db.find((t) => t.year === year && t.month === month);
    return found || null;
  } catch (e) {
    console.error("LS Error", e);
    return null;
  }

  // ==========================================
  // 🔴 PRODUCTION MODE: API Call (Commented)
  // ==========================================
  /*
  try {
    const res = await fetch(`${API_URL}/target?year=${year}&month=${month}`);
    if (res.ok) {
      const data = await res.json();
      return data; 
    }
    return null;
  } catch (error) {
    console.error("API Error", error);
    return null;
  }
  */
};

// ------------------------------------
// WRITE OPERATIONS
// ------------------------------------

export const saveMonthlyData = async (data: TeamTargets) => {
  // ==========================================
  // 🟢 DEMO MODE: Local Storage (Mock DB)
  // ==========================================
  try {
    const db = lsGetDB();
    const index = db.findIndex(
      (t) => t.year === data.year && t.month === data.month
    );

    if (index >= 0) {
      // Update existing record
      db[index] = data;
    } else {
      // Create new record
      db.push(data);
    }

    lsSetDB(db);
    console.log("Saved to Local Storage:", data);
  } catch (e) {
    console.error("LS Save Error", e);
  }

  // ==========================================
  // 🔴 PRODUCTION MODE: API Call (Commented)
  // ==========================================
  /*
  try {
    await fetch(`${API_URL}/target`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Save Error", error);
  }
  */
<<<<<<< HEAD
=======
};

// ------------------------------------
// LEGACY / HELPER OPERATIONS
// ------------------------------------
// (Maintained for compatibility if other parts of the app still call 'getTeam')

export const getTeam = async (): Promise<TeamTargets> => {
  // Just returns the first available record or initializes defaults
  const db = lsGetDB();
  if (db.length > 0) return db[0];
  return await initializeData();
};

export const saveTeam = async (team: TeamTargets) => {
  // Redirects to the main save function
  await saveMonthlyData(team);
};

// ------------------------------------
// INITIALIZATION
// ------------------------------------

export const initializeData = async () => {
  const now = new Date();
  const defaultTeam: TeamTargets = {
    teamId: `init-${now.getTime()}`,
    teamName: "Main Sales Team",
    targetFlags: 500,
    targetDeals: 150,
    targetNights: 800,
    month: now.getMonth(),
    year: now.getFullYear(),
    agents: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Save to DB
  const db = lsGetDB();
  db.push(defaultTeam);
  lsSetDB(db);

  return defaultTeam;
>>>>>>> 35d30558109d7d8a04ae877e67c7ccd59ac0cd43
};

// ------------------------------------
// LEGACY / HELPER OPERATIONS
// ------------------------------------
// (Maintained for compatibility if other parts of the app still call 'getTeam')

export const getTeam = async (): Promise<TeamTargets> => {
  // Just returns the first available record or initializes defaults
  const db = lsGetDB();
  if (db.length > 0) return db[0];
  return await initializeData();
};

export const saveTeam = async (team: TeamTargets) => {
  // Redirects to the main save function
  await saveMonthlyData(team);
};

// ------------------------------------
// INITIALIZATION
// ------------------------------------

export const initializeData = async () => {
  const now = new Date();
  const defaultTeam: TeamTargets = {
    teamId: `init-${now.getTime()}`,
    teamName: "Main Sales Team",
    targetFlags: 500,
    targetDeals: 150,
    targetNights: 800,
    month: now.getMonth(),
    year: now.getFullYear(),
    agents: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Save to DB
  const db = lsGetDB();
  db.push(defaultTeam);
  lsSetDB(db);

  return defaultTeam;
};