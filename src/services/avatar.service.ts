import { supabase } from "../lib/supabase";
import { profileService } from "./profile.service";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const BUCKET = "avatars";

function extFromType(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

export const avatarService = {
  /**
   * Upload an avatar image, set profile.photo_url to its public URL.
   * Throws on validation failure or storage error.
   */
  async upload(userId: string, file: File): Promise<string> {
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image");
    }
    if (file.size > MAX_BYTES) {
      throw new Error("Image must be under 2MB");
    }

    const ext = extFromType(file.type);
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });
    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(path);

    // Cache-bust so img tags re-fetch after re-upload
    const busted = `${publicUrl}?v=${Date.now()}`;

    const { error: profErr } = await profileService.updatePhotoUrl(userId, busted);
    if (profErr) throw new Error(profErr);

    return busted;
  },

  /**
   * Remove the user's custom avatar files and clear profile.photo_url.
   */
  async remove(userId: string): Promise<void> {
    const { data: list } = await supabase.storage
      .from(BUCKET)
      .list(userId, { limit: 100 });

    if (list && list.length > 0) {
      const paths = list.map((entry) => `${userId}/${entry.name}`);
      const { error: rmErr } = await supabase.storage
        .from(BUCKET)
        .remove(paths);
      if (rmErr) throw rmErr;
    }

    const { error: profErr } = await profileService.updatePhotoUrl(userId, null);
    if (profErr) throw new Error(profErr);
  },
};
