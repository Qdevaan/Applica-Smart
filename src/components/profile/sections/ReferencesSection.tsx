import { useState } from "react";
import { Plus, Trash2, UserCheck } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { profileService } from "../../../services/profile.service";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import type { ReferenceEntry } from "../../../lib/supabase";

const cardClass = "rounded-2xl p-5 sm:p-6 shadow-md border backdrop-blur-md scroll-mt-24";
const cardStyle: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
  borderColor: "var(--color-accent-light)",
};

const ReferencesSection = () => {
  const { user, profile, refreshProfile } = useAuth();
  const list = profile?.references_list ?? [];
  const [draft, setDraft] = useState<Omit<ReferenceEntry, "id">>({ name: "", contact: "", relation: "" });

  const persist = async (next: ReferenceEntry[]) => {
    if (!user) return;
    await profileService.updateProfile(user.id, { references_list: next } as any);
    await refreshProfile();
  };

  const add = () => {
    if (!draft.name.trim()) return;
    persist([...list, { ...draft, id: Date.now().toString() }]);
    setDraft({ name: "", contact: "", relation: "" });
  };

  return (
    <section id="references" className={cardClass} style={cardStyle}>
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4" style={{ color: "var(--color-text-main)" }}>
        <UserCheck className="w-5 h-5" /> References
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Full name" />
        <Input value={draft.contact ?? ""} onChange={(e) => setDraft({ ...draft, contact: e.target.value })} placeholder="Email or phone" />
        <Input value={draft.relation ?? ""} onChange={(e) => setDraft({ ...draft, relation: e.target.value })} placeholder="Relation" />
      </div>
      <Button size="sm" onClick={add} className="mb-3"><Plus className="w-4 h-4 mr-2" /> Add</Button>

      <div className="space-y-2">
        {list.map((r) => (
          <div key={r.id} className="rounded-lg p-3 flex items-start justify-between gap-3"
               style={{ backgroundColor: "var(--color-accent-light)" }}>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold" style={{ color: "var(--color-text-main)" }}>{r.name}</h3>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {r.relation ?? ""}{r.contact ? ` · ${r.contact}` : ""}
              </p>
            </div>
            <button onClick={() => persist(list.filter((q) => q.id !== r.id))} className="p-2 text-red-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {list.length === 0 && <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No references yet</p>}
      </div>
    </section>
  );
};

export default ReferencesSection;
