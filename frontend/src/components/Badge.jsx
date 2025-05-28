import React from 'react';
import { motion } from 'framer-motion';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  animate = false,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-gray-700 text-gray-300',
    primary: 'bg-orange-500/20 text-orange-300',
    success: 'bg-green-500/20 text-green-300',
    warning: 'bg-yellow-500/20 text-yellow-300',
    danger: 'bg-red-500/20 text-red-300',
    info: 'bg-blue-500/20 text-blue-300',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <motion.span
      className={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      animate={
        animate
          ? {
              scale: [1, 1.05, 1],
              opacity: [1, 0.8, 1],
            }
          : {}
      }
      transition={
        animate
          ? {
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }
          : {}
      }
      {...props}
    >
      {children}
    </motion.span>
  );
};

export default Badge;
