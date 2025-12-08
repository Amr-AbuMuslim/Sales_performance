import { useState } from "react";
import { login } from "../services/authService";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    const role = login(username, password);

    if (!role) {
      toast.error("Invalid credentials");
      return;
    }

    toast.success("Login successful");
    navigate("/countdown");
  };

  return (
    <div
      className="h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: "url('/wallpaper.avif')",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* Animated Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm"
      >
        <Card className="p-8 bg-white/20 backdrop-blur-xl shadow-xl rounded-2xl border border-white/30">
          <h2 className="text-2xl font-bold mb-6 text-white text-center tracking-wide">
            Welcome Back 👋
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/80">Username</label>
              <Input
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 text-white placeholder-white/50 bg-white/10 border-white/30"
              />
            </div>

            <div>
              <label className="text-sm text-white/80">Password</label>
              <Input
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 text-white placeholder-white/50 bg-white/10 border-white/30"
              />
            </div>

            <Button
              onClick={handleLogin}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Login
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
