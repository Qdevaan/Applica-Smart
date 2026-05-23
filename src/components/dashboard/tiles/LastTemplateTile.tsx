import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Eye, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PDFViewer } from "@react-pdf/renderer";
import { useAuth } from "../../../hooks/useAuth";
import { useLastTemplate } from "../../../hooks/useLastTemplate";
import {
  cvService,
  availableTemplates,
  type CVTemplate,
} from "../../../services/cv.service";
import { loadTemplateComponent } from "../../cv/templates";
import type { ComponentType } from "react";
import type { Profile } from "../../../lib/supabase";

const LastTemplateTile = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data, loading } = useLastTemplate();
  const [TemplateComp, setTemplateComp] = useState<ComponentType<{ profile: Profile }> | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!data?.templateId) {
      setTemplateComp(null);
      return;
    }
    let active = true;
    loadTemplateComponent(data.templateId).then((Comp) => {
      if (active) setTemplateComp(() => Comp ?? null);
    });
    return () => {
      active = false;
    };
  }, [data?.templateId]);

  const meta = data
    ? availableTemplates.find((t) => t.id === data.templateId)
    : undefined;

  const openInBuilder = () => {
    const id = data?.templateId;
    navigate(id ? `/resume?template=${id}` : "/resume");
  };

  const quickRedownload = async () => {
    if (!data || !profile) return;
    setIsDownloading(true);
    try {
      if (data.fileUrl) {
        const a = document.createElement("a");
        a.href = data.fileUrl;
        a.download = `${profile.name?.replace(/\s+/g, "_") ?? "resume"}_CV.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        await cvService.downloadCV(profile, data.templateId as CVTemplate);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-5 shadow-md border backdrop-blur-md h-full flex flex-col"
      style={{
        backgroundColor: "color-mix(in srgb, var(--color-surface) 85%, transparent)",
        borderColor: "var(--color-accent-light)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-primary)" }}>
            Last template used
          </p>
          <h3 className="text-lg font-bold" style={{ color: "var(--color-text-main)" }}>
            {data ? meta?.name ?? data.templateId : "No resume yet"}
          </h3>
        </div>
        <FileText className="w-5 h-5" style={{ color: "var(--color-text-muted)" }} />
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: "var(--color-text-muted)" }}>
          Loading…
        </div>
      ) : !data || !TemplateComp || !profile ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6 border border-dashed rounded-xl"
             style={{ borderColor: "var(--color-accent-light)" }}>
          <p className="text-sm text-center" style={{ color: "var(--color-text-muted)" }}>
            Build your first resume to pick up here next time.
          </p>
          <button
            onClick={() => navigate("/resume")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white"
            style={{ backgroundImage: "linear-gradient(to right, var(--color-primary), var(--color-primary-hover))" }}
          >
            <Plus className="w-4 h-4" /> Start a resume
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 rounded-xl overflow-hidden bg-gray-100 mb-3" style={{ minHeight: 220 }}>
            <PDFViewer width="100%" height="100%" showToolbar={false}>
              <TemplateComp profile={profile} />
            </PDFViewer>
          </div>
          <div className="flex gap-2">
            <button
              onClick={openInBuilder}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white"
              style={{ backgroundImage: "linear-gradient(to right, var(--color-primary), var(--color-primary-hover))" }}
            >
              <Eye className="w-4 h-4" /> Open in builder
            </button>
            <button
              onClick={quickRedownload}
              disabled={isDownloading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border disabled:opacity-50"
              style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
            >
              <Download className="w-4 h-4" />
              {isDownloading ? "…" : "Re-download"}
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default LastTemplateTile;
