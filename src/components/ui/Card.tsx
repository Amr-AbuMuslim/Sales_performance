import React from "react";
import { motion } from "motion/react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "glass" | "gradient";
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  variant = "default",
  hover = false,
  onClick,
}) => {
  const variants = {
    default: "bg-white border border-gray-200",
    glass:
      "bg-[#23807e]/20 p-4 rounded-full mb-4 shadow-inner group-hover:scale-110 transition-transform",
    gradient:
      "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={hover ? { scale: 1.02, y: -4 } : {}}
      transition={{ duration: 0.3 }}
      className={`rounded-xl shadow-lg p-6 ${variants[variant]} ${className} ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};
