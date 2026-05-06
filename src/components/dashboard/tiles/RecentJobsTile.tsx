import { motion } from "framer-motion";
import { ArrowUpRight, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RecentJobsTile = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-5 shadow-md border backdrop-blur-md h-full flex flex-col"
      style={{
        backgroundColor: "color-mix(in srgb, var(--color-surface) 85%, transparent)",
        borderColor: "var(--color-accent-light)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold" style={{ color: "var(--color-text-main)" }}>
          Matched jobs
        </h3>
        <button
          onClick={() => navigate("/jobs")}
          className="text-xs font-semibold inline-flex items-center gap-1"
          style={{ color: "var(--color-primary)" }}
        >
          Browse all <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-2 py-6 border border-dashed rounded-xl"
           style={{ borderColor: "var(--color-accent-light)" }}>
        <Briefcase className="w-8 h-8" style={{ color: "var(--color-text-muted)" }} />
        <p className="text-sm text-center" style={{ color: "var(--color-text-muted)" }}>
          Run the ML matcher on the Jobs page to see matches here.
        </p>
        <button
          onClick={() => navigate("/jobs")}
          className="text-sm font-semibold px-4 py-2 rounded-full"
          style={{ backgroundColor: "var(--color-accent-light)", color: "var(--color-primary)" }}
        >
          Open Jobs
        </button>
      </div>
    </motion.div>
  );
};

export default RecentJobsTile;
