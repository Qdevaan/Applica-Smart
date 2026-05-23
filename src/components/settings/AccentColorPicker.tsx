import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { profileService } from "../../services/profile.service";

const PRESETS = ["#780000", "#0f766e", "#1e40af", "#7c3aed", "#b45309", "#0f172a"];

const AccentColorPicker = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    setValue(profile?.accent_color ?? "");
  }, [profile?.accent_color]);

  const apply = async (hex: string | null) => {
    if (!user) return;
    setValue(hex ?? "");
    if (hex) {
      document.documentElement.style.setProperty("--color-primary", hex);
      document.documentElement.style.setProperty(
        "--color-primary-hover",
        `color-mix(in srgb, ${hex} 85%, white 15%)`
      );
    } else {
      document.documentElement.style.removeProperty("--color-primary");
      document.documentElement.style.removeProperty("--color-primary-hover");
    }
    await profileService.updateAccentColor(user.id, hex);
    await refreshProfile();
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium" style={{ color: "var(--color-text-main)" }}>
        Accent color
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((hex) => (
          <button
            key={hex}
            onClick={() => apply(hex)}
            className="w-9 h-9 rounded-full border-2 flex items-center justify-center"
            style={{
              backgroundColor: hex,
              borderColor: value === hex ? "white" : "transparent",
              boxShadow: value === hex ? "0 0 0 2px var(--color-primary)" : undefined,
            }}
            aria-label={`Set accent color ${hex}`}
          >
            {value === hex && <Check className="w-4 h-4 text-white" />}
          </button>
        ))}
        <input
          type="color"
          value={value || "#780000"}
          onChange={(e) => apply(e.target.value)}
          className="w-9 h-9 rounded-full border-2 cursor-pointer"
          aria-label="Custom accent color"
        />
        <button
          onClick={() => apply(null)}
          className="text-sm font-semibold px-3 py-1 rounded-full"
          style={{ backgroundColor: "var(--color-accent-light)", color: "var(--color-primary)" }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default AccentColorPicker;
