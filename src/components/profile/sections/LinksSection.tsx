import { useState } from "react";
import { Plus, Trash2, ExternalLink, Link as LinkIcon } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { profileService } from "../../../services/profile.service";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import type { Link as LinkRow } from "../../../lib/supabase";

const cardClass = "rounded-2xl p-5 sm:p-6 shadow-md border backdrop-blur-md scroll-mt-24";
const cardStyle: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
  borderColor: "var(--color-accent-light)",
};

const LinksSection = () => {
  const { user, profile, refreshProfile } = useAuth();
  const links = profile?.links ?? [];
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  const persist = async (next: LinkRow[]) => {
    if (!user) return;
    await profileService.updateProfile(user.id, { links: next } as any);
    await refreshProfile();
  };

  const add = () => {
    if (!label.trim() || !url.trim()) return;
    persist([...links, { label: label.trim(), url: url.trim() }]);
    setLabel("");
    setUrl("");
  };

  return (
    <section id="links" className={cardClass} style={cardStyle}>
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4" style={{ color: "var(--color-text-main)" }}>
        <LinkIcon className="w-5 h-5" /> Links
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-2 mb-4">
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="GitHub" />
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://github.com/you" />
        <Button size="sm" onClick={add}><Plus className="w-4 h-4" /></Button>
      </div>
      <div className="space-y-2">
        {links.map((l, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg"
               style={{ backgroundColor: "var(--color-accent-light)" }}>
            <div className="flex items-center gap-2 min-w-0">
              <ExternalLink className="w-4 h-4 flex-shrink-0" style={{ color: "var(--color-primary)" }} />
              <a href={l.url} target="_blank" rel="noreferrer" className="font-medium truncate"
                 style={{ color: "var(--color-text-main)" }}>{l.label}</a>
              <span className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>{l.url}</span>
            </div>
            <button onClick={() => persist(links.filter((_, j) => j !== i))} className="p-2 text-red-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {links.length === 0 && (
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No links yet</p>
        )}
      </div>
    </section>
  );
};

export default LinksSection;
