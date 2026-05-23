import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
}

const Tabs = ({ items, value, onChange }: TabsProps) => (
  <div
    className="flex gap-1 p-1 rounded-full overflow-x-auto"
    style={{ backgroundColor: "var(--color-accent-light)" }}
    role="tablist"
  >
    {items.map((item) => {
      const isActive = item.id === value;
      const Icon = item.icon;
      return (
        <button
          key={item.id}
          role="tab"
          aria-selected={isActive}
          onClick={() => onChange(item.id)}
          className="relative px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap inline-flex items-center gap-2"
          style={{ color: isActive ? "white" : "var(--color-text-main)" }}
        >
          {isActive && (
            <motion.span
              layoutId="tabs-indicator"
              className="absolute inset-0 rounded-full"
              style={{ backgroundImage: "linear-gradient(to right, var(--color-primary), var(--color-primary-hover))" }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10 inline-flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4" />}
            {item.label}
          </span>
        </button>
      );
    })}
  </div>
);

export default Tabs;
