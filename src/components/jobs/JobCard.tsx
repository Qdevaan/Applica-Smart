import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { JobAnalysis } from "../../services/pipeline.service";

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

  return (
    <div
      className="rounded-xl p-5 shadow-sm border mb-4"
      style={{
        backgroundColor: "var(--color-surface)",
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

      {job.cover_letter !== "Not generated (only top 3)" && (
        <button
          onClick={() => setShowLetter(!showLetter)}
          className="mt-3 flex items-center gap-1 text-sm font-medium"
          style={{ color: "var(--color-primary)" }}
        >
          {showLetter ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showLetter ? "Hide cover letter" : "View cover letter"}
        </button>
      )}

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
    </div>
  );
};

export default JobCard;
