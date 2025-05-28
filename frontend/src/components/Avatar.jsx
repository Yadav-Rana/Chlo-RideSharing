import React from 'react';
import { motion } from 'framer-motion';

const Avatar = ({
  name,
  image,
  size = 'md',
  status,
  className = '',
  ...props
}) => {
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const statusColors = {
    online: 'bg-green-400',
    offline: 'bg-gray-400',
    away: 'bg-yellow-400',
    busy: 'bg-red-400',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <motion.div
        className={`${
          sizeClasses[size]
        } rounded-full flex items-center justify-center text-white font-bold ${
          image ? '' : 'bg-gradient-to-r from-amber-400 to-orange-500'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        {...props}
      >
        {image ? (
          <img
            src={image}
            alt={name || 'Avatar'}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          getInitials(name)
        )}
      </motion.div>
      
      {status && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ${
            statusColors[status]
          } ring-2 ring-[#1A1E2E] ${
            size === 'xs' || size === 'sm'
              ? 'w-2 h-2'
              : size === 'md'
              ? 'w-2.5 h-2.5'
              : 'w-3 h-3'
          }`}
        />
      )}
    </div>
  );
};

export default Avatar;
