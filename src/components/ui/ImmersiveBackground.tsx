import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  intensity?: "subtle" | "normal" | "strong";
}

const ImmersiveBackground = ({ children, intensity = "normal" }: Props) => {
  const blobOpacity =
    intensity === "subtle" ? 0.35 : intensity === "strong" ? 0.85 : 0.6;

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom right, var(--color-background), var(--color-surface), var(--color-accent-light))",
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl"
          style={{
            backgroundColor: "var(--color-primary)",
            opacity: blobOpacity * 0.3,
          }}
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-10 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl"
          style={{
            backgroundColor: "var(--color-primary-hover)",
            opacity: blobOpacity * 0.25,
          }}
          animate={{ x: [0, -120, 0], y: [0, 100, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-20 left-1/3 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl"
          style={{
            backgroundColor: "var(--color-accent)",
            opacity: blobOpacity * 0.4,
          }}
          animate={{ x: [0, 80, 0], y: [0, -80, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default ImmersiveBackground;
