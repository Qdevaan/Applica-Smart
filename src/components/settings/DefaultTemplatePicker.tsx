import { Check } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { profileService } from "../../services/profile.service";
import { availableTemplates, type CVTemplate } from "../../services/cv.service";
import type { TemplatePrefs } from "../../lib/supabase";

const DefaultTemplatePicker = () => {
  const { user, profile, refreshProfile } = useAuth();
  const current =
    (profile?.template_prefs as TemplatePrefs | undefined)?.defaultTemplateId ??
    "modern";

  const apply = async (id: CVTemplate) => {
    if (!user) return;
    await profileService.updateDefaultTemplate(user.id, id);
    await refreshProfile();
  };

  return (
    <div>
      <p className="text-sm font-medium mb-3" style={{ color: "var(--color-text-main)" }}>
        Default CV template
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {availableTemplates.map((t) => {
          const selected = t.id === current;
          return (
            <button
              key={t.id}
              onClick={() => apply(t.id)}
              className="relative rounded-xl border-2 p-3 text-left h-24 flex flex-col justify-end transition-all"
              style={{
                borderColor: selected ? "var(--color-primary)" : "var(--color-accent-light)",
                backgroundColor: "var(--color-surface)",
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-2 rounded-t-xl"
                style={{ backgroundColor: t.accentColor }}
              />
              <div className="relative">
                <p className="text-sm font-bold" style={{ color: "var(--color-text-main)" }}>
                  {t.name}
                </p>
                <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                  {t.category}
                </p>
              </div>
              {selected && (
                <div
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DefaultTemplatePicker;
