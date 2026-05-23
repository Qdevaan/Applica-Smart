import { useAuth } from "./useAuth";

export type AvatarSource = "custom" | "google" | "none";

export interface UseAvatarResult {
  url: string | null;
  name: string;
  initials: string;
  source: AvatarSource;
  googleUrl: string | null;
}

export function useAvatar(): UseAvatarResult {
  const { user, profile } = useAuth();

  const googleUrl =
    (user?.user_metadata?.avatar_url as string | undefined) ?? null;
  const customUrl = profile?.photo_url ?? null;
  const url = customUrl ?? googleUrl;

  const source: AvatarSource = customUrl
    ? "custom"
    : googleUrl
      ? "google"
      : "none";

  const name =
    profile?.name ??
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email ??
    "";

  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() ?? "")
      .join("") || "?";

  return { url, name, initials, source, googleUrl };
}
