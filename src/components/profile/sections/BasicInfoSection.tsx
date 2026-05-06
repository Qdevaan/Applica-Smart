import { useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, Save, Edit2, X } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { profileService } from "../../../services/profile.service";
import Button from "../../ui/Button";
import Input from "../../ui/Input";

const cardClass =
  "rounded-2xl p-5 sm:p-6 shadow-md border backdrop-blur-md scroll-mt-24";
const cardStyle: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
  borderColor: "var(--color-accent-light)",
};

const BasicInfoSection = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? "");
    setPhone(profile.phone ?? "");
    setAddress(profile.address ?? "");
    setBio(profile.bio ?? "");
  }, [profile]);

  const onSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await profileService.updateProfile(user.id, {
      name,
      phone,
      address,
      bio,
    });
    if (!error) {
      await refreshProfile();
      setEditing(false);
    }
    setSaving(false);
  };

  return (
    <section id="basic" className={cardClass} style={cardStyle}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ color: "var(--color-text-main)" }}>
          Basic info
        </h2>
        {!editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Edit2 className="w-4 h-4 mr-2" /> Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
              <X className="w-4 h-4" />
            </Button>
            <Button variant="primary" size="sm" onClick={onSave} isLoading={saving}>
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Name" icon={<User className="w-4 h-4 inline mr-2" />}
               value={name} editing={editing} onChange={setName} placeholder="Your name" />
        <ReadField label="Email" icon={<Mail className="w-4 h-4 inline mr-2" />}
                   value={profile?.email ?? user?.email ?? ""} />
        <Field label="Phone" icon={<Phone className="w-4 h-4 inline mr-2" />}
               value={phone} editing={editing} onChange={setPhone} placeholder="Phone" />
        <Field label="Address" icon={<MapPin className="w-4 h-4 inline mr-2" />}
               value={address} editing={editing} onChange={setAddress} placeholder="City, Country" />
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-body)" }}>
            Bio
          </label>
          {editing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="A short summary about you"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#780000]"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-accent-light)",
                color: "var(--color-text-body)",
              }}
            />
          ) : (
            <p className="whitespace-pre-wrap" style={{ color: "var(--color-text-muted)" }}>
              {bio || "Not set"}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

const Field = ({ label, icon, value, editing, onChange, placeholder }: {
  label: string;
  icon: React.ReactNode;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  placeholder: string;
}) => (
  <div>
    <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-body)" }}>
      {icon}{label}
    </label>
    {editing ? (
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    ) : (
      <p className="break-words" style={{ color: "var(--color-text-muted)" }}>{value || "Not set"}</p>
    )}
  </div>
);

const ReadField = ({ label, icon, value }: { label: string; icon: React.ReactNode; value: string }) => (
  <div>
    <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-body)" }}>
      {icon}{label}
    </label>
    <p className="break-all text-sm sm:text-base" style={{ color: "var(--color-text-muted)" }}>
      {value}
    </p>
  </div>
);

export default BasicInfoSection;
