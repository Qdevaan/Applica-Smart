import { useState } from "react";
import { Plus, Trash2, Languages as LangIcon } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { profileService } from "../../../services/profile.service";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import type { Language, LanguageProficiency } from "../../../lib/supabase";

const cardClass = "rounded-2xl p-5 sm:p-6 shadow-md border backdrop-blur-md scroll-mt-24";
const cardStyle: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
  borderColor: "var(--color-accent-light)",
};

const PROFICIENCY: LanguageProficiency[] = ["native", "fluent", "professional", "intermediate", "basic"];

const LanguagesSection = () => {
  const { user, profile, refreshProfile } = useAuth();
  const list = profile?.languages ?? [];
  const [name, setName] = useState("");
  const [prof, setProf] = useState<LanguageProficiency>("intermediate");

  const persist = async (next: Language[]) => {
    if (!user) return;
    await profileService.updateProfile(user.id, { languages: next } as any);
    await refreshProfile();
  };

  const add = () => {
    if (!name.trim()) return;
    persist([...list, { name: name.trim(), proficiency: prof }]);
    setName("");
    setProf("intermediate");
  };

  return (
    <section id="languages" className={cardClass} style={cardStyle}>
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4" style={{ color: "var(--color-text-main)" }}>
        <LangIcon className="w-5 h-5" /> Languages
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 mb-3">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Language" />
        <select value={prof} onChange={(e) => setProf(e.target.value as LanguageProficiency)}
                className="px-4 py-2 border rounded-lg"
                style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-accent-light)", color: "var(--color-text-body)" }}>
          {PROFICIENCY.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <Button size="sm" onClick={add}><Plus className="w-4 h-4" /></Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {list.map((l, i) => (
          <span key={i} className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                style={{ backgroundColor: "var(--color-accent-light)", color: "var(--color-text-main)" }}>
            <strong>{l.name}</strong>
            <span style={{ color: "var(--color-primary)" }}>{l.proficiency}</span>
            <button onClick={() => persist(list.filter((_, j) => j !== i))}><Trash2 className="w-3 h-3" /></button>
          </span>
        ))}
        {list.length === 0 && <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No languages yet</p>}
      </div>
    </section>
  );
};

export default LanguagesSection;
