export type UserRole = "admin" | "viewer" | null;

export const login = (username: string, password: string): UserRole => {
  // Very simple example — replace with real auth later
  if (username === "admin" && password === "WeCanDoiT") {
    localStorage.setItem("role", "admin");
    return "admin";
  }

  if (username === "user" && password === "user123") {
    localStorage.setItem("role", "viewer");
    return "viewer";
  }

  return null;
};

export const getRole = (): UserRole => {
  return (localStorage.getItem("role") as UserRole) || null;
};

export const logout = () => {
  localStorage.removeItem("role");
};
