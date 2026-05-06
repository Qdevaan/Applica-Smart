import { Component, useEffect, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { Eye, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { loadTemplateComponent } from "../cv/templates";
import type { Profile, TemplatePrefs } from "../../lib/supabase";
import type { CVTemplate } from "../../services/cv.service";

class PreviewErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex items-center justify-center text-center text-sm p-4"
             style={{ color: "var(--color-text-muted)" }}>
          Preview unavailable — your data is saved.
        </div>
      );
    }
    return this.props.children;
  }
}

function useDebounced<T>(value: T, delayMs = 400): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return v;
}

const ProfileLivePreview = () => {
  const { profile } = useAuth();
  const debouncedProfile = useDebounced(profile, 400);
  const [TemplateComp, setTemplateComp] = useState<ComponentType<{ profile: Profile }> | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const templateId =
    ((profile?.template_prefs as TemplatePrefs | undefined)?.defaultTemplateId as CVTemplate | undefined) ??
    "modern";

  useEffect(() => {
    let active = true;
    loadTemplateComponent(templateId).then((Comp) => {
      if (active) setTemplateComp(() => Comp ?? null);
    });
    return () => { active = false; };
  }, [templateId]);

  if (!debouncedProfile || !TemplateComp) {
    return (
      <div className="hidden lg:block sticky top-24 self-start rounded-2xl border h-[calc(100vh-7rem)]"
           style={{ borderColor: "var(--color-accent-light)" }} />
    );
  }

  const previewBox = (
    <PreviewErrorBoundary>
      <PDFViewer width="100%" height="100%" showToolbar={false}>
        <TemplateComp profile={debouncedProfile} />
      </PDFViewer>
    </PreviewErrorBoundary>
  );

  return (
    <>
      <aside className="hidden lg:block sticky top-24 self-start w-full rounded-2xl border overflow-hidden h-[calc(100vh-7rem)]"
             style={{ borderColor: "var(--color-accent-light)", backgroundColor: "var(--color-surface)" }}>
        <div className="px-3 py-2 text-xs font-semibold flex items-center gap-2 border-b"
             style={{ borderColor: "var(--color-accent-light)", color: "var(--color-primary)" }}>
          <Eye className="w-3.5 h-3.5" /> Live preview · {templateId}
        </div>
        <div className="w-full h-full">{previewBox}</div>
      </aside>

      <button
        onClick={() => setDrawerOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-40 px-4 py-3 rounded-full shadow-lg text-white font-semibold inline-flex items-center gap-2"
        style={{ backgroundImage: "linear-gradient(to right, var(--color-primary), var(--color-primary-hover))" }}
      >
        <Eye className="w-4 h-4" /> Preview
      </button>
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 flex items-stretch">
          <div className="w-full h-full bg-white relative">
            <button onClick={() => setDrawerOpen(false)} className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/60 text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="w-full h-full">{previewBox}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileLivePreview;
