import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Profile } from "../lib/supabase";
import { profileService } from "../services/profile.service";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = (userId: string, mounted: { current: boolean }) => {
    profileService.getProfile(userId).then(({ data, error }) => {
      if (error) console.error("Profile fetch error:", error);
      if (mounted.current && data) setProfile(data);
    });
  };

  const refreshProfile = async () => {
    if (!user?.id) return;
    const { data, error } = await profileService.getProfile(user.id);
    if (error) console.error("Profile refresh error:", error);
    if (data) setProfile(data);
  };

  useEffect(() => {
    const mounted = { current: true };

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted.current) return;
      if (error) { setLoading(false); return; }
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id, mounted);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted.current) return;
      // INITIAL_SESSION is handled by getSession above — skip to avoid double fetch
      if (event === "INITIAL_SESSION") return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, mounted);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
