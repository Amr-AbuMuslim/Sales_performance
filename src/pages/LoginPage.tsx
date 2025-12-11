import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Lock, User } from "lucide-react";

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const session = login(username, password);

    if (session) {
      toast.success("Welcome back!");

      if (session.role === "supervisor") {
        navigate("/supervisor");
      } else {
        navigate("/targets");
      }
    } else {
      toast.error("Invalid credentials");
    }
  };

  return (
    <div
      className="
        min-h-screen w-full 
        bg-cover bg-center bg-no-repeat 
        bg-[url('/digital-art-isolated-house.jpg')]    
        flex items-center justify-center
        relative
      "
    >
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-sm"></div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="
          relative z-10 
          w-[90%] max-w-md
          bg-white/10 backdrop-blur-xl
          border border-white/20
          shadow-2xl
          rounded-2xl
          p-8
        "
      >
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-white text-center mb-8"
        >
          Welcome Back
        </motion.h2>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Username */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-black/60" size={20} />
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="
                w-full py-3 pl-10 pr-4 
                bg-white/10 text-white
                placeholder-white/40
                border border-white/20
                rounded-lg
                focus:outline-none 
                focus:border-blue-400 
                transition
              "
              placeholder="Username"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-black/60" size={20} />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full py-3 pl-10 pr-4 
                bg-white/10 text-white
                placeholder-white/40
                border border-white/20
                rounded-lg
                focus:outline-none 
                focus:border-blue-400 
                transition
              "
              placeholder="Password"
            />
          </div>

          {/* Button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="
              w-full py-3 mt-2
              bg-gradient-to-r from-blue-600 to-indigo-600
              text-white font-semibold
              rounded-lg shadow-lg
              transition-all duration-300
            "
          >
            Sign In
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};
