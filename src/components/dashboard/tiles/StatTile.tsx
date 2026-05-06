import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import AnimatedNumber from "../../ui/AnimatedNumber";

interface StatTileProps {
  label: string;
  value: number | string;
  suffix?: string;
  icon: LucideIcon;
  accent: string;
  bgAccent: string;
  delay?: number;
}

const StatTile = ({
  label,
  value,
  suffix = "",
  icon: Icon,
  accent,
  bgAccent,
  delay = 0,
}: StatTileProps) => (
  <motion.div
    initial={{ opacity: 0, y: 24, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -4, scale: 1.02 }}
    className="rounded-2xl p-5 shadow-md border backdrop-blur-md h-full flex flex-col justify-between"
    style={{
      backgroundColor: "color-mix(in srgb, var(--color-surface) 85%, transparent)",
      borderColor: "var(--color-accent-light)",
    }}
  >
    <div
      className="inline-flex w-10 h-10 rounded-lg items-center justify-center mb-3"
      style={{ backgroundColor: bgAccent }}
    >
      <Icon className="w-5 h-5" style={{ color: accent }} />
    </div>
    <div>
      <p className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: "var(--color-text-main)" }}>
        <AnimatedNumber value={value} suffix={suffix} />
      </p>
      <p className="text-xs sm:text-sm" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </p>
    </div>
  </motion.div>
);

export default StatTile;
