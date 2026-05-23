import { motion } from "framer-motion";
import ProfileSidebarNav from "../components/profile/ProfileSidebarNav";
import ProfileLivePreview from "../components/profile/ProfileLivePreview";
import BasicInfoSection from "../components/profile/sections/BasicInfoSection";
import SkillsSection from "../components/profile/sections/SkillsSection";
import HobbiesSection from "../components/profile/sections/HobbiesSection";
import EducationSection from "../components/profile/sections/EducationSection";
import ExperienceSection from "../components/profile/sections/ExperienceSection";
import ProjectsSection from "../components/profile/sections/ProjectsSection";
import CertificationsSection from "../components/profile/sections/CertificationsSection";
import LanguagesSection from "../components/profile/sections/LanguagesSection";
import AwardsSection from "../components/profile/sections/AwardsSection";
import VolunteerSection from "../components/profile/sections/VolunteerSection";
import ReferencesSection from "../components/profile/sections/ReferencesSection";
import LinksSection from "../components/profile/sections/LinksSection";

const Profile = () => {
  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6"
          style={{ color: "var(--color-text-main)" }}
        >
          My{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#780000] to-[#C1121F]">
            Profile
          </span>
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)_minmax(0,440px)] gap-6">
          <ProfileSidebarNav />

          <main className="space-y-6">
            <BasicInfoSection />
            <SkillsSection />
            <HobbiesSection />
            <EducationSection />
            <ExperienceSection />
            <ProjectsSection />
            <CertificationsSection />
            <LanguagesSection />
            <AwardsSection />
            <VolunteerSection />
            <ReferencesSection />
            <LinksSection />
          </main>

          <ProfileLivePreview />
        </div>
      </div>
    </div>
  );
};

export default Profile;
