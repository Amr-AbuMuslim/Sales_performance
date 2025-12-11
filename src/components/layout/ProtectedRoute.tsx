import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getSession, type UserRole } from "../../services/authService";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]; // Optional: If we want to restrict specific pages
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
}) => {
  const session = getSession();

  // 1. Check if user is logged in
  if (!session) {
    // If not, kick them to login
    return <Navigate to="/login" replace />;
  }

  // 2. Check if user has permission for this specific route
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    // If a Supervisor tries to go to Admin pages, send them to Supervisor Dashboard
    if (session.role === "supervisor") {
      return <Navigate to="/supervisor" replace />;
    }
    // If an Admin tries to go to Supervisor pages, send them to Targets
    if (session.role === "admin") {
      return <Navigate to="/targets" replace />;
    }
  }

  // 3. If all checks pass, render the child routes (The "Outlet")
  return <Outlet />;
};
