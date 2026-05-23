import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Mail } from "lucide-react";

interface FormSuccessProps {
  title?: string;
  message?: string;
  icon?: "check" | "mail";
}

const FormSuccess = ({ title = "You're in", message, icon = "check" }: FormSuccessProps) => {
  if (!message) return null;
  const Icon = icon === "mail" ? Mail : CheckCircle2;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        className="rounded-lg p-4 mb-4"
        style={{
          backgroundColor: "rgba(16, 185, 129, 0.10)",
          border: "1px solid rgb(16, 185, 129)",
        }}
      >
        <div className="flex items-start gap-3">
          <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "rgb(16, 185, 129)" }} />
          <div>
            <h3 className="text-sm font-semibold" style={{ color: "rgb(6, 95, 70)" }}>
              {title}
            </h3>
            <p className="text-sm mt-1" style={{ color: "rgb(6, 78, 59)" }}>
              {message}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FormSuccess;
