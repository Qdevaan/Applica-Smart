import { useState } from "react";
import { Plus, Trash2, HeartHandshake } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { profileService } from "../../../services/profile.service";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import type { Volunteer } from "../../../lib/supabase";

const cardClass = "rounded-2xl p-5 sm:p-6 shadow-md border backdrop-blur-md scroll-mt-24";
const cardStyle: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
  borderColor: "var(--color-accent-light)",
};

const VolunteerSection = () => {
  const { user, profile, refreshProfile } = useAuth();
  const list = profile?.volunteer ?? [];
  const [draft, setDraft] = useState<Omit<Volunteer, "id">>({ organization: "", role: "", startDate: "", endDate: "", description: "" });

  const persist = async (next: Volunteer[]) => {
    if (!user) return;
    await profileService.updateProfile(user.id, { volunteer: next } as any);
    await refreshProfile();
  };

  const add = () => {
    if (!draft.organization.trim() || !draft.role.trim()) return;
    persist([...list, { ...draft, id: Date.now().toString() }]);
    setDraft({ organization: "", role: "", startDate: "", endDate: "", description: "" });
  };

  return (
    <section id="volunteer" className={cardClass} style={cardStyle}>
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4" style={{ color: "var(--color-text-main)" }}>
        <HeartHandshake className="w-5 h-5" /> Volunteer
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        <Input value={draft.organization} onChange={(e) => setDraft({ ...draft, organization: e.target.value })} placeholder="Organization" />
        <Input value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} placeholder="Role" />
        <Input value={draft.startDate ?? ""} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} placeholder="Start (YYYY-MM)" />
        <Input value={draft.endDate ?? ""} onChange={(e) => setDraft({ ...draft, endDate: e.target.value })} placeholder="End (YYYY-MM or Present)" />
        <Input value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Description" className="md:col-span-2" />
      </div>
      <Button size="sm" onClick={add} className="mb-3"><Plus className="w-4 h-4 mr-2" /> Add</Button>

      <div className="space-y-2">
        {list.map((v) => (
          <div key={v.id} className="rounded-lg p-3 flex items-start justify-between gap-3"
               style={{ backgroundColor: "var(--color-accent-light)" }}>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold" style={{ color: "var(--color-text-main)" }}>{v.organization}</h3>
              <p className="text-[#780000] dark:text-[#C1121F] font-medium text-sm">{v.role}</p>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {v.startDate}{v.endDate ? ` – ${v.endDate}` : ""}
              </p>
              {v.description && <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{v.description}</p>}
            </div>
            <button onClick={() => persist(list.filter((q) => q.id !== v.id))} className="p-2 text-red-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {list.length === 0 && <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No volunteer entries yet</p>}
      </div>
    </section>
  );
};

export default VolunteerSection;
