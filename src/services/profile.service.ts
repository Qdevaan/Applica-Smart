import { supabase } from '../lib/supabase';
import type { Profile, Education, Experience, TemplatePrefs } from '../lib/supabase';

export interface NotificationPrefs {
  email: boolean;
  push: boolean;
  applicationUpdates: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  email: true,
  push: false,
  applicationUpdates: true,
};

export function parsePreferences(profile: Profile | null): NotificationPrefs {
  if (!profile?.preferences) return { ...DEFAULT_PREFS };
  try {
    const parsed = JSON.parse(profile.preferences) as Partial<NotificationPrefs>;
    return { ...DEFAULT_PREFS, ...parsed };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export const profileService = {
  // Get user profile
  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Get profile error:', error);
      return { data: null, error: error.message || 'Failed to fetch profile' };
    }
  },

  // Update basic profile info
  async updateProfile(userId: string, updates: Partial<Profile>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { data: null, error: error.message || 'Failed to update profile' };
    }
  },

  // Update education
  async updateEducation(userId: string, education: Education[]) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          education,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Update education error:', error);
      return { data: null, error: error.message || 'Failed to update education' };
    }
  },

  // Update experience
  async updateExperience(userId: string, experience: Experience[]) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          experience,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Update experience error:', error);
      return { data: null, error: error.message || 'Failed to update experience' };
    }
  },

  // Update skills
  async updateSkills(userId: string, skills: string[]) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          skills,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Update skills error:', error);
      return { data: null, error: error.message || 'Failed to update skills' };
    }
  },

  // Update hobbies
  async updateHobbies(userId: string, hobbies: string[]) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          hobbies,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Update hobbies error:', error);
      return { data: null, error: error.message || 'Failed to update hobbies' };
    }
  },

  // Update CV link
  async updateCVLink(userId: string, cvLink: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          cv_link: cvLink,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Update CV link error:', error);
      return { data: null, error: error.message || 'Failed to update CV link' };
    }
  },

  async updatePhotoUrl(userId: string, photoUrl: string | null) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ photo_url: photoUrl, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Update photo url error:', error);
      return { data: null, error: error.message || 'Failed to update photo' };
    }
  },

  async updatePreferences(userId: string, prefs: NotificationPrefs) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          preferences: JSON.stringify(prefs),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Update preferences error:', error);
      return { data: null, error: error.message || 'Failed to update preferences' };
    }
  },

  async updateAccentColor(userId: string, accentColor: string | null) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ accent_color: accentColor, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Update accent color error:', error);
      return { data: null, error: error.message || 'Failed to update accent color' };
    }
  },

  async updateDefaultTemplate(userId: string, templateId: string) {
    try {
      const current = await supabase
        .from('profiles')
        .select('template_prefs')
        .eq('id', userId)
        .single();
      const existing = (current.data?.template_prefs as TemplatePrefs | null) ?? {};
      const next: TemplatePrefs = { ...existing, defaultTemplateId: templateId };
      const { data, error } = await supabase
        .from('profiles')
        .update({ template_prefs: next, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Update default template error:', error);
      return { data: null, error: error.message || 'Failed to update default template' };
    }
  },
};
