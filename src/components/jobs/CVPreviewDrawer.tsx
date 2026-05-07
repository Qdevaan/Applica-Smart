import { Component, useEffect, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PDFViewer } from "@react-pdf/renderer";
import { Eye, X } from "lucide-react";
import { loadTemplateComponent } from "../cv/templates";
import type { Profile, TemplatePrefs } from "../../lib/supabase";
import type { CVTemplate } from "../../services/cv.service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
}

class PreviewErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          className="h-full flex items-center justify-center text-center text-sm p-4"
          style={{ color: "var(--color-text-muted)" }}
        >
          Preview unavailable — your data is saved.
        </div>
      );
    }
    return this.props.children;
  }
}

const CVPreviewDrawer = ({ isOpen, onClose, profile }: Props) => {
  const [TemplateComp, setTemplateComp] = useState<ComponentType<{ profile: Profile }> | null>(null);

  const templateId =
    ((profile.template_prefs as TemplatePrefs | undefined)?.defaultTemplateId as CVTemplate | undefined) ??
    "modern";

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    loadTemplateComponent(templateId).then((Comp) => {
      if (active) setTemplateComp(() => Comp ?? null);
    });
    return () => {
      active = false;
    };
  }, [isOpen, templateId]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-xl flex flex-col shadow-2xl"
            style={{ backgroundColor: "var(--color-surface)" }}
          >
            <div
              className="shrink-0 flex items-center justify-between p-4 border-b"
              style={{ borderColor: "var(--color-accent-light)" }}
            >
              <div className="flex items-center gap-2">
                <Eye
                  className="w-5 h-5"
                  style={{ color: "var(--color-primary)" }}
                />
                <div>
                  <h3
                    className="text-base font-bold"
                    style={{ color: "var(--color-text-main)" }}
                  >
                    Your CV preview
                  </h3>
                  <p
                    className="text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Template: {templateId}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-black/5"
                style={{ color: "var(--color-text-body)" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              {TemplateComp ? (
                <PreviewErrorBoundary>
                  <PDFViewer width="100%" height="100%" showToolbar={false}>
                    <TemplateComp profile={profile} />
                  </PDFViewer>
                </PreviewErrorBoundary>
              ) : (
                <div
                  className="h-full flex items-center justify-center text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Loading preview…
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CVPreviewDrawer;
