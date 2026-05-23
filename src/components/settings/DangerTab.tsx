import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Toast from "../ui/Toast";

const DangerTab = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const onDelete = async () => {
    setBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not signed in");

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? body.error ?? `HTTP ${res.status}`);
      }
      await signOut();
      navigate("/", { replace: true });
    } catch (err: any) {
      setToast({ message: err.message ?? "Delete failed", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4 border border-red-200" style={{ backgroundColor: "rgba(193,18,31,0.05)" }}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-red-900 dark:text-red-300 mb-1">Delete account</h3>
            <p className="text-sm text-red-700 dark:text-red-400 mb-3">
              Permanently deletes your profile, applications, generated CVs, and storage files. This cannot be undone.
            </p>
            <Button
              variant="outline"
              onClick={() => setOpen(true)}
              className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Delete account
            </Button>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="rounded-2xl p-6 max-w-md w-full" style={{ backgroundColor: "var(--color-surface)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: "var(--color-text-main)" }}>
                Confirm deletion
              </h3>
              <button onClick={() => setOpen(false)} className="p-1"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
              Type <strong>DELETE</strong> to confirm. This is irreversible.
            </p>
            <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="DELETE" />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={onDelete}
                disabled={confirmText !== "DELETE" || busy}
                isLoading={busy}
              >
                Delete forever
              </Button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} isVisible={!!toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default DangerTab;
