import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X, Sparkles } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { profileService } from "../../../services/profile.service";
import Button from "../../ui/Button";
import Input from "../../ui/Input";

const HOBBY_SUGGESTIONS = ["Reading","Writing","Photography","Travel","Cooking","Hiking","Music","Gaming","Cycling","Painting","Yoga","Open Source","Volunteering","Chess","Football","Cricket","Running","Gardening","Blogging","Tech Meetups"];

const cardClass = "rounded-2xl p-5 sm:p-6 shadow-md border backdrop-blur-md scroll-mt-24";
const cardStyle: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
  borderColor: "var(--color-accent-light)",
};

const HobbiesSection = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [newHobby, setNewHobby] = useState("");
  const hobbies = profile?.hobbies ?? [];
  const set = new Set(hobbies.map((h) => h.toLowerCase()));

  const persist = async (next: string[]) => {
    if (!user) return;
    await profileService.updateHobbies(user.id, next);
    await refreshProfile();
  };

  return (
    <section id="hobbies" className={cardClass} style={cardStyle}>
      <h2 className="text-xl font-bold mb-4" style={{ color: "var(--color-text-main)" }}>Hobbies</h2>

      <div className="flex gap-2 mb-4">
        <Input
          value={newHobby}
          onChange={(e) => setNewHobby(e.target.value)}
          placeholder="Add a hobby"
          onKeyPress={(e) => {
            if (e.key === "Enter" && newHobby.trim()) {
              persist([...hobbies, newHobby.trim()]);
              setNewHobby("");
            }
          }}
        />
        <Button size="sm" onClick={() => { if (newHobby.trim()) { persist([...hobbies, newHobby.trim()]); setNewHobby(""); } }}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {hobbies.map((h, i) => (
          <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="px-3 py-1 bg-[#669BBC]/10 text-[#669BBC] dark:bg-[#669BBC]/20 rounded-full text-sm font-medium flex items-center gap-2">
            {h}
            <button onClick={() => persist(hobbies.filter((_, j) => j !== i))}><X className="w-3 h-3" /></button>
          </motion.div>
        ))}
        {hobbies.length === 0 && (
          <p style={{ color: "var(--color-text-muted)" }}>No hobbies added yet</p>
        )}
      </div>

      <div className="rounded-xl p-4 border border-dashed" style={{ borderColor: "var(--color-accent-light)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
          <p className="text-sm font-semibold" style={{ color: "var(--color-text-main)" }}>Common hobbies — tap to add</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {HOBBY_SUGGESTIONS.map((h) => {
            const added = set.has(h.toLowerCase());
            return (
              <button key={h} disabled={added} onClick={() => !added && persist([...hobbies, h])}
                className={`text-sm px-3 py-1 rounded-full flex items-center gap-1 ${added ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"}`}
                style={{
                  backgroundColor: added ? "var(--color-accent-light)" : "var(--color-surface)",
                  color: "var(--color-text-body)",
                  border: "1px solid var(--color-accent-light)",
                }}>
                {!added && <Plus className="w-3 h-3" />}
                {h}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HobbiesSection;
