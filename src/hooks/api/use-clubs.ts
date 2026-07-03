import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { API_CONFIG } from "@/lib/api/config";
import axiosInstance from "@/lib/axios";

// ── Types (match backend ClubList / ClubDetail serializers) ─────────────────

export interface ClubCategory {
  public_id?: string;
  name?: string;
}

export interface Club {
  public_id: string;
  name: string;
  slug: string;
  short_description?: string | null;
  /** detail only */
  description?: string | null;
  logo: string | null;
  banner: string | null;
  status: string;
  visibility: string;
  followers_count: number;
  members_count: number;
  category?: ClubCategory | string | null;
  owner?: { public_id?: string; full_name?: string; name?: string } | string | null;
  /** detail only — per-student flags */
  is_following?: boolean;
  is_member?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ClubsParams {
  search?: string;
  category?: string;
  page?: number;
  page_size?: number;
}

/** Category can come back as a string or a nested object — normalize for the UI. */
export function clubCategoryName(cat: Club["category"]): string | null {
  if (!cat) return null;
  if (typeof cat === "string") return cat;
  return cat.name || null;
}

// ── List ────────────────────────────────────────────────────────────────────

export const useClubs = (params: ClubsParams = {}) => {
  const { status } = useSession();

  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.category) qs.set("category", params.category);
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));

  const queryString = qs.toString();
  const url = queryString
    ? `${API_CONFIG.endpoints.clubs.list}?${queryString}`
    : API_CONFIG.endpoints.clubs.list;

  return useQuery<Club[]>({
    queryKey: ["clubs", params],
    queryFn: async () => {
      const { data } = await axiosInstance.get(url);
      if (Array.isArray(data)) return data;
      if (data?.results && Array.isArray(data.results)) return data.results;
      return [];
    },
    enabled: status === "authenticated",
    staleTime: 1000 * 60 * 2,
  });
};

// ── Detail ──────────────────────────────────────────────────────────────────

export const useClub = (id: string | undefined) => {
  const { status } = useSession();
  return useQuery<Club>({
    queryKey: ["club", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(API_CONFIG.endpoints.clubs.detail(id!));
      return data;
    },
    enabled: status === "authenticated" && !!id,
    staleTime: 1000 * 60,
  });
};

// ── My followed clubs ───────────────────────────────────────────────────────

export const useMyFollowedClubs = () => {
  const { status } = useSession();
  return useQuery<Club[]>({
    queryKey: ["my-followed-clubs"],
    queryFn: async () => {
      const { data } = await axiosInstance.get(API_CONFIG.endpoints.clubs.myFollowed);
      if (Array.isArray(data)) return data;
      if (data?.results && Array.isArray(data.results)) return data.results;
      return [];
    },
    enabled: status === "authenticated",
    staleTime: 1000 * 60 * 2,
  });
};

// ── Follow / unfollow ───────────────────────────────────────────────────────

export const useFollowClub = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.post(API_CONFIG.endpoints.clubs.follow(id));
      return data as { detail: string; followers_count: number };
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["club", id] });
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
      queryClient.invalidateQueries({ queryKey: ["my-followed-clubs"] });
    },
  });
};

export const useUnfollowClub = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.post(API_CONFIG.endpoints.clubs.unfollow(id));
      return data as { detail: string; followers_count: number };
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["club", id] });
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
      queryClient.invalidateQueries({ queryKey: ["my-followed-clubs"] });
    },
  });
};

// ── Club leadership / management ────────────────────────────────────────────

export interface ManagedClub extends Club {
  my_role_code: string | null;
  my_role_name: string | null;
  my_permissions: string[]; // ["*"] means OWNER (all)
}

export interface ClubMember {
  public_id: string;
  student_public_id: string;
  student_name: string;
  role_public_id: string;
  role_name: string;
  role_code: string;
  status: string;
  joined_at: string;
}

export interface ClubRole {
  public_id: string;
  name: string;
  code: string;
  description?: string;
  is_system: boolean;
  permissions: string[];
}

export interface ClubFollowerItem {
  public_id: string;
  student_public_id: string;
  student_name: string;
  status: string;
  followed_at: string;
}

/** OWNER (['*']) has every permission; otherwise check the explicit key. */
export function hasClubPerm(permissions: string[] | undefined, key: string): boolean {
  if (!permissions) return false;
  return permissions.includes("*") || permissions.includes(key);
}

export const useManagedClubs = () => {
  const { status } = useSession();
  return useQuery<ManagedClub[]>({
    queryKey: ["managed-clubs"],
    queryFn: async () => {
      const { data } = await axiosInstance.get(API_CONFIG.endpoints.clubs.managed);
      if (Array.isArray(data)) return data;
      if (data?.results && Array.isArray(data.results)) return data.results;
      return [];
    },
    enabled: status === "authenticated",
    staleTime: 1000 * 60 * 2,
  });
};

export const useManagedClub = (id: string | undefined) => {
  const managed = useManagedClubs();
  return {
    ...managed,
    data: managed.data?.find((c) => c.public_id === id),
  };
};

export const useClubMembers = (id: string | undefined, enabled = true) => {
  const { status } = useSession();
  return useQuery<ClubMember[]>({
    queryKey: ["club-members", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(API_CONFIG.endpoints.clubs.members(id!));
      if (Array.isArray(data)) return data;
      if (data?.results && Array.isArray(data.results)) return data.results;
      return [];
    },
    enabled: status === "authenticated" && !!id && enabled,
    staleTime: 1000 * 30,
  });
};

export const useClubFollowers = (id: string | undefined, enabled = true) => {
  const { status } = useSession();
  return useQuery<ClubFollowerItem[]>({
    queryKey: ["club-followers", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(API_CONFIG.endpoints.clubs.followers(id!));
      if (Array.isArray(data)) return data;
      if (data?.results && Array.isArray(data.results)) return data.results;
      return [];
    },
    enabled: status === "authenticated" && !!id && enabled,
    staleTime: 1000 * 30,
  });
};

export const useClubRoles = (id: string | undefined, enabled = true) => {
  const { status } = useSession();
  return useQuery<ClubRole[]>({
    queryKey: ["club-roles", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(API_CONFIG.endpoints.clubs.roles(id!));
      if (Array.isArray(data)) return data;
      if (data?.results && Array.isArray(data.results)) return data.results;
      return [];
    },
    enabled: status === "authenticated" && !!id && enabled,
    staleTime: 1000 * 60,
  });
};

export const useAddClubMember = (clubId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentPublicId, roleId }: { studentPublicId: string; roleId: string }) => {
      const { data } = await axiosInstance.post(API_CONFIG.endpoints.clubs.members(clubId), {
        student_id: studentPublicId,
        club_role_id: roleId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club-members", clubId] });
      queryClient.invalidateQueries({ queryKey: ["club-followers", clubId] });
      queryClient.invalidateQueries({ queryKey: ["managed-clubs"] });
    },
  });
};

export const useRemoveClubMember = (clubId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (studentPublicId: string) => {
      const { data } = await axiosInstance.delete(API_CONFIG.endpoints.clubs.memberRemove(clubId, studentPublicId));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club-members", clubId] });
      queryClient.invalidateQueries({ queryKey: ["managed-clubs"] });
    },
  });
};

export const useAssignMemberRole = (clubId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentPublicId, roleId }: { studentPublicId: string; roleId: string }) => {
      const { data } = await axiosInstance.patch(
        API_CONFIG.endpoints.clubs.memberRole(clubId, studentPublicId),
        { club_role_id: roleId },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club-members", clubId] });
    },
  });
};
