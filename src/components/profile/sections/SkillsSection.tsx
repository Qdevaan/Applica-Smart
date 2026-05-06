import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X, Sparkles } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { profileService } from "../../../services/profile.service";
import Button from "../../ui/Button";
import Input from "../../ui/Input";

const SKILL_SUGGESTIONS: Record<string, string[]> = {
  "Software & Engineering": ["JavaScript","TypeScript","React","Node.js","Python","SQL","Git","REST APIs","Docker","AWS"],
  "Data & AI": ["Pandas","NumPy","TensorFlow","PyTorch","scikit-learn","Power BI","Tableau","Excel","Statistics"],
  "Design & Product": ["Figma","UI Design","UX Research","Prototyping","Wireframing","Design Systems","Adobe XD"],
  "Business & Soft Skills": ["Communication","Teamwork","Leadership","Problem Solving","Time Management","Project Management","Critical Thinking","Adaptability"],
  Marketing: ["SEO","Content Writing","Social Media","Google Ads","Email Marketing","Copywriting"],
};

const cardClass = "rounded-2xl p-5 sm:p-6 shadow-md border backdrop-blur-md scroll-mt-24";
const cardStyle: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
  borderColor: "var(--color-accent-light)",
};

const SkillsSection = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [newSkill, setNewSkill] = useState("");
  const [activeCat, setActiveCat] = useState(Object.keys(SKILL_SUGGESTIONS)[0]);

  const skills = profile?.skills ?? [];
  const userSkillSet = new Set(skills.map((s) => s.toLowerCase()));

  const persist = async (next: string[]) => {
    if (!user) return;
    await profileService.updateSkills(user.id, next);
    await refreshProfile();
  };

  const onAdd = () => {
    if (!newSkill.trim()) return;
    persist([...skills, newSkill.trim()]);
    setNewSkill("");
  };

  const onAddSuggested = (skill: string) => {
    if (userSkillSet.has(skill.toLowerCase())) return;
    persist([...skills, skill]);
  };

  const onRemove = (idx: number) => {
    persist(skills.filter((_, i) => i !== idx));
  };

  return (
    <section id="skills" className={cardClass} style={cardStyle}>
      <h2 className="text-xl font-bold mb-4" style={{ color: "var(--color-text-main)" }}>
        Skills
      </h2>
      <div className="flex gap-2 mb-4">
        <Input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          placeholder="Add a skill"
          onKeyPress={(e) => e.key === "Enter" && onAdd()}
        />
        <Button onClick={onAdd} size="sm">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {skills.map((s, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-3 py-1 bg-[#780000]/10 text-[#780000] dark:bg-[#780000]/20 dark:text-[#C1121F] rounded-full text-sm font-medium flex items-center gap-2"
          >
            {s}
            <button onClick={() => onRemove(i)}><X className="w-3 h-3" /></button>
          </motion.div>
        ))}
        {skills.length === 0 && (
          <p style={{ color: "var(--color-text-muted)" }}>No skills added yet</p>
        )}
      </div>

      <div className="rounded-xl p-4 border border-dashed" style={{ borderColor: "var(--color-accent-light)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
          <p className="text-sm font-semibold" style={{ color: "var(--color-text-main)" }}>
            Common skills — tap to add
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.keys(SKILL_SUGGESTIONS).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{
                backgroundColor: activeCat === cat ? "var(--color-primary)" : "var(--color-accent-light)",
                color: activeCat === cat ? "white" : "var(--color-primary)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {SKILL_SUGGESTIONS[activeCat].map((s) => {
            const added = userSkillSet.has(s.toLowerCase());
            return (
              <button
                key={s}
                disabled={added}
                onClick={() => onAddSuggested(s)}
                className={`text-sm px-3 py-1 rounded-full flex items-center gap-1 ${added ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"}`}
                style={{
                  backgroundColor: added ? "var(--color-accent-light)" : "var(--color-surface)",
                  color: "var(--color-text-body)",
                  border: "1px solid var(--color-accent-light)",
                }}
              >
                {!added && <Plus className="w-3 h-3" />}
                {s}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
