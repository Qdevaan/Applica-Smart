import { useEffect, useState } from "react";
import { Copy, LogOut, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { profileService } from "../../services/profile.service";
import Input from "../ui/Input";
import Button from "../ui/Button";
import AvatarUploader from "./AvatarUploader";
import Toast from "../ui/Toast";

const AccountTab = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? "");
    setPhone(profile.phone ?? "");
    setAddress(profile.address ?? "");
  }, [profile]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await profileService.updateProfile(user.id, { name, phone, address });
    setSaving(false);
    if (error) {
      setToast({ message: error, type: "error" });
    } else {
      await refreshProfile();
      setToast({ message: "Saved", type: "success" });
    }
  };

  const copyEmail = () => {
    if (!user?.email) return;
    navigator.clipboard.writeText(user.email);
    setToast({ message: "Email copied", type: "success" });
  };

  const onSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="space-y-6">
      <AvatarUploader />

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-body)" }}>
          Email
        </label>
        <div className="flex items-center gap-2">
          <p className="break-all flex-1" style={{ color: "var(--color-text-muted)" }}>
            {user?.email}
          </p>
          <button onClick={copyEmail} className="p-2 rounded-lg" style={{ color: "var(--color-primary)" }}>
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} className="md:col-span-2" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={save} isLoading={saving}>
          <Save className="w-4 h-4 mr-2" /> Save changes
        </Button>
        <Button variant="outline" onClick={onSignOut}>
          <LogOut className="w-4 h-4 mr-2" /> Sign out
        </Button>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} isVisible={!!toast} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default AccountTab;
