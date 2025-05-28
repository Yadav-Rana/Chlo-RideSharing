import {motion} from "framer-motion";

const Button = ({
  children,
  type = "button",
  onClick,
  disabled = false,
  variant = "primary",
  className = "",
  fullWidth = false,
  size = "md",
}) => {
  const baseClasses = "rounded font-medium focus:outline-none transition-all";

  const variantClasses = {
    primary:
      "bg-gradient-primary text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40",
    secondary:
      "bg-[#1E2235] text-white border border-gray-700 hover:bg-[#252A3D]",
    success:
      "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/40",
    danger:
      "bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/40",
    outline:
      "bg-transparent border border-orange-500 text-white hover:bg-orange-500/10",
  };

  const sizeClasses = {
    sm: "py-1 px-3 text-sm",
    md: "py-2 px-4",
    lg: "py-3 px-6 text-lg",
  };

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";
  const widthClass = fullWidth ? "w-full" : "";

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${widthClass} ${className}`;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
      whileHover={!disabled ? {scale: 1.02} : {}}
      whileTap={!disabled ? {scale: 0.98} : {}}
      transition={{type: "spring", stiffness: 400, damping: 10}}
    >
      {children}
    </motion.button>
  );
};

export default Button;
