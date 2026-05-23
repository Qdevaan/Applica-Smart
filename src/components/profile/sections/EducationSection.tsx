import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GraduationCap, Plus, Edit2, Trash2 } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { profileService } from "../../../services/profile.service";
import { EducationForm } from "../forms/EducationForm";
import Button from "../../ui/Button";
import type { Education } from "../../../lib/supabase";

const cardClass = "rounded-2xl p-5 sm:p-6 shadow-md border backdrop-blur-md scroll-mt-24";
const cardStyle: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
  borderColor: "var(--color-accent-light)",
};

const EducationSection = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const list = profile?.education ?? [];

  const persist = async (next: Education[]) => {
    if (!user) return;
    await profileService.updateEducation(user.id, next);
    await refreshProfile();
  };

  const onAdd = (data: Omit<Education, "id">) => {
    persist([...list, { ...data, id: Date.now().toString() }]);
    setAdding(false);
  };
  const onUpdate = (id: string, data: Omit<Education, "id">) => {
    persist(list.map((e) => (e.id === id ? { ...data, id } : e)));
    setEditingId(null);
  };
  const onDelete = (id: string) => persist(list.filter((e) => e.id !== id));

  return (
    <section id="education" className={cardClass} style={cardStyle}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--color-text-main)" }}>
          <GraduationCap className="w-5 h-5" /> Education
        </h2>
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add
        </Button>
      </div>

      <AnimatePresence>
        {adding && <EducationForm onSave={onAdd} onCancel={() => setAdding(false)} />}
      </AnimatePresence>

      <div className="space-y-3">
        {list.map((edu) => (
          <div key={edu.id}>
            {editingId === edu.id ? (
              <EducationForm
                education={edu}
                onSave={(data) => onUpdate(edu.id!, data)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <EducationCard education={edu} onEdit={() => setEditingId(edu.id!)} onDelete={() => onDelete(edu.id!)} />
            )}
          </div>
        ))}
        {list.length === 0 && !adding && (
          <p className="text-center py-6" style={{ color: "var(--color-text-muted)" }}>No education added yet</p>
        )}
      </div>
    </section>
  );
};

const EducationCard = ({ education, onEdit, onDelete }: { education: Education; onEdit: () => void; onDelete: () => void }) => {
  const yearRange = `${education.startYear} - ${education.endYear}`;
  let title = education.institutionName;
  let subtitle: string = education.level;
  let details = yearRange;
  if (education.level === "school") {
    subtitle = education.schoolType === "matric" ? "Matric" : "O-Levels";
    details = `${education.schoolMarks ?? ""} | ${yearRange}`;
  } else if (education.level === "college") {
    const map: Record<string, string> = { alevels: "A-Levels", premedical: "Pre-Medical", ics: "ICS", preengineering: "Pre-Engineering", other: "Other" };
    subtitle = map[education.collegeProgram ?? "other"] ?? education.collegeProgram ?? "";
    details = `${education.collegeMarks ?? ""} | ${yearRange}`;
  } else {
    const map: Record<string, string> = { bachelors: "Bachelor's", masters: "Master's", phd: "PhD", diploma: "Diploma", other: "Other" };
    subtitle = `${map[education.degreeType ?? "other"]} - ${education.degree ?? ""}`;
    details = `CGPA: ${education.cgpa ?? "—"} | ${yearRange}`;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg p-4"
      style={{ backgroundColor: "var(--color-accent-light)" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <span className="px-2 py-1 text-xs font-medium bg-[#780000]/10 text-[#780000] dark:bg-[#C1121F]/20 dark:text-[#C1121F] rounded">
            {education.level.charAt(0).toUpperCase() + education.level.slice(1)}
          </span>
          <h3 className="font-bold mt-1" style={{ color: "var(--color-text-main)" }}>{title}</h3>
          <p className="text-[#780000] dark:text-[#C1121F] font-medium">{subtitle}</p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{details}</p>
        </div>
        <div className="flex gap-1">
          <button onClick={onEdit} className="p-2 text-[#669BBC] hover:text-[#780000]"><Edit2 className="w-4 h-4" /></button>
          <button onClick={onDelete} className="p-2 text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
    </motion.div>
  );
};

export default EducationSection;
