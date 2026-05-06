import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { APP_NAME } from "../../utils/constants";
import { useAuth } from "../../hooks/useAuth";

const DashboardNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const navLinks = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Applications", href: "/applications", icon: Briefcase },
    { label: "Resume", href: "/resume", icon: FileText },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 100);
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login", { replace: true });
    }
  };

  const isActiveRoute = (path: string) => location.pathname === path;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md shadow-sm"
      style={{
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-accent)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-xl font-bold transition-colors"
            style={{ color: "var(--color-primary)" }}
          >
            {APP_NAME}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = isActiveRoute(link.href);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: isActive
                      ? "var(--color-accent-light)"
                      : "transparent",
                    color: isActive
                      ? "var(--color-primary)"
                      : "var(--color-text-main)",
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-3">
            {/* Notifications */}
            <button
              className="relative p-2 rounded-lg transition-colors"
              style={{ color: "var(--color-text-main)" }}
            >
              <Bell className="w-5 h-5" />
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: "var(--color-primary-hover)" }}
              ></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-2 rounded-lg transition-colors"
                style={{ color: "var(--color-text-main)" }}
              >
                <User className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-2"
                    style={{
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-accent)",
                    }}
                  >
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 transition-colors"
                      style={{ color: "var(--color-text-main)" }}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-2 px-4 py-2 transition-colors"
                      style={{ color: "var(--color-text-main)" }}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <hr
                      className="my-2"
                      style={{ borderColor: "var(--color-accent)" }}
                    />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 w-full text-left transition-colors"
                      style={{ color: "var(--color-primary)" }}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: "var(--color-text-main)" }}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
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
              backgroundColor: "var(--color-surface)",
              borderTop: "1px solid var(--color-accent)",
            }}
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = isActiveRoute(link.href);
                return (
                  <Link
                    key={link.href}
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
                );
              })}

              <hr style={{ borderColor: "var(--color-accent)" }} className="my-2" />

              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors"
                style={{ color: "var(--color-text-main)" }}
              >
                <User className="w-5 h-5" />
                Profile
              </Link>

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
    </nav>
  );
};

export default DashboardNavbar;
