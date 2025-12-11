// src/lib/teamHelper.ts

export const getTeamNameById = (teamId: string): string => {
  if (teamId === "team-alpha") return "Mavericks";
  if (teamId === "team-beta") return "Little ATMs";
  return "Sales Team"; // Fallback
};
