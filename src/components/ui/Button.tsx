import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode, CSSProperties } from "react";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles =
    "font-semibold rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles: Record<string, CSSProperties> = {
    primary: {
      backgroundImage:
        "linear-gradient(to right, var(--color-primary), var(--color-primary-hover))",
      color: "white",
      boxShadow: "0 10px 25px -10px rgba(120, 0, 0, 0.45)",
    },
    secondary: {
      backgroundColor: "var(--color-text-main)",
      color: "white",
    },
    outline: {
      border: "2px solid var(--color-primary)",
      color: "var(--color-primary)",
      backgroundColor: "transparent",
    },
    ghost: {
      color: "var(--color-text-main)",
      backgroundColor: "transparent",
    },
  };

  const variants = {
    primary: "hover:shadow-2xl",
    secondary: "hover:opacity-90",
    outline: "hover:opacity-80",
    ghost: "hover:opacity-80",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";

  const hoverScale = disabled || isLoading ? 1 : 1.03;
  const hoverShadow =
    variant === "primary" && !disabled && !isLoading
      ? "0 20px 40px -12px rgba(120, 0, 0, 0.55)"
      : undefined;

  return (
    <motion.button
      whileHover={{ scale: hoverScale, boxShadow: hoverShadow }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className} flex items-center justify-center gap-2`}
      style={variantStyles[variant]}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button;
