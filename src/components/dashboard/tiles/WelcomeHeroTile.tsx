import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

const WelcomeHeroTile = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const displayName = profile?.name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl p-6 sm:p-8 shadow-md border backdrop-blur-md h-full"
      style={{
        backgroundColor: "color-mix(in srgb, var(--color-surface) 85%, transparent)",
        borderColor: "var(--color-accent-light)",
      }}
    >
      <div
        aria-hidden
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-30 blur-3xl"
        style={{ backgroundImage: "linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))" }}
      />
      <div className="relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full text-xs font-semibold"
             style={{ backgroundColor: "var(--color-accent-light)", color: "var(--color-primary)" }}>
          <Sparkles className="w-3 h-3" />
          Welcome back
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 leading-tight"
            style={{ color: "var(--color-text-main)" }}>
          Hello,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#780000] to-[#C1121F]">
            {displayName}
          </span>
        </h1>
        <p className="text-base mb-6" style={{ color: "var(--color-text-muted)" }}>
          Pick up where you left off — your last template is one click away.
        </p>
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/resume")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white shadow-lg"
          style={{
            backgroundImage: "linear-gradient(to right, var(--color-primary), var(--color-primary-hover))",
            boxShadow: "0 10px 25px -10px rgba(120, 0, 0, 0.45)",
          }}
        >
          Continue building <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default WelcomeHeroTile;
