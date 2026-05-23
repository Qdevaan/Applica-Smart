import { useState } from "react";
import { Plus, Trash2, Trophy } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { profileService } from "../../../services/profile.service";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import type { Award } from "../../../lib/supabase";

const cardClass = "rounded-2xl p-5 sm:p-6 shadow-md border backdrop-blur-md scroll-mt-24";
const cardStyle: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
  borderColor: "var(--color-accent-light)",
};

const AwardsSection = () => {
  const { user, profile, refreshProfile } = useAuth();
  const list = profile?.awards ?? [];
  const [draft, setDraft] = useState<Omit<Award, "id">>({ title: "", issuer: "", year: "", description: "" });

  const persist = async (next: Award[]) => {
    if (!user) return;
    await profileService.updateProfile(user.id, { awards: next } as any);
    await refreshProfile();
  };

  const add = () => {
    if (!draft.title.trim()) return;
    persist([...list, { ...draft, id: Date.now().toString() }]);
    setDraft({ title: "", issuer: "", year: "", description: "" });
  };

  return (
    <section id="awards" className={cardClass} style={cardStyle}>
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4" style={{ color: "var(--color-text-main)" }}>
        <Trophy className="w-5 h-5" /> Awards
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Award name" />
        <Input value={draft.issuer ?? ""} onChange={(e) => setDraft({ ...draft, issuer: e.target.value })} placeholder="Issuer" />
        <Input value={draft.year ?? ""} onChange={(e) => setDraft({ ...draft, year: e.target.value })} placeholder="Year" />
        <Input value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Description" />
      </div>
      <Button size="sm" onClick={add} className="mb-3"><Plus className="w-4 h-4 mr-2" /> Add</Button>

      <div className="space-y-2">
        {list.map((a) => (
          <div key={a.id} className="rounded-lg p-3 flex items-start justify-between gap-3"
               style={{ backgroundColor: "var(--color-accent-light)" }}>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold" style={{ color: "var(--color-text-main)" }}>{a.title}</h3>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {a.issuer ? `${a.issuer}` : ""}{a.year ? ` · ${a.year}` : ""}
              </p>
              {a.description && <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{a.description}</p>}
            </div>
            <button onClick={() => persist(list.filter((q) => q.id !== a.id))} className="p-2 text-red-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {list.length === 0 && <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No awards yet</p>}
      </div>
    </section>
  );
};

export default AwardsSection;
