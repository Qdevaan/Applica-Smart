import { useState } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  Moon,
  Sun,
  Bell,
  Shield,
  User,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { authService } from "../services/auth.service";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const Settings = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [applicationUpdates, setApplicationUpdates] = useState(true);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    // Validation
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setIsUpdatingPassword(true);

    const { error } = await authService.updatePassword(newPassword);

    if (error) {
      setPasswordError(error.message || "Failed to update password");
    } else {
      setPasswordSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Clear success message after 3 seconds
      setTimeout(() => setPasswordSuccess(""), 3000);
    }

    setIsUpdatingPassword(false);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 md:mb-8"
            style={{ color: "var(--color-text-main)" }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#780000] to-[#C1121F]">
              Settings
            </span>
          </h1>

          {/* Account Settings */}
          <div
            className="rounded-xl p-4 sm:p-6 shadow-sm border mb-6"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-accent-light)",
            }}
          >
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#780000]" />
              <h2
                className="text-xl sm:text-2xl font-bold"
                style={{ color: "var(--color-text-main)" }}
              >
                Account
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--color-text-body)" }}
                >
                  Email Address
                </label>
                <p
                  className="break-all text-sm sm:text-base"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {user?.email}
                </p>
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--color-text-body)" }}
                >
                  User ID
                </label>
                <p
                  className="font-mono text-xs sm:text-sm break-all"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {user?.id}
                </p>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div
            className="rounded-xl p-4 sm:p-6 shadow-sm border mb-6"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-accent-light)",
            }}
          >
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#780000]" />
              <h2
                className="text-xl sm:text-2xl font-bold"
                style={{ color: "var(--color-text-main)" }}
              >
                Security
              </h2>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--color-text-body)" }}
                >
                  <Lock className="w-4 h-4 inline mr-2" />
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#003049]/50 hover:text-[#003049] dark:text-gray-400 dark:hover:text-white transition-colors"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--color-text-body)" }}
                >
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors opacity-50 hover:opacity-100"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--color-text-body)" }}
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#003049]/50 hover:text-[#003049] dark:text-gray-400 dark:hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {passwordError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {passwordError}
                  </p>
                </motion.div>
              )}

              {passwordSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                >
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {passwordSuccess}
                  </p>
                </motion.div>
              )}

              <Button
                type="submit"
                variant="primary"
                isLoading={isUpdatingPassword}
              >
                <Save className="w-4 h-4 mr-2" />
                Update Password
              </Button>
            </form>

            <div
              className="mt-6 pt-6 border-t"
              style={{ borderColor: "var(--color-accent-light)" }}
            >
              <p
                className="text-sm mb-2"
                style={{ color: "var(--color-text-muted)" }}
              >
                Password Requirements:
              </p>
              <ul
                className="text-sm space-y-1 list-disc list-inside"
                style={{ color: "var(--color-text-muted)" }}
              >
                <li>At least 8 characters long</li>
                <li>Mix of uppercase and lowercase letters (recommended)</li>
                <li>Include numbers and special characters (recommended)</li>
              </ul>
            </div>
          </div>

          {/* Appearance Settings */}
          <div
            className="rounded-xl p-4 sm:p-6 shadow-sm border mb-6"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-accent-light)",
            }}
          >
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              {theme === "dark" ? (
                <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-[#780000]" />
              ) : (
                <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-[#780000]" />
              )}
              <h2
                className="text-xl sm:text-2xl font-bold"
                style={{ color: "var(--color-text-main)" }}
              >
                Appearance
              </h2>
            </div>

            <div
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg"
              style={{ backgroundColor: "var(--color-accent-light)" }}
            >
              <div>
                <h3
                  className="font-medium mb-1"
                  style={{ color: "var(--color-text-main)" }}
                >
                  Theme
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Choose between light and dark mode
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-16 h-8 rounded-full transition-colors shrink-0 ${
                  theme === "dark" ? "bg-[#780000]" : "bg-[#669BBC]"
                }`}
              >
                <motion.div
                  className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center"
                  animate={{
                    x: theme === "dark" ? 32 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {theme === "dark" ? (
                    <Moon className="w-4 h-4 text-[#780000]" />
                  ) : (
                    <Sun className="w-4 h-4 text-[#669BBC]" />
                  )}
                </motion.div>
              </button>
            </div>
          </div>

          {/* Notification Settings */}
          <div
            className="rounded-xl p-4 sm:p-6 shadow-sm border mb-6"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-accent-light)",
            }}
          >
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-[#780000]" />
              <h2
                className="text-xl sm:text-2xl font-bold"
                style={{ color: "var(--color-text-main)" }}
              >
                Notifications
              </h2>
            </div>

            <div className="space-y-4">
              <div
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ backgroundColor: "var(--color-accent-light)" }}
              >
                <div>
                  <h3
                    className="font-medium mb-1"
                    style={{ color: "var(--color-text-main)" }}
                  >
                    Email Notifications
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Receive email updates about your applications
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="w-5 h-5 text-[#780000] focus:ring-[#780000] rounded"
                />
              </div>

              <div
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ backgroundColor: "var(--color-accent-light)" }}
              >
                <div>
                  <h3
                    className="font-medium mb-1"
                    style={{ color: "var(--color-text-main)" }}
                  >
                    Push Notifications
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Get notified about important updates
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={pushNotifications}
                  onChange={(e) => setPushNotifications(e.target.checked)}
                  className="w-5 h-5 text-[#780000] focus:ring-[#780000] rounded"
                />
              </div>

              <div
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ backgroundColor: "var(--color-accent-light)" }}
              >
                <div>
                  <h3
                    className="font-medium mb-1"
                    style={{ color: "var(--color-text-main)" }}
                  >
                    Application Updates
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Stay informed about your job application status
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={applicationUpdates}
                  onChange={(e) => setApplicationUpdates(e.target.checked)}
                  className="w-5 h-5 text-[#780000] focus:ring-[#780000] rounded"
                />
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div
            className="rounded-xl p-6 shadow-sm border border-red-200 mb-6"
            style={{ backgroundColor: "var(--color-surface)" }}
          >
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Danger Zone
            </h2>

            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-medium text-red-900 mb-2">Delete Account</h3>
              <p className="text-sm text-red-700 mb-4">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
              <Button
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
