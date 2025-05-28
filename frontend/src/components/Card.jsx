import React from "react";
import {motion} from "framer-motion";

const Card = ({
  children,
  title,
  subtitle,
  className = "",
  glow = false,
  hover = true,
  ...props
}) => {
  return (
    <motion.div
      className={`bg-[#1E2235] rounded-2xl p-6 shadow-lg ${
        glow ? "glow-card" : ""
      } ${className}`}
      whileHover={hover ? {y: -5, transition: {duration: 0.2}} : {}}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h2 className="text-xl font-semibold text-orange-500">{title}</h2>
          )}
          {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </motion.div>
  );
};

export default Card;
