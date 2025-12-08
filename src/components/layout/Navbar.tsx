import React from "react";
import { Target, Bell, User, Settings } from "lucide-react";
import { motion } from "framer-motion";

export const Navbar: React.FC = () => {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm"
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Target size={24} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-gray-900"> Performance Dashboard</h1>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
          >
            <Bell size={20} className="text-gray-700" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Settings size={20} className="text-gray-700" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>
            <span className="hidden md:block text-gray-700">Admin</span>
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};
