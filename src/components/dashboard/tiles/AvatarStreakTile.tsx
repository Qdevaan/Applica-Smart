import { motion } from "framer-motion";
import Avatar from "../../ui/Avatar";
import { useAvatar } from "../../../hooks/useAvatar";
import { useAuth } from "../../../hooks/useAuth";

function computeCompletion(profile: any | null): number {
  if (!profile) return 0;
  const checks = [
    !!profile.name,
    !!profile.phone,
    !!profile.address,
    !!profile.bio,
    Array.isArray(profile.skills) && profile.skills.length > 0,
    Array.isArray(profile.education) && profile.education.length > 0,
    Array.isArray(profile.experience) && profile.experience.length > 0,
    !!profile.photo_url,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

const AvatarStreakTile = () => {
  const { url, name } = useAvatar();
  const { profile } = useAuth();
  const pct = computeCompletion(profile);
  const ringPct = Math.max(0, Math.min(100, pct));

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-6 shadow-md border backdrop-blur-md h-full flex flex-col items-center justify-center text-center gap-3"
      style={{
        backgroundColor: "color-mix(in srgb, var(--color-surface) 85%, transparent)",
        borderColor: "var(--color-accent-light)",
      }}
    >
      <div
        className="relative inline-flex items-center justify-center rounded-full"
        style={{
          width: 112,
          height: 112,
          background: `conic-gradient(var(--color-primary) ${ringPct}%, var(--color-accent-light) ${ringPct}% 100%)`,
        }}
      >
        <div
          className="rounded-full flex items-center justify-center"
          style={{ width: 96, height: 96, backgroundColor: "var(--color-surface)" }}
        >
          <Avatar url={url} name={name} size="xl" />
        </div>
      </div>
      <div>
        <p className="font-bold text-lg" style={{ color: "var(--color-text-main)" }}>
          Profile {pct}% complete
        </p>
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          {pct < 100 ? "Round it out for better resumes." : "You're all set!"}
        </p>
      </div>
    </motion.div>
  );
};

export default AvatarStreakTile;
