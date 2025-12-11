export type UserRole = "admin" | "supervisor" | null;

export interface UserSession {
  role: UserRole;
  teamId: string; // "team-a", "team-b", or "all"
  username: string;
}

export const login = (
  username: string,
  password: string
): UserSession | null => {
  // 1. Team A Admin
  if (username === "adminA" && password === "teamA123") {
    const session: UserSession = {
      role: "admin",
      teamId: "team-alpha",
      username,
    };
    saveSession(session);
    return session;
  }

  // 2. Team B Admin
  if (username === "adminB" && password === "teamB123") {
    const session: UserSession = {
      role: "admin",
      teamId: "team-beta",
      username,
    };
    saveSession(session);
    return session;
  }

  // 3. Supervisor (Can see everything)
  if (username === "super" && password === "super123") {
    const session: UserSession = {
      role: "supervisor",
      teamId: "all",
      username,
    };
    saveSession(session);
    return session;
  }

  return null;
};

// Helper to save to LocalStorage
const saveSession = (session: UserSession) => {
  localStorage.setItem("user_role", session.role || "");
  localStorage.setItem("user_teamId", session.teamId || "");
  localStorage.setItem("user_name", session.username || "");
};

// Helper to get current session
export const getSession = (): UserSession | null => {
  const role = localStorage.getItem("user_role") as UserRole;
  const teamId = localStorage.getItem("user_teamId");
  const username = localStorage.getItem("user_name");

  if (!role || !teamId) return null;
  return { role, teamId, username: username || "" };
};

export const logout = () => {
  localStorage.removeItem("user_role");
  localStorage.removeItem("user_teamId");
  localStorage.removeItem("user_name");
};
