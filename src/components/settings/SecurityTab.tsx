import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Save } from "lucide-react";
import { authService } from "../../services/auth.service";
import Button from "../ui/Button";
import Input from "../ui/Input";

const SecurityTab = () => {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (next.length < 8) return setError("Password must be at least 8 characters");
    if (next !== confirm) return setError("Passwords do not match");

    setBusy(true);
    const { error: err } = await authService.updatePassword(next);
    setBusy(false);

    if (err) {
      setError(err.message || "Failed to update password");
    } else {
      setSuccess("Password updated");
      setCurrent(""); setNext(""); setConfirm("");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-body)" }}>
          <Lock className="w-4 h-4 inline mr-2" /> Current password
        </label>
        <div className="relative">
          <Input type={showCurrent ? "text" : "password"} value={current} onChange={(e) => setCurrent(e.target.value)} required />
          <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100">
            {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-body)" }}>New password</label>
        <div className="relative">
          <Input
            type={showNext ? "text" : "password"}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
            helperText="At least 8 characters; mix letters, numbers, and symbols for strength."
          />
          <button type="button" onClick={() => setShowNext(!showNext)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100">
            {showNext ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-body)" }}>Confirm new password</label>
        <div className="relative">
          <Input type={showConfirm ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100">
            {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          {error}
        </motion.div>
      )}
      {success && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-600 dark:text-green-400">
          {success}
        </motion.div>
      )}

      <Button type="submit" variant="primary" isLoading={busy}>
        <Save className="w-4 h-4 mr-2" /> Update password
      </Button>
    </form>
  );
};

export default SecurityTab;
