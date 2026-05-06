import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
} from "lucide-react";
import { APP_NAME } from "../../utils/constants";
import { useAuth } from "../../hooks/useAuth";
import Avatar from "../ui/Avatar";
import { useAvatar } from "../../hooks/useAvatar";

const DashboardNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { url: avatarUrl, name } = useAvatar();

  const navLinks = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Jobs", href: "/jobs", icon: Search },
    { label: "Resume", href: "/resume", icon: FileText },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login", { replace: true });
    }
  };

  const isActiveRoute = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl shadow-sm"
      style={{
        backgroundColor: "color-mix(in srgb, var(--color-surface) 75%, transparent)",
        borderBottom: "1px solid var(--color-accent-light)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-xl font-bold"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#780000] to-[#C1121F]">
                {APP_NAME}
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link, index) => {
              const Icon = link.icon;
              const isActive = isActiveRoute(link.href);
              return (
                <motion.div
                  key={link.href}
                  initial={{ y: -16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.35, delay: 0.15 + index * 0.05 }}
                  whileHover={{ y: -2 }}
                  className="relative"
                >
                  <Link
                    to={link.href}
                    className="relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{
                      color: isActive ? "var(--color-primary)" : "var(--color-text-main)",
                    }}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-indicator"
                        className="absolute inset-0 rounded-lg"
                        style={{
                          backgroundColor: "var(--color-accent-light)",
                          boxShadow: "0 4px 16px -8px rgba(120, 0, 0, 0.4)",
                        }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-3">
            <Avatar
              url={avatarUrl}
              name={name}
              size="md"
              ring
              ariaLabel="Open profile"
              onClick={() => navigate("/profile")}
            />
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: "var(--color-text-main)" }}
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="x"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden"
            style={{
              backgroundColor: "color-mix(in srgb, var(--color-surface) 92%, transparent)",
              borderTop: "1px solid var(--color-accent-light)",
            }}
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link, index) => {
                const Icon = link.icon;
                const isActive = isActiveRoute(link.href);
                return (
                  <motion.div
                    key={link.href}
                    initial={{ x: -24, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors"
                      style={{
                        backgroundColor: isActive
                          ? "var(--color-accent-light)"
                          : "transparent",
                        color: isActive
                          ? "var(--color-primary)"
                          : "var(--color-text-main)",
                      }}
                    >
                      <Icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}

              <hr style={{ borderColor: "var(--color-accent-light)" }} className="my-2" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg font-medium transition-colors"
                style={{ color: "var(--color-primary)" }}
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default DashboardNavbar;
