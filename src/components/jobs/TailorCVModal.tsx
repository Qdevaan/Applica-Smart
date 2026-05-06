import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Sparkles, Wand2 } from "lucide-react";
import {
  cvService,
  availableTemplates,
  type CVTemplate,
} from "../../services/cv.service";
import type { Profile } from "../../lib/supabase";
import type { JobAnalysis } from "../../services/pipeline.service";
import Button from "../ui/Button";
import Toast from "../ui/Toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  job: JobAnalysis;
  profile: Profile;
}

// Heuristic bio tailoring — runs locally, no LLM call.
// Reorders user skills to surface anything that overlaps with the job title,
// then composes an opener tuned for the role.
const buildTailoredBio = (profile: Profile, job: JobAnalysis): string => {
  const title = job.title?.trim() || "this role";
  const company = job.company?.trim();
  const titleTokens = (job.title ?? "").toLowerCase().split(/[\s/,&-]+/).filter(Boolean);

  const skills = profile.skills ?? [];
  const matched = skills.filter((s) =>
    titleTokens.some((t) => s.toLowerCase().includes(t) || t.includes(s.toLowerCase()))
  );
  const others = skills.filter((s) => !matched.includes(s));
  const ordered = [...matched, ...others].slice(0, 6);

  const opener = company
    ? `Motivated candidate targeting ${title} at ${company}.`
    : `Motivated candidate targeting ${title} positions.`;

  const skillLine = ordered.length
    ? ` Strengths include ${ordered.join(", ")}.`
    : "";

  const expLine = profile.experience?.length
    ? ` Brings hands-on experience as ${profile.experience[0].position} at ${profile.experience[0].company}.`
    : "";

  const original = profile.bio?.trim()
    ? ` ${profile.bio.trim()}`
    : "";

  return `${opener}${skillLine}${expLine}${original}`.trim();
};

const TailorCVModal = ({ isOpen, onClose, job, profile }: Props) => {
  const [template, setTemplate] = useState<CVTemplate>("modern");
  const [bio, setBio] = useState("");
  const [reorderSkills, setReorderSkills] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setBio(buildTailoredBio(profile, job));
      setTemplate("modern");
      setReorderSkills(true);
    }
  }, [isOpen, profile, job]);

  const tailoredProfile: Profile = useMemo(() => {
    let skills = profile.skills ?? [];
    if (reorderSkills && job.title) {
      const tokens = job.title.toLowerCase().split(/[\s/,&-]+/).filter(Boolean);
      const matched = skills.filter((s) =>
        tokens.some((t) => s.toLowerCase().includes(t) || t.includes(s.toLowerCase()))
      );
      const others = skills.filter((s) => !matched.includes(s));
      skills = [...matched, ...others];
    }
    return { ...profile, bio, skills };
  }, [profile, bio, reorderSkills, job.title]);

  const handleRegenerate = () => {
    setBio(buildTailoredBio(profile, job));
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const safeJob = (job.title ?? "Job").replace(/\s+/g, "_");
      const safeName = (profile.name ?? "CV").replace(/\s+/g, "_");
      await cvService.downloadCV(
        tailoredProfile,
        template,
        `${safeName}_${safeJob}.pdf`
      );
      setToast({ message: "Tailored CV downloaded!", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to download CV.", type: "error" });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl pointer-events-auto"
              style={{ backgroundColor: "var(--color-surface)" }}
            >
              {/* Header */}
              <div
                className="sticky top-0 z-10 flex items-center justify-between p-5 border-b backdrop-blur-md"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--color-surface) 95%, transparent)",
                  borderColor: "var(--color-accent-light)",
                }}
              >
                <div className="flex items-center gap-2">
                  <Sparkles
                    className="w-5 h-5"
                    style={{ color: "var(--color-primary)" }}
                  />
                  <div>
                    <h3
                      className="text-lg font-bold"
                      style={{ color: "var(--color-text-main)" }}
                    >
                      Tailor CV for this job
                    </h3>
                    <p
                      className="text-xs"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {job.title}
                      {job.company ? ` @ ${job.company}` : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-black/5"
                  style={{ color: "var(--color-text-body)" }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Template picker */}
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "var(--color-text-main)" }}
                  >
                    What kind of CV do you want?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableTemplates.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTemplate(t.id)}
                        className={`text-left p-3 rounded-xl border-2 transition-all ${
                          template === t.id ? "shadow-md" : "hover:opacity-90"
                        }`}
                        style={{
                          borderColor:
                            template === t.id
                              ? "var(--color-primary)"
                              : "var(--color-accent-light)",
                          backgroundColor:
                            template === t.id
                              ? "var(--color-accent-light)"
                              : "var(--color-background)",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: t.accentColor }}
                          />
                          <p
                            className="text-sm font-bold"
                            style={{ color: "var(--color-text-main)" }}
                          >
                            {t.name}
                          </p>
                        </div>
                        <p
                          className="text-[11px] leading-tight"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          {t.bestFor.join(" · ")}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tailored bio */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      className="block text-sm font-semibold"
                      style={{ color: "var(--color-text-main)" }}
                    >
                      Tailored bio (used for this CV only)
                    </label>
                    <button
                      onClick={handleRegenerate}
                      className="text-xs font-semibold flex items-center gap-1 hover:opacity-80"
                      style={{ color: "var(--color-primary)" }}
                    >
                      <Wand2 className="w-3 h-3" />
                      Regenerate
                    </button>
                  </div>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#780000] text-sm"
                    style={{
                      backgroundColor: "var(--color-background)",
                      borderColor: "var(--color-accent-light)",
                      color: "var(--color-text-body)",
                    }}
                  />
                  <p
                    className="text-[11px] mt-1"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Your saved profile bio is not modified — this is just for the generated PDF.
                  </p>
                </div>

                {/* Reorder skills toggle */}
                <label
                  className="flex items-start gap-2 cursor-pointer p-3 rounded-lg"
                  style={{ backgroundColor: "var(--color-accent-light)" }}
                >
                  <input
                    type="checkbox"
                    checked={reorderSkills}
                    onChange={(e) => setReorderSkills(e.target.checked)}
                    className="mt-0.5 w-4 h-4"
                  />
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--color-text-main)" }}
                    >
                      Surface job-relevant skills first
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Reorders your skills so anything matching the job title appears at the top of the CV.
                    </p>
                  </div>
                </label>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    variant="primary"
                    className="flex-1"
                  >
                    <Download className="w-4 h-4" />
                    {isDownloading ? "Generating…" : "Download tailored CV"}
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              isVisible={!!toast}
              onClose={() => setToast(null)}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default TailorCVModal;
