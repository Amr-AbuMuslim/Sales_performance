import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { LogOut, ShieldCheck } from "lucide-react";
import { logout } from "../../services/authService";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const SupervisorLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* --- MINIMAL SIDEBAR --- */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-20 hidden md:flex flex-col items-center justify-between py-8 bg-white/80 backdrop-blur-xl border-r border-white/50 shadow-xl z-50 relative"
      >
        {/* Logo / Icon */}
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
          <ShieldCheck size={24} />
        </div>

        {/* Vertical Text (Optional style choice) */}
        <div className="flex-1 flex items-center justify-center writing-mode-vertical rotate-180">
          <span className="transform -rotate-90 text-xs font-bold text-gray-400 tracking-widest uppercase opacity-50 whitespace-nowrap">
            Supervisor Mode
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="group relative w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
          title="Logout"
        >
          <LogOut size={20} />
          {/* Tooltip */}
          <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Logout
          </span>
        </button>
      </motion.div>

      {/* --- MOBILE HEADER (Visible only on small screens) --- */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md z-50 flex justify-between items-center px-4 border-b border-gray-200">
        <div className="flex items-center gap-2 font-bold text-gray-700">
          <ShieldCheck className="text-blue-600" /> Supervisor
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-red-500 bg-red-50 rounded-lg"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth md:p-0 pt-16">
        {/* The SupervisorPage renders here */}
        <Outlet />
      </main>
    </div>
  );
};
