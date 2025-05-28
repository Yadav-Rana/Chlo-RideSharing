import React from "react";
import {motion} from "framer-motion";

const ChloLogo = ({size = "md", animate = false, className = ""}) => {
  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
    "2xl": "w-32 h-32",
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className} relative flex items-center justify-center`}
      whileHover={animate ? {rotate: 10, scale: 1.05} : {}}
      initial={animate ? {opacity: 0, scale: 0.8} : {}}
      animate={animate ? {opacity: 1, scale: 1} : {}}
      transition={{type: "spring", stiffness: 300, damping: 20}}
    >
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background Circle */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6D00" />
            <stop offset="100%" stopColor="#FFA726" />
          </linearGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="url(#logoGradient)"
          className="logo-circle"
        />

        {/* C shaped like a wheel */}
        <path
          d="M35 30 A20 20 0 1 0 35 70"
          stroke="white"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="35" cy="50" r="3" fill="white" />
        <circle cx="35" cy="30" r="3" fill="white" />
        <circle cx="35" cy="70" r="3" fill="white" />

        {/* H with a road divider */}
        <line
          x1="50"
          y1="30"
          x2="50"
          y2="70"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <line
          x1="65"
          y1="30"
          x2="65"
          y2="70"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <line
          x1="50"
          y1="50"
          x2="65"
          y2="50"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="2,2"
        />

        {/* L as a map pin */}
        <path
          d="M75 30 L75 60 L85 70"
          stroke="white"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="85" cy="70" r="3" fill="white" />

        {/* O as a circular steering wheel */}
        <circle
          cx="85"
          cy="40"
          r="10"
          stroke="white"
          strokeWidth="6"
          fill="none"
        />
        <circle cx="85" cy="40" r="3" fill="white" />
        <line x1="85" y1="30" x2="85" y2="33" stroke="white" strokeWidth="2" />
        <line x1="85" y1="47" x2="85" y2="50" stroke="white" strokeWidth="2" />
        <line x1="75" y1="40" x2="78" y2="40" stroke="white" strokeWidth="2" />
        <line x1="92" y1="40" x2="95" y2="40" stroke="white" strokeWidth="2" />
      </svg>
    </motion.div>
  );
};

export default ChloLogo;
