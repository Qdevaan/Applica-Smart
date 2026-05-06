import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, Palette, Bell, AlertTriangle } from "lucide-react";
import Tabs, { type TabItem } from "../components/ui/Tabs";
import AccountTab from "../components/settings/AccountTab";
import SecurityTab from "../components/settings/SecurityTab";
import AppearanceTab from "../components/settings/AppearanceTab";
import NotificationsTab from "../components/settings/NotificationsTab";
import DangerTab from "../components/settings/DangerTab";

const TABS: TabItem[] = [
  { id: "account", label: "Account", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "danger", label: "Danger", icon: AlertTriangle },
];

const Settings = () => {
  const [params, setParams] = useSearchParams();
  const initial = params.get("tab") ?? "account";
  const [tab, setTab] = useState(TABS.some((t) => t.id === initial) ? initial : "account");

  useEffect(() => {
    setParams({ tab }, { replace: true });
  }, [tab, setParams]);

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6"
          style={{ color: "var(--color-text-main)" }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#780000] to-[#C1121F]">
            Settings
          </span>
        </motion.h1>

        <div className="mb-6">
          <Tabs items={TABS} value={tab} onChange={setTab} />
        </div>

        <div
          className="rounded-2xl p-5 sm:p-6 shadow-md border backdrop-blur-md"
          style={{
            backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
            borderColor: "var(--color-accent-light)",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {tab === "account" && <AccountTab />}
              {tab === "security" && <SecurityTab />}
              {tab === "appearance" && <AppearanceTab />}
              {tab === "notifications" && <NotificationsTab />}
              {tab === "danger" && <DangerTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Settings;
