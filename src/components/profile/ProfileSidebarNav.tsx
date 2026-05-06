import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User, Wrench, Smile, GraduationCap, Briefcase, FolderGit2,
  Award, Languages, Trophy, HeartHandshake, UserCheck, Link as LinkIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: typeof User;
}

export const PROFILE_NAV: NavItem[] = [
  { id: "basic", label: "Basic", icon: User },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "hobbies", label: "Hobbies", icon: Smile },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "certifications", label: "Certifications", icon: Award },
  { id: "languages", label: "Languages", icon: Languages },
  { id: "awards", label: "Awards", icon: Trophy },
  { id: "volunteer", label: "Volunteer", icon: HeartHandshake },
  { id: "references", label: "References", icon: UserCheck },
  { id: "links", label: "Links", icon: LinkIcon },
];

const ProfileSidebarNav = () => {
  const [active, setActive] = useState<string>("basic");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
    );
    PROFILE_NAV.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="hidden lg:block sticky top-24 self-start">
      <ul className="space-y-1">
        {PROFILE_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                style={{
                  color: isActive ? "var(--color-primary)" : "var(--color-text-main)",
                }}
              >
                {isActive && (
                  <motion.span
                    layoutId="profile-nav-indicator"
                    className="absolute inset-0 rounded-lg"
                    style={{ backgroundColor: "var(--color-accent-light)" }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {item.label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default ProfileSidebarNav;
