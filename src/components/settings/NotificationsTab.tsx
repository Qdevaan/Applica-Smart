import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  profileService,
  parsePreferences,
  type NotificationPrefs,
} from "../../services/profile.service";
import Toast from "../ui/Toast";

const NotificationsTab = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPrefs>(parsePreferences(profile));
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    setPrefs(parsePreferences(profile));
  }, [profile]);

  const update = async (next: NotificationPrefs) => {
    if (!user) return;
    const prev = prefs;
    setPrefs(next);
    const { error } = await profileService.updatePreferences(user.id, next);
    if (error) {
      setPrefs(prev);
      setToast({ message: error, type: "error" });
    } else {
      await refreshProfile();
    }
  };

  const Row = ({
    title, desc, value, onChange,
  }: { title: string; desc: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between p-4 rounded-lg"
         style={{ backgroundColor: "var(--color-accent-light)" }}>
      <div>
        <p className="font-medium" style={{ color: "var(--color-text-main)" }}>{title}</p>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{desc}</p>
      </div>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="w-5 h-5" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 rounded-lg text-sm"
           style={{ backgroundColor: "var(--color-accent-light)", color: "var(--color-text-muted)" }}>
        <Info className="w-4 h-4 mt-0.5" />
        Email and push delivery are rolling out — your preferences are saved now and used when delivery launches.
      </div>

      <Row title="Email notifications" desc="Updates about your applications via email"
           value={prefs.email} onChange={(v) => update({ ...prefs, email: v })} />
      <Row title="Push notifications" desc="Real-time updates in the browser"
           value={prefs.push} onChange={(v) => update({ ...prefs, push: v })} />
      <Row title="Application updates" desc="Notify on status changes"
           value={prefs.applicationUpdates} onChange={(v) => update({ ...prefs, applicationUpdates: v })} />

      {toast && <Toast message={toast.message} type={toast.type} isVisible={!!toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default NotificationsTab;
