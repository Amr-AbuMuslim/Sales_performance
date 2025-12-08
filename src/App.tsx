import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TargetsPage } from "./pages/TargetsPage";
import { Layout } from "./components/layout/Layout";
import { ReportsPage } from "./pages/ReportsPage";
// import { getRole } from "./services/authService";

// const ProtectedRoute = ({ children }: any) => {
//   const role = getRole();
//   if (!role) return <Navigate to="/login" />;
//   return children;
// };
function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/targets" replace />} />
          <Route path="/targets" element={<TargetsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
