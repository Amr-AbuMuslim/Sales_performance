// src/services/JsonService.ts
import { type TeamTargets } from "../types/index";

const LS_KEY_SINGLE = "singleTeamTarget";
const LS_KEY_MONTHLY = "monthlyTargets";

// ------------------------------------
// LOCAL STORAGE HELPERS
// ------------------------------------
const lsGet = (key: string): any | null => {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

const lsSet = (key: string, data: any) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
};

// ------------------------------------
// SINGLE TEAM OPERATIONS
// ------------------------------------
export const getTeam = async (): Promise<TeamTargets> => {
  const localData = lsGet(LS_KEY_SINGLE);
  if (localData) return localData;
  return await initializeTeam();
};

export const saveTeam = async (team: TeamTargets) => {
  lsSet(LS_KEY_SINGLE, team);
};

// ------------------------------------
// MONTHLY DATA OPERATIONS
// ------------------------------------
export const getMonthlyData = async (
  year: number,
  month: number
): Promise<TeamTargets | null> => {
  const allMonthly = lsGet(LS_KEY_MONTHLY) || {};
  const key = `${year}-${month}`;
  return allMonthly[key] || null;
};

export const saveMonthlyData = async (data: TeamTargets) => {
  const allMonthly = lsGet(LS_KEY_MONTHLY) || {};
  const now = new Date();
  const key = `${new Date(data.createdAt).getFullYear()}-${new Date(
    data.createdAt
  ).getMonth()}`;

  // If createdAt is missing, fallback to current month/year
  const storageKey = data.createdAt
    ? key
    : `${now.getFullYear()}-${now.getMonth()}`;

  allMonthly[storageKey] = { ...data, updatedAt: new Date().toISOString() };
  lsSet(LS_KEY_MONTHLY, allMonthly);
};

// ------------------------------------
// INITIALIZATION
// ------------------------------------
export const initializeTeam = async (): Promise<TeamTargets> => {
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
  lsSet(LS_KEY_SINGLE, defaultTeam);
  return defaultTeam;
};

// ------------------------------------
// HELPER: Reset Monthly Data (Optional)
export const resetMonthlyData = () => {
  lsSet(LS_KEY_MONTHLY, {});
};
