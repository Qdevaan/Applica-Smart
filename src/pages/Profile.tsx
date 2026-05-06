import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { profileService } from "../services/profile.service";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import type { Education, Experience } from "../lib/supabase";

// Common-skills catalogue grouped by domain. Click a chip to add it.
const SKILL_SUGGESTIONS: Record<string, string[]> = {
  "Software & Engineering": [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Python",
    "SQL",
    "Git",
    "REST APIs",
    "Docker",
    "AWS",
  ],
  "Data & AI": [
    "Pandas",
    "NumPy",
    "TensorFlow",
    "PyTorch",
    "scikit-learn",
    "Power BI",
    "Tableau",
    "Excel",
    "Statistics",
  ],
  "Design & Product": [
    "Figma",
    "UI Design",
    "UX Research",
    "Prototyping",
    "Wireframing",
    "Design Systems",
    "Adobe XD",
  ],
  "Business & Soft Skills": [
    "Communication",
    "Teamwork",
    "Leadership",
    "Problem Solving",
    "Time Management",
    "Project Management",
    "Critical Thinking",
    "Adaptability",
  ],
  Marketing: [
    "SEO",
    "Content Writing",
    "Social Media",
    "Google Ads",
    "Email Marketing",
    "Copywriting",
  ],
};

const HOBBY_SUGGESTIONS = [
  "Reading",
  "Writing",
  "Photography",
  "Travel",
  "Cooking",
  "Hiking",
  "Music",
  "Gaming",
  "Cycling",
  "Painting",
  "Yoga",
  "Open Source",
  "Volunteering",
  "Chess",
  "Football",
  "Cricket",
  "Running",
  "Gardening",
  "Blogging",
  "Tech Meetups",
];

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Basic info
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");

  // Skills
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  // Hobbies
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [newHobby, setNewHobby] = useState("");

  // Education
  const [education, setEducation] = useState<Education[]>([]);
  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [editingEducationId, setEditingEducationId] = useState<string | null>(
    null
  );

  // Experience
  const [experience, setExperience] = useState<Experience[]>([]);
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setAddress(profile.address || "");
      setBio(profile.bio || "");
      setSkills(profile.skills || []);
      setHobbies(profile.hobbies || []);
      setEducation(profile.education || []);
      setExperience(profile.experience || []);
    }
  }, [profile]);

  const handleSaveBasicInfo = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      console.log("💾 Saving basic info:", { name, phone, address, bio });
      const { data, error } = await profileService.updateProfile(user.id, {
        name,
        phone,
        address,
        bio,
      });

      if (error) {
        console.error("❌ Error saving profile:", error);
        alert(`Failed to save: ${error}`);
      } else {
        console.log("✅ Profile saved successfully:", data);
        await refreshProfile();
        setIsEditing(false);
      }
    } catch (err) {
      console.error("❌ Unexpected error:", err);
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = async () => {
    if (!user || !newSkill.trim()) return;
    const updatedSkills = [...skills, newSkill.trim()];
    setSkills(updatedSkills);
    setNewSkill("");

    await profileService.updateSkills(user.id, updatedSkills);
    await refreshProfile();
  };

  const handleAddSuggestedSkill = async (skill: string) => {
    if (!user) return;
    if (skills.some((s) => s.toLowerCase() === skill.toLowerCase())) return;
    const updatedSkills = [...skills, skill];
    setSkills(updatedSkills);
    await profileService.updateSkills(user.id, updatedSkills);
    await refreshProfile();
  };

  const handleRemoveSkill = async (index: number) => {
    if (!user) return;
    const updatedSkills = skills.filter((_, i) => i !== index);
    setSkills(updatedSkills);

    await profileService.updateSkills(user.id, updatedSkills);
    await refreshProfile();
  };

  const handleAddHobby = async () => {
    if (!user || !newHobby.trim()) return;
    const updatedHobbies = [...hobbies, newHobby.trim()];
    setHobbies(updatedHobbies);
    setNewHobby("");

    await profileService.updateHobbies(user.id, updatedHobbies);
    await refreshProfile();
  };

  const handleAddSuggestedHobby = async (hobby: string) => {
    if (!user) return;
    if (hobbies.some((h) => h.toLowerCase() === hobby.toLowerCase())) return;
    const updatedHobbies = [...hobbies, hobby];
    setHobbies(updatedHobbies);
    await profileService.updateHobbies(user.id, updatedHobbies);
    await refreshProfile();
  };

  const handleRemoveHobby = async (index: number) => {
    if (!user) return;
    const updatedHobbies = hobbies.filter((_, i) => i !== index);
    setHobbies(updatedHobbies);

    await profileService.updateHobbies(user.id, updatedHobbies);
    await refreshProfile();
  };

  const handleAddEducation = async (edu: Omit<Education, "id">) => {
    if (!user) return;
    const newEdu = { ...edu, id: Date.now().toString() };
    const updatedEducation = [...education, newEdu];
    setEducation(updatedEducation);
    setIsAddingEducation(false);

    await profileService.updateEducation(user.id, updatedEducation);
    await refreshProfile();
  };

  const handleUpdateEducation = async (
    id: string,
    edu: Omit<Education, "id">
  ) => {
    if (!user) return;
    const updatedEducation = education.map((e) =>
      e.id === id ? { ...edu, id } : e
    );
    setEducation(updatedEducation);
    setEditingEducationId(null);

    await profileService.updateEducation(user.id, updatedEducation);
    await refreshProfile();
  };

  const handleDeleteEducation = async (id: string) => {
    if (!user) return;
    const updatedEducation = education.filter((e) => e.id !== id);
    setEducation(updatedEducation);

    await profileService.updateEducation(user.id, updatedEducation);
    await refreshProfile();
  };

  const handleAddExperience = async (exp: Omit<Experience, "id">) => {
    if (!user) return;
    const newExp = { ...exp, id: Date.now().toString() };
    const updatedExperience = [...experience, newExp];
    setExperience(updatedExperience);
    setIsAddingExperience(false);

    await profileService.updateExperience(user.id, updatedExperience);
    await refreshProfile();
  };

  const handleUpdateExperience = async (
    id: string,
    exp: Omit<Experience, "id">
  ) => {
    if (!user) return;
    const updatedExperience = experience.map((e) =>
      e.id === id ? { ...exp, id } : e
    );
    setExperience(updatedExperience);
    setEditingExperienceId(null);

    await profileService.updateExperience(user.id, updatedExperience);
    await refreshProfile();
  };

  const handleDeleteExperience = async (id: string) => {
    if (!user) return;
    const updatedExperience = experience.filter((e) => e.id !== id);
    setExperience(updatedExperience);

    await profileService.updateExperience(user.id, updatedExperience);
    await refreshProfile();
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.05 },
            },
          }}
        >
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 md:mb-8"
            style={{ color: "var(--color-text-main)" }}
          >
            My{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#780000] to-[#C1121F]">
              Profile
            </span>
          </h1>

          {/* Basic Info Card */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
            }}
            className="rounded-2xl p-4 sm:p-6 shadow-md border mb-6 backdrop-blur-md"
            style={{
              backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
              borderColor: "var(--color-accent-light)",
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <h2
                className="text-xl sm:text-2xl font-bold"
                style={{ color: "var(--color-text-main)" }}
              >
                Basic Information
              </h2>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  fullWidth={false}
                  className="sm:w-auto"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 sm:flex-none"
                  >
                    <X className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Cancel</span>
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveBasicInfo}
                    isLoading={isSaving}
                    className="flex-1 sm:flex-none"
                  >
                    <Save className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Save</span>
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--color-text-body)" }}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name
                </label>
                {isEditing ? (
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                ) : (
                  <p
                    className="break-words"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {name || "Not set"}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--color-text-body)" }}
                >
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <p
                  className="break-all text-sm sm:text-base"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {profile?.email}
                </p>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--color-text-body)" }}
                >
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone
                </label>
                {isEditing ? (
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone"
                  />
                ) : (
                  <p style={{ color: "var(--color-text-muted)" }}>
                    {phone || "Not set"}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--color-text-body)" }}
                >
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Address
                </label>
                {isEditing ? (
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your address"
                  />
                ) : (
                  <p
                    className="break-words"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {address || "Not set"}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--color-text-body)" }}
                >
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#780000] text-base"
                    style={{
                      backgroundColor: "var(--color-surface)",
                      borderColor: "var(--color-accent-light)",
                      color: "var(--color-text-body)",
                    }}
                    rows={3}
                  />
                ) : (
                  <p
                    className="break-words whitespace-pre-wrap"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {bio || "Not set"}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Skills Card */}
          <SkillsSection
            skills={skills}
            newSkill={newSkill}
            setNewSkill={setNewSkill}
            onAdd={handleAddSkill}
            onRemove={handleRemoveSkill}
            onAddSuggested={handleAddSuggestedSkill}
          />

          {/* Hobbies Card */}
          <HobbiesSection
            hobbies={hobbies}
            newHobby={newHobby}
            setNewHobby={setNewHobby}
            onAdd={handleAddHobby}
            onRemove={handleRemoveHobby}
            onAddSuggested={handleAddSuggestedHobby}
          />

          {/* Education Card */}
          <EducationSection
            education={education}
            isAdding={isAddingEducation}
            setIsAdding={setIsAddingEducation}
            editingId={editingEducationId}
            setEditingId={setEditingEducationId}
            onAdd={handleAddEducation}
            onUpdate={handleUpdateEducation}
            onDelete={handleDeleteEducation}
          />

          {/* Experience Card */}
          <ExperienceSection
            experience={experience}
            isAdding={isAddingExperience}
            setIsAdding={setIsAddingExperience}
            editingId={editingExperienceId}
            setEditingId={setEditingExperienceId}
            onAdd={handleAddExperience}
            onUpdate={handleUpdateExperience}
            onDelete={handleDeleteExperience}
          />
        </motion.div>
      </div>
    </div>
  );
};

// Skills Section Component
const SkillsSection = ({
  skills,
  newSkill,
  setNewSkill,
  onAdd,
  onRemove,
  onAddSuggested,
}: any) => {
  const [activeCat, setActiveCat] = useState<string>(
    Object.keys(SKILL_SUGGESTIONS)[0]
  );
  const userSkillSet = new Set(
    (skills as string[]).map((s) => s.toLowerCase())
  );

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
      }}
      className="rounded-2xl p-6 shadow-md border mb-6 backdrop-blur-md"
      style={{
        backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
        borderColor: "var(--color-accent-light)",
      }}
    >
      <h2
        className="text-2xl font-bold mb-4"
        style={{ color: "var(--color-text-main)" }}
      >
        Skills
      </h2>

      <div className="flex gap-2 mb-4">
        <Input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          placeholder="Add a skill"
          onKeyPress={(e) => e.key === "Enter" && onAdd()}
        />
        <Button onClick={onAdd} size="sm">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {skills.map((skill: string, index: number) => (
          <motion.div
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-3 py-1 bg-[#780000]/10 text-[#780000] dark:bg-[#780000]/20 dark:text-[#C1121F] rounded-full text-sm font-medium flex items-center gap-2"
          >
            {skill}
            <button
              onClick={() => onRemove(index)}
              className="hover:text-[#C1121F] transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
        {skills.length === 0 && (
          <p style={{ color: "var(--color-text-muted)" }}>No skills added yet</p>
        )}
      </div>

      {/* Suggestions */}
      <div
        className="rounded-xl p-4 border border-dashed"
        style={{ borderColor: "var(--color-accent-light)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles
            className="w-4 h-4"
            style={{ color: "var(--color-primary)" }}
          />
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--color-text-main)" }}
          >
            Common skills — tap to add
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {Object.keys(SKILL_SUGGESTIONS).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className="text-xs font-semibold px-3 py-1 rounded-full transition-all"
              style={{
                backgroundColor:
                  activeCat === cat
                    ? "var(--color-primary)"
                    : "var(--color-accent-light)",
                color: activeCat === cat ? "white" : "var(--color-primary)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {SKILL_SUGGESTIONS[activeCat].map((s) => {
            const added = userSkillSet.has(s.toLowerCase());
            return (
              <button
                key={s}
                disabled={added}
                onClick={() => onAddSuggested(s)}
                className={`text-sm px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
                  added ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"
                }`}
                style={{
                  backgroundColor: added
                    ? "var(--color-accent-light)"
                    : "var(--color-surface)",
                  color: "var(--color-text-body)",
                  border: "1px solid var(--color-accent-light)",
                }}
              >
                {!added && <Plus className="w-3 h-3" />}
                {s}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

// Hobbies Section Component
const HobbiesSection = ({
  hobbies,
  newHobby,
  setNewHobby,
  onAdd,
  onRemove,
  onAddSuggested,
}: any) => {
  const userHobbySet = new Set(
    (hobbies as string[]).map((h) => h.toLowerCase())
  );

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
      }}
      className="rounded-2xl p-6 shadow-md border mb-6 backdrop-blur-md"
      style={{
        backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
        borderColor: "var(--color-accent-light)",
      }}
    >
      <h2
        className="text-2xl font-bold mb-4"
        style={{ color: "var(--color-text-main)" }}
      >
        Hobbies
      </h2>

      <div className="flex gap-2 mb-4">
        <Input
          value={newHobby}
          onChange={(e) => setNewHobby(e.target.value)}
          placeholder="Add a hobby"
          onKeyPress={(e) => e.key === "Enter" && onAdd()}
        />
        <Button onClick={onAdd} size="sm">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {hobbies.map((hobby: string, index: number) => (
          <motion.div
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-3 py-1 bg-[#669BBC]/10 text-[#669BBC] dark:bg-[#669BBC]/20 rounded-full text-sm font-medium flex items-center gap-2"
          >
            {hobby}
            <button
              onClick={() => onRemove(index)}
              className="hover:text-[#003049] transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
        {hobbies.length === 0 && (
          <p style={{ color: "var(--color-text-muted)" }}>No hobbies added yet</p>
        )}
      </div>

      <div
        className="rounded-xl p-4 border border-dashed"
        style={{ borderColor: "var(--color-accent-light)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles
            className="w-4 h-4"
            style={{ color: "var(--color-primary)" }}
          />
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--color-text-main)" }}
          >
            Common hobbies — tap to add
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {HOBBY_SUGGESTIONS.map((h) => {
            const added = userHobbySet.has(h.toLowerCase());
            return (
              <button
                key={h}
                disabled={added}
                onClick={() => onAddSuggested(h)}
                className={`text-sm px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
                  added ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"
                }`}
                style={{
                  backgroundColor: added
                    ? "var(--color-accent-light)"
                    : "var(--color-surface)",
                  color: "var(--color-text-body)",
                  border: "1px solid var(--color-accent-light)",
                }}
              >
                {!added && <Plus className="w-3 h-3" />}
                {h}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

// Education Section Component
type EducationSectionProps = {
  education: Education[];
  isAdding: boolean;
  setIsAdding: (value: boolean) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onAdd: (data: Omit<Education, "id">) => void;
  onUpdate: (id: string, data: Omit<Education, "id">) => void;
  onDelete: (id: string) => void;
};

const EducationSection = ({
  education,
  isAdding,
  setIsAdding,
  editingId,
  setEditingId,
  onAdd,
  onUpdate,
  onDelete,
}: EducationSectionProps) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 24 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
    }}
    className="rounded-2xl p-6 shadow-md border mb-6 backdrop-blur-md"
    style={{
      backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
      borderColor: "var(--color-accent-light)",
    }}
  >
    <div className="flex items-center justify-between mb-4">
      <h2
        className="text-2xl font-bold flex items-center gap-2"
        style={{ color: "var(--color-text-main)" }}
      >
        <GraduationCap className="w-6 h-6" />
        Education
      </h2>
      <Button onClick={() => setIsAdding(true)} size="sm">
        <Plus className="w-4 h-4 mr-2" />
        Add Education
      </Button>
    </div>

    <AnimatePresence>
      {isAdding && (
        <EducationForm onSave={onAdd} onCancel={() => setIsAdding(false)} />
      )}
    </AnimatePresence>

    <div className="space-y-4">
      {education.map((edu: Education) => (
        <div key={edu.id}>
          {editingId === edu.id ? (
            <EducationForm
              education={edu}
              onSave={(data: Omit<Education, "id">) => onUpdate(edu.id!, data)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <EducationCard
              education={edu}
              onEdit={() => setEditingId(edu.id!)}
              onDelete={() => onDelete(edu.id!)}
            />
          )}
        </div>
      ))}
      {education.length === 0 && !isAdding && (
        <p
          className="text-center py-8"
          style={{ color: "var(--color-text-muted)" }}
        >
          No education added yet
        </p>
      )}
    </div>
  </motion.div>
);

// Experience Section Component
type ExperienceSectionProps = {
  experience: Experience[];
  isAdding: boolean;
  setIsAdding: (value: boolean) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onAdd: (data: Omit<Experience, "id">) => void;
  onUpdate: (id: string, data: Omit<Experience, "id">) => void;
  onDelete: (id: string) => void;
};

const ExperienceSection = ({
  experience,
  isAdding,
  setIsAdding,
  editingId,
  setEditingId,
  onAdd,
  onUpdate,
  onDelete,
}: ExperienceSectionProps) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 24 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
    }}
    className="rounded-2xl p-6 shadow-md border mb-6 backdrop-blur-md"
    style={{
      backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
      borderColor: "var(--color-accent-light)",
    }}
  >
    <div className="flex items-center justify-between mb-4">
      <h2
        className="text-2xl font-bold flex items-center gap-2"
        style={{ color: "var(--color-text-main)" }}
      >
        <Briefcase className="w-6 h-6" />
        Experience
      </h2>
      <Button onClick={() => setIsAdding(true)} size="sm">
        <Plus className="w-4 h-4 mr-2" />
        Add Experience
      </Button>
    </div>

    <AnimatePresence>
      {isAdding && (
        <ExperienceForm onSave={onAdd} onCancel={() => setIsAdding(false)} />
      )}
    </AnimatePresence>

    <div className="space-y-4">
      {experience.map((exp: Experience) => (
        <div key={exp.id}>
          {editingId === exp.id ? (
            <ExperienceForm
              experience={exp}
              onSave={(data: Omit<Experience, "id">) => onUpdate(exp.id!, data)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <ExperienceCard
              experience={exp}
              onEdit={() => setEditingId(exp.id!)}
              onDelete={() => onDelete(exp.id!)}
            />
          )}
        </div>
      ))}
      {experience.length === 0 && !isAdding && (
        <p
          className="text-center py-8"
          style={{ color: "var(--color-text-muted)" }}
        >
          No experience added yet
        </p>
      )}
    </div>
  </motion.div>
);

// Education Form Component
const EducationForm = ({ education, onSave, onCancel }: any) => {
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

// Education Card Component
const EducationCard = ({ education, onEdit, onDelete }: any) => {
  const getDisplayText = () => {
    const yearRange = `${education.startYear} - ${education.endYear}`;

    if (education.level === "school") {
      return {
        title: education.institutionName,
        subtitle: `${
          education.schoolType === "matric" ? "Matric" : "O-Levels"
        }`,
        details: `${education.schoolMarks} | ${yearRange}`,
      };
    } else if (education.level === "college") {
      const programNames = {
        alevels: "A-Levels",
        premedical: "Pre-Medical",
        ics: "ICS",
        preengineering: "Pre-Engineering",
        other: "Other",
      };
      return {
        title: education.institutionName,
        subtitle:
          programNames[education.collegeProgram as keyof typeof programNames] ||
          education.collegeProgram,
        details: `${education.collegeMarks} | ${yearRange}`,
      };
    } else {
      const degreeNames = {
        bachelors: "Bachelor's",
        masters: "Master's",
        phd: "PhD",
        diploma: "Diploma",
        other: "Other",
      };
      return {
        title: education.institutionName,
        subtitle: `${
          degreeNames[education.degreeType as keyof typeof degreeNames]
        } - ${education.degree}`,
        details: education.currentlyStudying
          ? `CGPA: ${education.cgpa || "In Progress"} | ${yearRange}`
          : `CGPA: ${education.cgpa} | ${yearRange}`,
      };
    }
  };

  const display = getDisplayText();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg p-4"
      style={{ backgroundColor: "var(--color-accent-light)" }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-1 text-xs font-medium bg-[#780000]/10 text-[#780000] dark:bg-[#C1121F]/20 dark:text-[#C1121F] rounded">
              {education.level.charAt(0).toUpperCase() +
                education.level.slice(1)}
            </span>
          </div>
          <h3 className="font-bold" style={{ color: "var(--color-text-main)" }}>
            {display.title}
          </h3>
          <p className="text-[#780000] dark:text-[#C1121F] font-medium">
            {display.subtitle}
          </p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {display.details}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-[#669BBC] hover:text-[#780000] transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-500 hover:text-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Experience Form Component
const ExperienceForm = ({ experience, onSave, onCancel }: any) => {
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

// Experience Card Component
const ExperienceCard = ({ experience, onEdit, onDelete }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-lg p-4"
    style={{ backgroundColor: "var(--color-accent-light)" }}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h3 className="font-bold" style={{ color: "var(--color-text-main)" }}>
          {experience.company}
        </h3>
        <p className="text-[#780000] dark:text-[#C1121F] font-medium">
          {experience.position}
        </p>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          {experience.startDate} -{" "}
          {experience.current ? "Present" : experience.endDate}
        </p>
        <p
          className="mt-2 text-sm"
          style={{ color: "var(--color-text-muted)" }}
        >
          {experience.description}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="p-2 text-[#669BBC] hover:text-[#780000] transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-red-500 hover:text-red-700 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  </motion.div>
);

export default Profile;
