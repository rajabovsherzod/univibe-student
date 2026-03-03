import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CachedProfile {
  user_public_id?: string | null;
  name?: string | null;
  surname?: string | null;
  full_name?: string | null;
  user_name?: string | null;
  user_surname?: string | null;
  email?: string | null;
  profile_photo?: string | null;
  university_name?: string | null;
  university_public_id?: string | null;
  faculty_name?: string | null;
  degree_level_name?: string | null;
  year_level_name?: string | null;
  status?: string | null;
  contact_phone_number?: string | null;
  date_of_birth?: string | null;
}

interface ProfileStoreState {
  profile: CachedProfile | null;
  setProfile: (profile: CachedProfile) => void;
  clearProfile: () => void;
}

// ── Store Definition ───────────────────────────────────────────────────────

export const useProfileStore = create<ProfileStoreState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: "univibe-profile",
    }
  )
);
