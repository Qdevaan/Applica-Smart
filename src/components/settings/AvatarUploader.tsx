import { useRef, useState } from "react";
import { Upload, RefreshCcw, Trash2 } from "lucide-react";
import Avatar from "../ui/Avatar";
import Toast from "../ui/Toast";
import Button from "../ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { useAvatar } from "../../hooks/useAvatar";
import { avatarService } from "../../services/avatar.service";
import { profileService } from "../../services/profile.service";

const AvatarUploader = () => {
  const { user, refreshProfile } = useAuth();
  const { url, name, source, googleUrl } = useAvatar();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const onPick = () => fileRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setBusy(true);
    try {
      await avatarService.upload(user.id, file);
      await refreshProfile();
      setToast({ message: "Avatar updated", type: "success" });
    } catch (err: any) {
      setToast({ message: err?.message ?? "Upload failed", type: "error" });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onUseGoogle = async () => {
    if (!user || !googleUrl) return;
    setBusy(true);
    try {
      const { error } = await profileService.updatePhotoUrl(user.id, null);
      if (error) throw new Error(error);
      await avatarService.remove(user.id).catch(() => {});
      await refreshProfile();
      setToast({ message: "Using your Google photo", type: "success" });
    } catch (err: any) {
      setToast({ message: err?.message ?? "Failed to switch", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const onRemove = async () => {
    if (!user) return;
    setBusy(true);
    try {
      await avatarService.remove(user.id);
      await refreshProfile();
      setToast({ message: "Avatar removed", type: "success" });
    } catch (err: any) {
      setToast({ message: err?.message ?? "Remove failed", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <Avatar url={url} name={name} size="xl" ring />
      <div className="flex flex-wrap gap-2">
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
        <Button size="sm" variant="primary" onClick={onPick} isLoading={busy}>
          <Upload className="w-4 h-4 mr-2" /> Upload new
        </Button>
        {googleUrl && source === "custom" && (
          <Button size="sm" variant="outline" onClick={onUseGoogle}>
            <RefreshCcw className="w-4 h-4 mr-2" /> Use Google photo
          </Button>
        )}
        {source === "custom" && (
          <Button size="sm" variant="outline" onClick={onRemove}>
            <Trash2 className="w-4 h-4 mr-2" /> Remove
          </Button>
        )}
      </div>
      {toast && (
        <Toast message={toast.message} type={toast.type} isVisible={!!toast} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default AvatarUploader;
