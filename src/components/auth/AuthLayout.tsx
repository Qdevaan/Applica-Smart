import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { APP_NAME } from "../../utils/constants";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:p-4 relative">
      {/* Logo - Top Left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10"
      >
        <Link
          to="/"
          className="flex items-center gap-2 text-xl sm:text-2xl font-bold"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#780000] to-[#C1121F]">
            {APP_NAME}
          </span>
        </Link>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default AuthLayout;
