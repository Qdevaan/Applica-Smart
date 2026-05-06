import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "../lib/supabase";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isLoggedIn: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme") as Theme;
    return stored || "light";
  });

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Only save theme to localStorage if user is logged in
    if (isLoggedIn) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, isLoggedIn]);

  useEffect(() => {
    let active = true;
    const apply = (hex: string | null) => {
      const root = document.documentElement;
      if (hex) {
        root.style.setProperty("--color-primary", hex);
        root.style.setProperty(
          "--color-primary-hover",
          `color-mix(in srgb, ${hex} 85%, white 15%)`
        );
      } else {
        root.style.removeProperty("--color-primary");
        root.style.removeProperty("--color-primary-hover");
      }
    };

    const fetchAndApply = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        apply(null);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("accent_color")
        .eq("id", session.user.id)
        .single();
      if (!active) return;
      apply((data?.accent_color as string | null | undefined) ?? null);
    };

    fetchAndApply();

    return () => {
      active = false;
    };
  }, [isLoggedIn]);

  const toggleTheme = () => {
    // Allow theme toggle always (both logged in and not logged in)
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setTheme = (newTheme: Theme) => {
    // Allow theme change always (both logged in and not logged in)
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isLoggedIn }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
