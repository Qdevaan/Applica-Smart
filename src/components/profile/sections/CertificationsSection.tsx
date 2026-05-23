import { useState } from "react";
import { Plus, Trash2, Award as AwardIcon } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { profileService } from "../../../services/profile.service";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import type { Certification } from "../../../lib/supabase";

const cardClass = "rounded-2xl p-5 sm:p-6 shadow-md border backdrop-blur-md scroll-mt-24";
const cardStyle: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
  borderColor: "var(--color-accent-light)",
};

const CertificationsSection = () => {
  const { user, profile, refreshProfile } = useAuth();
  const certs = profile?.certifications ?? [];
  const [draft, setDraft] = useState<Omit<Certification, "id">>({ name: "", issuer: "", date: "", url: "", credentialId: "" });

  const persist = async (next: Certification[]) => {
    if (!user) return;
    await profileService.updateProfile(user.id, { certifications: next } as any);
    await refreshProfile();
  };

  const add = () => {
    if (!draft.name.trim() || !draft.issuer.trim()) return;
    persist([...certs, { ...draft, id: Date.now().toString() }]);
    setDraft({ name: "", issuer: "", date: "", url: "", credentialId: "" });
  };

  return (
    <section id="certifications" className={cardClass} style={cardStyle}>
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4" style={{ color: "var(--color-text-main)" }}>
        <AwardIcon className="w-5 h-5" /> Certifications
      </h2>

      <div className="grid gap-2 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Certificate name" />
          <Input value={draft.issuer} onChange={(e) => setDraft({ ...draft, issuer: e.target.value })} placeholder="Issuer" />
          <Input value={draft.date ?? ""} onChange={(e) => setDraft({ ...draft, date: e.target.value })} placeholder="2024-05" />
          <Input value={draft.url ?? ""} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="Credential URL" />
        </div>
        <Button size="sm" onClick={add}><Plus className="w-4 h-4 mr-2" /> Add certificate</Button>
      </div>

      <div className="space-y-2">
        {certs.map((c) => (
          <div key={c.id} className="rounded-lg p-3 flex items-start justify-between gap-3"
               style={{ backgroundColor: "var(--color-accent-light)" }}>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold" style={{ color: "var(--color-text-main)" }}>{c.name}</h3>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {c.issuer}{c.date ? ` · ${c.date}` : ""}
              </p>
              {c.url && <a href={c.url} target="_blank" rel="noreferrer" className="text-xs underline"
                          style={{ color: "var(--color-primary)" }}>Verify</a>}
            </div>
            <button onClick={() => persist(certs.filter((q) => q.id !== c.id))} className="p-2 text-red-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {certs.length === 0 && (
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No certifications yet</p>
        )}
      </div>
    </section>
  );
};

export default CertificationsSection;
