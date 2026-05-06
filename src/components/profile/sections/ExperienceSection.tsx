import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, Plus, Edit2, Trash2 } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { profileService } from "../../../services/profile.service";
import { ExperienceForm } from "../forms/ExperienceForm";
import Button from "../../ui/Button";
import type { Experience } from "../../../lib/supabase";

const cardClass = "rounded-2xl p-5 sm:p-6 shadow-md border backdrop-blur-md scroll-mt-24";
const cardStyle: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
  borderColor: "var(--color-accent-light)",
};

const ExperienceSection = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const list = profile?.experience ?? [];

  const persist = async (next: Experience[]) => {
    if (!user) return;
    await profileService.updateExperience(user.id, next);
    await refreshProfile();
  };

  const onAdd = (data: Omit<Experience, "id">) => {
    persist([...list, { ...data, id: Date.now().toString() }]);
    setAdding(false);
  };
  const onUpdate = (id: string, data: Omit<Experience, "id">) => {
    persist(list.map((e) => (e.id === id ? { ...data, id } : e)));
    setEditingId(null);
  };
  const onDelete = (id: string) => persist(list.filter((e) => e.id !== id));

  return (
    <section id="experience" className={cardClass} style={cardStyle}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--color-text-main)" }}>
          <Briefcase className="w-5 h-5" /> Experience
        </h2>
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add
        </Button>
      </div>

      <AnimatePresence>
        {adding && <ExperienceForm onSave={onAdd} onCancel={() => setAdding(false)} />}
      </AnimatePresence>

      <div className="space-y-3">
        {list.map((exp) => (
          <div key={exp.id}>
            {editingId === exp.id ? (
              <ExperienceForm experience={exp} onSave={(data) => onUpdate(exp.id!, data)} onCancel={() => setEditingId(null)} />
            ) : (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg p-4"
                style={{ backgroundColor: "var(--color-accent-light)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-bold" style={{ color: "var(--color-text-main)" }}>{exp.company}</h3>
                    <p className="text-[#780000] dark:text-[#C1121F] font-medium">{exp.position}</p>
                    <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                      {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                    </p>
                    <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>{exp.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditingId(exp.id!)} className="p-2 text-[#669BBC] hover:text-[#780000]">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(exp.id!)} className="p-2 text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ))}
        {list.length === 0 && !adding && (
          <p className="text-center py-6" style={{ color: "var(--color-text-muted)" }}>No experience added yet</p>
        )}
      </div>
    </section>
  );
};

export default ExperienceSection;
