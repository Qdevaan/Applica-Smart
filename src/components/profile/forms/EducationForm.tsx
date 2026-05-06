import { useState } from "react";
import { motion } from "framer-motion";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import type { Education } from "../../../lib/supabase";

type EducationFormProps = {
  education?: Education;
  onSave: (data: Omit<Education, "id">) => void;
  onCancel: () => void;
};

export const EducationForm = ({ education, onSave, onCancel }: EducationFormProps) => {
  // Generate year options from 1950 to current year + 10
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: currentYear - 1950 + 11 },
    (_, i) => currentYear + 10 - i
  );

  const [formData, setFormData] = useState<Omit<Education, "id">>({
    level: education?.level || "school",
    institutionName: education?.institutionName || "",
    startYear: education?.startYear || "",
    endYear: education?.endYear || "",
    schoolType: education?.schoolType || "matric",
    schoolMarks: education?.schoolMarks || "",
    collegeProgram: education?.collegeProgram || "alevels",
    collegeMarks: education?.collegeMarks || "",
    degree: education?.degree || "",
    degreeType: education?.degreeType || "bachelors",
    cgpa: education?.cgpa || "",
    currentlyStudying: education?.currentlyStudying || false,
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
      {/* Education Level Dropdown */}
      <div className="mb-4">
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--color-text-body)" }}
        >
          Education Level *
        </label>
        <select
          value={formData.level}
          onChange={(e) =>
            setFormData({ ...formData, level: e.target.value as any })
          }
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#780000]"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-accent-light)",
            color: "var(--color-text-body)",
          }}
          required
        >
          <option value="school">School</option>
          <option value="college">College</option>
          <option value="university">University</option>
        </select>
      </div>

      {/* Institution Name */}
      <div className="mb-4">
        <Input
          label={`${
            formData.level === "school"
              ? "School"
              : formData.level === "college"
              ? "College"
              : "University"
          } Name`}
          value={formData.institutionName}
          onChange={(e) =>
            setFormData({ ...formData, institutionName: e.target.value })
          }
          placeholder={`Enter ${formData.level} name`}
          required
        />
      </div>

      {/* School Specific Fields */}
      {formData.level === "school" && (
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--color-text-body)" }}
            >
              Type *
            </label>
            <select
              value={formData.schoolType}
              onChange={(e) =>
                setFormData({ ...formData, schoolType: e.target.value as any })
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#780000]"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-accent-light)",
                color: "var(--color-text-body)",
              }}
              required
            >
              <option value="matric">Matric</option>
              <option value="olevels">O-Levels</option>
            </select>
          </div>
          <Input
            label="Marks/Percentage"
            value={formData.schoolMarks || ""}
            onChange={(e) =>
              setFormData({ ...formData, schoolMarks: e.target.value })
            }
            placeholder="e.g., 85% or A+"
            required
          />
          <div>
            <label className="block text-sm font-medium text-[#003049] dark:text-gray-300 mb-2">
              Starting Year *
            </label>
            <select
              value={formData.startYear}
              onChange={(e) =>
                setFormData({ ...formData, startYear: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#780000]"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-accent-light)",
                color: "var(--color-text-body)",
              }}
              required
            >
              <option value="">Select Year</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#003049] dark:text-gray-300 mb-2">
              Ending Year *
            </label>
            <select
              value={formData.endYear}
              onChange={(e) =>
                setFormData({ ...formData, endYear: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#780000]"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-accent-light)",
                color: "var(--color-text-body)",
              }}
              required
            >
              <option value="">Select Year</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* College Specific Fields */}
      {formData.level === "college" && (
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-[#003049] dark:text-gray-300 mb-2">
              Program *
            </label>
            <select
              value={formData.collegeProgram}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  collegeProgram: e.target.value as any,
                })
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#780000]"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-accent-light)",
                color: "var(--color-text-body)",
              }}
              required
            >
              <option value="alevels">A-Levels</option>
              <option value="premedical">Pre-Medical</option>
              <option value="ics">ICS (Computer Science)</option>
              <option value="preengineering">Pre-Engineering</option>
              <option value="other">Other</option>
            </select>
          </div>
          <Input
            label="Marks/Percentage"
            value={formData.collegeMarks || ""}
            onChange={(e) =>
              setFormData({ ...formData, collegeMarks: e.target.value })
            }
            placeholder="e.g., 85% or A grade"
            required
          />
          <div>
            <label className="block text-sm font-medium text-[#003049] dark:text-gray-300 mb-2">
              Starting Year *
            </label>
            <select
              value={formData.startYear}
              onChange={(e) =>
                setFormData({ ...formData, startYear: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#780000]"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-accent-light)",
                color: "var(--color-text-body)",
              }}
              required
            >
              <option value="">Select Year</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#003049] dark:text-gray-300 mb-2">
              Ending Year *
            </label>
            <select
              value={formData.endYear}
              onChange={(e) =>
                setFormData({ ...formData, endYear: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#780000]"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-accent-light)",
                color: "var(--color-text-body)",
              }}
              required
            >
              <option value="">Select Year</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* University Specific Fields */}
      {formData.level === "university" && (
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-[#003049] dark:text-gray-300 mb-2">
              Degree Type *
            </label>
            <select
              value={formData.degreeType}
              onChange={(e) =>
                setFormData({ ...formData, degreeType: e.target.value as any })
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#780000]"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-accent-light)",
                color: "var(--color-text-body)",
              }}
              required
            >
              <option value="bachelors">Bachelor's</option>
              <option value="masters">Master's</option>
              <option value="phd">PhD</option>
              <option value="diploma">Diploma</option>
              <option value="other">Other</option>
            </select>
          </div>
          <Input
            label="Degree Name"
            value={formData.degree || ""}
            onChange={(e) =>
              setFormData({ ...formData, degree: e.target.value })
            }
            placeholder="e.g., BS Computer Science"
            required
          />
          <Input
            label="CGPA"
            value={formData.cgpa || ""}
            onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
            placeholder="e.g., 3.5/4.0"
            required={!formData.currentlyStudying}
          />
          <div className="flex items-center">
            <input
              type="checkbox"
              id="currently-studying"
              checked={formData.currentlyStudying}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  currentlyStudying: e.target.checked,
                  endYear: e.target.checked ? "Present" : formData.endYear,
                })
              }
              className="mr-2 w-4 h-4"
            />
            <label
              htmlFor="currently-studying"
              className="text-sm text-[#003049] dark:text-gray-300"
            >
              Currently studying here
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#003049] dark:text-gray-300 mb-2">
              Starting Year *
            </label>
            <select
              value={formData.startYear}
              onChange={(e) =>
                setFormData({ ...formData, startYear: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#780000]"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-accent-light)",
                color: "var(--color-text-body)",
              }}
              required
            >
              <option value="">Select Year</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#003049] dark:text-gray-300 mb-2">
              Ending Year {!formData.currentlyStudying && "*"}
            </label>
            <select
              value={formData.endYear}
              onChange={(e) =>
                setFormData({ ...formData, endYear: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#780000]"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-accent-light)",
                color: "var(--color-text-body)",
              }}
              disabled={formData.currentlyStudying}
              required={!formData.currentlyStudying}
            >
              <option value="">Select Year</option>
              {formData.currentlyStudying && (
                <option value="Present">Present</option>
              )}
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

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

export default EducationForm;
