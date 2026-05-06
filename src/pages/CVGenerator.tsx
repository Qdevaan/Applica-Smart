import React, { useState } from "react";
import { motion } from "framer-motion";
import { PDFViewer } from "@react-pdf/renderer";
import { Download, FileText, Check, Eye, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  cvService,
  availableTemplates,
  type CVTemplate,
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
            {/* Template Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {availableTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`relative p-6 rounded-2xl cursor-pointer transition-all backdrop-blur-md ${
                    selectedTemplate === template.id
                      ? "ring-2 shadow-xl"
                      : "shadow-md hover:shadow-xl"
                  }`}
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--color-surface) 85%, transparent)",
                    borderColor:
                      selectedTemplate === template.id
                        ? "var(--color-primary)"
                        : "transparent",
                  }}
                >
                  {selectedTemplate === template.id && (
                    <div
                      className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "var(--color-primary)" }}
                    >
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <div
                    className="w-full h-48 mb-4 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "var(--color-accent-light)" }}
                  >
                    <FileText
                      className="w-16 h-16"
                      style={{ color: "var(--color-accent)" }}
                    />
                  </div>

                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ color: "var(--color-text-main)" }}
                  >
                    {template.name}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-text-body)" }}
                  >
                    {template.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            {selectedTemplate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button
                  onClick={() => setShowPreview(true)}
                  variant="primary"
                  className="flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  Preview CV
                </Button>
                <Button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  variant="outline"
                  className="flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  {isDownloading ? "Downloading..." : "Download CV"}
                </Button>
              </motion.div>
            )}
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
