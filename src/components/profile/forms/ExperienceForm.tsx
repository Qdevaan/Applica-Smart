import { useState } from "react";
import { motion } from "framer-motion";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import type { Experience } from "../../../lib/supabase";

type ExperienceFormProps = {
  experience?: Experience;
  onSave: (data: Omit<Experience, "id">) => void;
  onCancel: () => void;
};

export const ExperienceForm = ({ experience, onSave, onCancel }: ExperienceFormProps) => {
  const [formData, setFormData] = useState({
    company: experience?.company || "",
    position: experience?.position || "",
    startDate: experience?.startDate || "",
    endDate: experience?.endDate || "",
    current: experience?.current || false,
    description: experience?.description || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="rounded-lg p-4 mb-4"
      style={{ backgroundColor: "var(--color-accent-light)" }}
    >
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <Input
          label="Company"
          value={formData.company}
          onChange={(e) =>
            setFormData({ ...formData, company: e.target.value })
          }
          required
        />
        <Input
          label="Position"
          value={formData.position}
          onChange={(e) =>
            setFormData({ ...formData, position: e.target.value })
          }
          required
        />
        <Input
          label="Start Date"
          type="date"
          value={formData.startDate}
          onChange={(e) =>
            setFormData({ ...formData, startDate: e.target.value })
          }
          required
        />
        <Input
          label="End Date"
          type="date"
          value={formData.endDate}
          onChange={(e) =>
            setFormData({ ...formData, endDate: e.target.value })
          }
          disabled={formData.current}
        />
        <div className="flex items-center md:col-span-2">
          <input
            type="checkbox"
            id="current-exp"
            checked={formData.current}
            onChange={(e) =>
              setFormData({ ...formData, current: e.target.checked })
            }
            className="mr-2"
          />
          <label
            htmlFor="current-exp"
            className="text-sm"
            style={{ color: "var(--color-text-body)" }}
          >
            Currently working here
          </label>
        </div>
      </div>
      <div className="mb-4">
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--color-text-body)" }}
        >
          Job Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#780000]"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-accent-light)",
            color: "var(--color-text-body)",
          }}
          rows={3}
          required
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          Save
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </motion.form>
  );
};

export default ExperienceForm;
