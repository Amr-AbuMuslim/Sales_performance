import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { TargetsPage } from "./pages/TargetsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SupervisorPage } from "./pages/SupervisorPage";
import { LoginPage } from "./pages/LoginPage";
import { Layout } from "./components/layout/Layout"; // Standard Admin Layout
import { SupervisorLayout } from "./components/layout/SupervisorLayout"; // <--- NEW IMPORT
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { getSession } from "./services/authService";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      <Routes>
        {/* --- PUBLIC --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RootRedirect />} />

        {/* --- LAYOUT A: ADMIN (Standard Sidebar) --- */}
        <Route element={<Layout />}>
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/targets" element={<TargetsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
        </Route>

        {/* --- LAYOUT B: SUPERVISOR (Minimal Sidebar) --- */}
        {/* Notice this is NOT inside <Layout> anymore */}
        <Route element={<SupervisorLayout />}>
          <Route element={<ProtectedRoute allowedRoles={["supervisor"]} />}>
            <Route path="/supervisor" element={<SupervisorPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

const RootRedirect = () => {
  const session = getSession();
  if (!session) return <Navigate to="/login" replace />;
  if (session.role === "supervisor")
    return <Navigate to="/supervisor" replace />;
  return <Navigate to="/targets" replace />;
};

export default App;
