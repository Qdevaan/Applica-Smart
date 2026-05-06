import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Wand2 } from "lucide-react";
import type { JobAnalysis } from "../../services/pipeline.service";
import { useAuth } from "../../hooks/useAuth";
import TailorCVModal from "./TailorCVModal";

interface Props {
  job: JobAnalysis;
  rank: number;
}

const recommendationColor: Record<string, string> = {
  "STRONG MATCH – Recommended to Apply": "#16a34a",
  "MODERATE MATCH – You Can Apply": "#ca8a04",
  "WEAK MATCH – Not Recommended": "#dc2626",
};

const JobCard = ({ job, rank }: Props) => {
  const [showLetter, setShowLetter] = useState(false);
  const [showTailor, setShowTailor] = useState(false);
  const { profile } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.4, delay: rank * 0.05 }}
      className="rounded-2xl p-5 shadow-md border mb-4 backdrop-blur-md hover:shadow-xl transition-shadow"
      style={{
        backgroundColor: "color-mix(in srgb, var(--color-surface) 85%, transparent)",
        borderColor: "var(--color-accent-light)",
      }}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded mr-2"
            style={{
              backgroundColor: "var(--color-accent-light)",
              color: "var(--color-primary)",
            }}
          >
            #{rank}
          </span>
          <span className="font-bold text-lg" style={{ color: "var(--color-text-main)" }}>
            {job.title ?? "Unknown Position"}
          </span>
          {job.company && (
            <span className="ml-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
              @ {job.company}
            </span>
          )}
        </div>
        <span className="text-sm font-semibold" style={{ color: "var(--color-text-main)" }}>
          {Math.round(job.similarity * 100)}% match
        </span>
      </div>

      <p
        className="text-sm mt-2 font-medium"
        style={{ color: recommendationColor[job.recommendation] ?? "var(--color-text-muted)" }}
      >
        {job.recommendation}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {job.cover_letter !== "Not generated (only top 3)" && (
          <button
            onClick={() => setShowLetter(!showLetter)}
            className="flex items-center gap-1 text-sm font-medium"
            style={{ color: "var(--color-primary)" }}
          >
            {showLetter ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showLetter ? "Hide cover letter" : "View cover letter"}
          </button>
        )}

        {profile && (
          <button
            onClick={() => setShowTailor(true)}
            className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full transition-all hover:shadow-md"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "white",
            }}
          >
            <Wand2 className="w-3.5 h-3.5" />
            Tailor CV for this job
          </button>
        )}
      </div>

      {showLetter && (
        <pre
          className="mt-3 text-sm whitespace-pre-wrap rounded-lg p-4"
          style={{
            backgroundColor: "var(--color-background)",
            color: "var(--color-text-body)",
            fontFamily: "inherit",
          }}
        >
          {job.cover_letter}
        </pre>
      )}

      {profile && (
        <TailorCVModal
          isOpen={showTailor}
          onClose={() => setShowTailor(false)}
          job={job}
          profile={profile}
        />
      )}
    </motion.div>
  );
};

export default JobCard;
