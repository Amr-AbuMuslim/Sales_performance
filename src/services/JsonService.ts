// src/services/JsonService.ts
import { type TeamTargets } from "../types/index";

const API_URL = "http://localhost:3001/api";
const LS_KEY = "singleTeamTarget"; // Changed key to reflect single team

// ------------------------------------
// LOCAL STORAGE HELPERS
// ------------------------------------

const lsGet = (): TeamTargets | null => {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(LS_KEY);
  return data ? JSON.parse(data) : null;
};

const lsSet = (data: TeamTargets) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(data));
};

// ------------------------------------
// READ OPERATIONS
// ------------------------------------

export const getTeam = async (): Promise<TeamTargets> => {
  try {
    // 1. Try fetching from Backend
    // We assume backend might still return an array, or we adjust the endpoint
    // tailored for a single team. For safety, we take the first item if it's an array.
    const res = await fetch(`${API_URL}/teams`);

    if (res.ok) {
      const apiData = await res.json();

      let singleTeam: TeamTargets;

      // Handle response if it comes as Array (legacy) or Object
      if (Array.isArray(apiData) && apiData.length > 0) {
        singleTeam = apiData[0];
      } else if (!Array.isArray(apiData) && apiData.teamId) {
        singleTeam = apiData;
      } else {
        throw new Error("No valid team data found");
      }

      lsSet(singleTeam);
      return singleTeam;
    }
  } catch (error) {
    console.log("Backend offline or unreachable. Using LocalStorage.");
  }

  // 2. Fallback to LocalStorage
  const localData = lsGet();
  if (localData) {
    return localData;
  }

  // 3. Initialize Default (Singleton)
  return await initializeData();
};

// ------------------------------------
// WRITE OPERATIONS
// ------------------------------------

export const saveTeam = async (team: TeamTargets) => {
  // 1. Update Local Storage
  lsSet(team);

  // 2. Sync to Backend (Placeholder for API call)
  // await fetch(`${API_URL}/teams/${team.teamId}`, { method: 'PUT', body: JSON.stringify(team) });
};

// ------------------------------------
// INITIALIZATION
// ------------------------------------

export const initializeData = async () => {
  const defaultTeam: TeamTargets = {
    teamId: "default-team",
    teamName: "Main Sales Team",
    targetFlags: 500,
    targetDeals: 150,
    targetNights: 800,
    agents: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  lsSet(defaultTeam);
  return defaultTeam;
};
export const getMonthlyData = async (
  year: number,
  month: number
): Promise<TeamTargets | null> => {
  try {
    const res = await fetch(`${API_URL}/target?year=${year}&month=${month}`);
    if (res.ok) {
      const data = await res.json();
      return data; // Returns null if no record exists
    }
    return null;
  } catch (error) {
    console.error("API Error", error);
    return null;
  }
};

export const saveMonthlyData = async (data: TeamTargets) => {
  try {
    await fetch(`${API_URL}/target`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Save Error", error);
  }
};
