import { useState } from "react";
import { Plus, Trash2, FolderGit2 } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { profileService } from "../../../services/profile.service";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import type { Project } from "../../../lib/supabase";

const cardClass = "rounded-2xl p-5 sm:p-6 shadow-md border backdrop-blur-md scroll-mt-24";
const cardStyle: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
  borderColor: "var(--color-accent-light)",
};

const ProjectsSection = () => {
  const { user, profile, refreshProfile } = useAuth();
  const projects = profile?.projects ?? [];
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Omit<Project, "id">>({ name: "", role: "", description: "", link: "", tech: [] });
  const [techInput, setTechInput] = useState("");

  const persist = async (next: Project[]) => {
    if (!user) return;
    await profileService.updateProfile(user.id, { projects: next } as any);
    await refreshProfile();
  };

  const add = () => {
    if (!draft.name.trim()) return;
    persist([...projects, { ...draft, id: Date.now().toString() }]);
    setDraft({ name: "", role: "", description: "", link: "", tech: [] });
    setAdding(false);
  };

  return (
    <section id="projects" className={cardClass} style={cardStyle}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--color-text-main)" }}>
          <FolderGit2 className="w-5 h-5" /> Projects
        </h2>
        <Button size="sm" onClick={() => setAdding(!adding)}><Plus className="w-4 h-4 mr-2" /> Add</Button>
      </div>

      {adding && (
        <div className="rounded-lg p-4 mb-3 grid gap-2" style={{ backgroundColor: "var(--color-accent-light)" }}>
          <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Project name" />
          <Input value={draft.role ?? ""} onChange={(e) => setDraft({ ...draft, role: e.target.value })} placeholder="Your role" />
          <Input value={draft.link ?? ""} onChange={(e) => setDraft({ ...draft, link: e.target.value })} placeholder="https://…" />
          <textarea value={draft.description ?? ""}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    placeholder="What it does, what you built"
                    rows={2}
                    className="w-full px-4 py-2 border rounded-lg"
                    style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-accent-light)", color: "var(--color-text-body)" }} />
          <div className="flex gap-2">
            <Input value={techInput} onChange={(e) => setTechInput(e.target.value)} placeholder="Tech (Enter)"
                   onKeyPress={(e) => {
                     if (e.key === "Enter" && techInput.trim()) {
                       setDraft({ ...draft, tech: [...(draft.tech ?? []), techInput.trim()] });
                       setTechInput("");
                     }
                   }} />
          </div>
          <div className="flex flex-wrap gap-1">
            {(draft.tech ?? []).map((t, i) => (
              <span key={i} className="px-2 py-0.5 text-xs rounded-full"
                    style={{ backgroundColor: "var(--color-surface)", color: "var(--color-primary)" }}>{t}</span>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={add}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {projects.map((p) => (
          <div key={p.id} className="rounded-lg p-4 flex items-start justify-between gap-3"
               style={{ backgroundColor: "var(--color-accent-light)" }}>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold" style={{ color: "var(--color-text-main)" }}>{p.name}</h3>
              {p.role && <p className="text-[#780000] dark:text-[#C1121F] font-medium text-sm">{p.role}</p>}
              {p.description && <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>{p.description}</p>}
              {p.tech && p.tech.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {p.tech.map((t, i) => (
                    <span key={i} className="px-2 py-0.5 text-xs rounded-full"
                          style={{ backgroundColor: "var(--color-surface)", color: "var(--color-primary)" }}>{t}</span>
                  ))}
                </div>
              )}
              {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="text-xs underline mt-1 inline-block"
                            style={{ color: "var(--color-primary)" }}>{p.link}</a>}
            </div>
            <button onClick={() => persist(projects.filter((q) => q.id !== p.id))} className="p-2 text-red-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {projects.length === 0 && !adding && (
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No projects yet</p>
        )}
      </div>
    </section>
  );
};

export default ProjectsSection;
