import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import AccentColorPicker from "./AccentColorPicker";
import DefaultTemplatePicker from "./DefaultTemplatePicker";

const AppearanceTab = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 rounded-lg"
           style={{ backgroundColor: "var(--color-accent-light)" }}>
        <div>
          <p className="font-medium" style={{ color: "var(--color-text-main)" }}>Theme</p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Light or dark mode</p>
        </div>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className={`relative w-16 h-8 rounded-full ${theme === "dark" ? "bg-[#780000]" : "bg-[#669BBC]"}`}
        >
          <motion.div
            className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center"
            animate={{ x: theme === "dark" ? 32 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {theme === "dark" ? <Moon className="w-4 h-4 text-[#780000]" /> : <Sun className="w-4 h-4 text-[#669BBC]" />}
          </motion.div>
        </button>
      </div>

      <AccentColorPicker />
      <DefaultTemplatePicker />
    </div>
  );
};

export default AppearanceTab;
