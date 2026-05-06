import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PDFViewer } from "@react-pdf/renderer";
import { Download, FileText, Check, Eye, ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  cvService,
  availableTemplates,
  templateCategories,
  type CVTemplate,
  type TemplateCategory,
} from "../services/cv.service";
import { ModernTemplate } from "../components/cv/templates/ModernTemplate";
import { ClassicTemplate } from "../components/cv/templates/ClassicTemplate";
import { MinimalTemplate } from "../components/cv/templates/MinimalTemplate";
import { ExecutiveTemplate } from "../components/cv/templates/ExecutiveTemplate";
import { CreativeTemplate } from "../components/cv/templates/CreativeTemplate";
import { ATSTemplate } from "../components/cv/templates/ATSTemplate";
import { CompactTemplate } from "../components/cv/templates/CompactTemplate";
import Button from "../components/ui/Button";
import Toast from "../components/ui/Toast";

const CVGenerator = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplate | null>(
    null
  );
  const [showPreview, setShowPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>("all");

  const filteredTemplates = useMemo(
    () =>
      activeCategory === "all"
        ? availableTemplates
        : availableTemplates.filter((t) => t.category === activeCategory),
    [activeCategory]
  );

  const selectedTemplateMeta = useMemo(
    () => availableTemplates.find((t) => t.id === selectedTemplate) ?? null,
    [selectedTemplate]
  );

  const handleDownload = async () => {
    if (!profile || !selectedTemplate) return;

    setIsDownloading(true);
    try {
      await cvService.downloadCV(profile, selectedTemplate);
      setToast({ message: "CV downloaded successfully!", type: "success" });
    } catch (error) {
      console.error("Download error:", error);
      setToast({ message: "Failed to download CV. Please try again.", type: "error" });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveToCloud = async () => {
    if (!user || !profile || !selectedTemplate) return;

    setIsUploading(true);
    try {
      const fileUrl = await cvService.uploadCV(user.id, profile, selectedTemplate);
      await cvService.saveCVRecord(user.id, selectedTemplate, fileUrl);
      setToast({ message: "CV saved to your account successfully!", type: "success" });
    } catch (error) {
      console.error("Upload error:", error);
      setToast({ message: "Failed to save CV. Please try again.", type: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  const getTemplateComponent = (): React.ReactElement | undefined => {
    if (!profile || !selectedTemplate) return undefined;

    switch (selectedTemplate) {
      case "modern":
        return <ModernTemplate profile={profile} />;
      case "classic":
        return <ClassicTemplate profile={profile} />;
      case "minimal":
        return <MinimalTemplate profile={profile} />;
      case "executive":
        return <ExecutiveTemplate profile={profile} />;
      case "creative":
        return <CreativeTemplate profile={profile} />;
      case "ats":
        return <ATSTemplate profile={profile} />;
      case "compact":
        return <CompactTemplate profile={profile} />;
      default:
        return undefined;
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: "var(--color-text-muted)" }}
          />
          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: "var(--color-text-main)" }}
          >
            Complete Your Profile First
          </h2>
          <p className="mb-6" style={{ color: "var(--color-text-body)" }}>
            Please fill out your profile information before generating a CV.
          </p>
          <Button onClick={() => navigate("/profile")}>Go to Profile</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3"
            style={{ color: "var(--color-text-main)" }}
          >
            Resume{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#780000] to-[#C1121F]">
              Builder
            </span>
          </h1>
          <p
            className="text-base sm:text-lg"
            style={{ color: "var(--color-text-body)" }}
          >
            Choose a template and create a professional CV from your profile
            data
          </p>
        </div>

        {!showPreview ? (
          <>
            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              {templateCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    activeCategory === cat.id
                      ? "shadow-md"
                      : "hover:opacity-80"
                  }`}
                  style={{
                    backgroundColor:
                      activeCategory === cat.id
                        ? "var(--color-primary)"
                        : "var(--color-accent-light)",
                    color:
                      activeCategory === cat.id
                        ? "white"
                        : "var(--color-primary)",
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Template Grid (left, 2 cols on large) */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
                <AnimatePresence mode="popLayout">
                  {filteredTemplates.map((template) => (
                    <motion.div
                      key={template.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`relative p-5 rounded-2xl cursor-pointer transition-all backdrop-blur-md border-2 ${
                        selectedTemplate === template.id
                          ? "shadow-xl"
                          : "shadow-md hover:shadow-xl"
                      }`}
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--color-surface) 85%, transparent)",
                        borderColor:
                          selectedTemplate === template.id
                            ? "var(--color-primary)"
                            : "transparent",
                      }}
                    >
                      {selectedTemplate === template.id && (
                        <div
                          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center z-10"
                          style={{ backgroundColor: "var(--color-primary)" }}
                        >
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}

                      {/* Mini visual swatch */}
                      <div
                        className="w-full h-32 mb-3 rounded-lg overflow-hidden relative flex"
                        style={{ backgroundColor: "#fff", border: "1px solid var(--color-accent-light)" }}
                      >
                        <div
                          className="h-full"
                          style={{
                            width: template.category === "compact" || template.id === "modern" ? "32%" : "0%",
                            backgroundColor: template.accentColor,
                          }}
                        />
                        <div className="flex-1 p-2 flex flex-col gap-1">
                          <div
                            className="h-2 rounded-sm"
                            style={{
                              width: "60%",
                              backgroundColor: template.accentColor,
                            }}
                          />
                          <div className="h-1 rounded-sm bg-gray-200" style={{ width: "40%" }} />
                          <div className="h-1 rounded-sm bg-gray-100 mt-2" />
                          <div className="h-1 rounded-sm bg-gray-100" />
                          <div className="h-1 rounded-sm bg-gray-100" style={{ width: "75%" }} />
                          <div
                            className="h-1.5 rounded-sm mt-2"
                            style={{
                              width: "30%",
                              backgroundColor: template.accentColor,
                            }}
                          />
                          <div className="h-1 rounded-sm bg-gray-100" />
                          <div className="h-1 rounded-sm bg-gray-100" style={{ width: "85%" }} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className="text-base font-bold"
                          style={{ color: "var(--color-text-main)" }}
                        >
                          {template.name}
                        </h3>
                        <span
                          className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: "var(--color-accent-light)",
                            color: "var(--color-primary)",
                          }}
                        >
                          {template.category}
                        </span>
                      </div>
                      <p
                        className="text-xs mb-2"
                        style={{ color: "var(--color-text-body)" }}
                      >
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {template.bestFor.slice(0, 3).map((b) => (
                          <span
                            key={b}
                            className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: "var(--color-background)",
                              color: "var(--color-text-muted)",
                              border: "1px solid var(--color-accent-light)",
                            }}
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Quick-View Sidebar (right) */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-6">
                  <AnimatePresence mode="wait">
                    {selectedTemplate && profile ? (
                      <motion.div
                        key={selectedTemplate}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 16 }}
                        transition={{ duration: 0.25 }}
                        className="rounded-2xl border shadow-xl overflow-hidden backdrop-blur-md"
                        style={{
                          backgroundColor:
                            "color-mix(in srgb, var(--color-surface) 92%, transparent)",
                          borderColor: "var(--color-accent-light)",
                        }}
                      >
                        <div
                          className="px-4 py-3 flex items-center gap-2 border-b"
                          style={{ borderColor: "var(--color-accent-light)" }}
                        >
                          <Sparkles
                            className="w-4 h-4"
                            style={{ color: "var(--color-primary)" }}
                          />
                          <p
                            className="text-sm font-semibold"
                            style={{ color: "var(--color-text-main)" }}
                          >
                            Quick View — {selectedTemplateMeta?.name}
                          </p>
                        </div>

                        <div
                          className="w-full bg-gray-100"
                          style={{ height: "520px" }}
                        >
                          {getTemplateComponent() && (
                            <PDFViewer
                              width="100%"
                              height="100%"
                              showToolbar={false}
                            >
                              {getTemplateComponent() as any}
                            </PDFViewer>
                          )}
                        </div>

                        <div className="p-3 flex flex-col gap-2">
                          <Button
                            onClick={() => setShowPreview(true)}
                            variant="primary"
                            size="sm"
                            className="w-full"
                          >
                            <Eye className="w-4 h-4" />
                            Full Preview
                          </Button>
                          <Button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Download className="w-4 h-4" />
                            {isDownloading ? "Downloading…" : "Download"}
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="rounded-2xl border border-dashed p-8 text-center"
                        style={{
                          borderColor: "var(--color-accent-light)",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">
                          Click any template to see a live preview here.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Preview Section */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <Button
                onClick={() => setShowPreview(false)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Change Template
              </Button>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  {isDownloading ? "Downloading..." : "Download"}
                </Button>
                <Button
                  onClick={handleSaveToCloud}
                  disabled={isUploading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  {isUploading ? "Saving..." : "Save to Account"}
                </Button>
              </div>
            </div>

            {/* PDF Preview */}
            {getTemplateComponent() && (
              <div
                className="w-full rounded-xl overflow-hidden shadow-xl"
                style={{
                  backgroundColor: "var(--color-surface)",
                  height: "calc(100vh - 250px)",
                  minHeight: "600px",
                }}
              >
                <PDFViewer width="100%" height="100%" showToolbar={true}>
                  {getTemplateComponent() as any}
                </PDFViewer>
              </div>
            )}
          </>
        )}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            isVisible={!!toast}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default CVGenerator;
