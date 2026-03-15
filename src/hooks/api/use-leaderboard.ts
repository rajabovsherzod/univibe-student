import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { API_CONFIG } from "@/lib/api/config";
import axiosInstance from "@/lib/axios";

// ── Types (matching real API response) ─────────────────────────────────

export interface LeaderboardItem {
  rank: number;
  student_public_id: string;
  full_name: string;
  profile_photo: string | null;
  faculty: string | null;
  year_level: string | null;
  total_coins: number;
}

export interface LeaderboardPagination {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface LeaderboardResponse {
  results: LeaderboardItem[];
  pagination: LeaderboardPagination;
  last_refreshed_at: string;
  scope: {
    period_type: string;
    period_year: number | null;
    faculty: string | null;
    year_level: string | null;
  };
}

export interface LeaderboardFilters {
  period_type?: "ALL_TIME" | "YEARLY";
  period_year?: number | string; // Allow both number and academic year string (e.g., "2024" or "2024-2025")
  faculty_public_id?: string;
  year_level_public_id?: string;
  page?: number;
  page_size?: number;
}

// ── Hook ───────────────────────────────────────────────────────────────

export const useLeaderboard = (filters: LeaderboardFilters = {}) => {
  const { status } = useSession();

  const params = new URLSearchParams();
  if (filters.period_type) params.set("period_type", filters.period_type);
  // Only send period_year if it exists and period_type is YEARLY
  if (filters.period_year && filters.period_type === 'YEARLY') {
    params.set("period_year", String(filters.period_year));
  }
  if (filters.faculty_public_id) params.set("faculty_public_id", filters.faculty_public_id);
  if (filters.year_level_public_id) params.set("year_level_public_id", filters.year_level_public_id);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));

  const queryString = params.toString();
  const url = queryString
    ? `${API_CONFIG.endpoints.leaderboard.list}?${queryString}`
    : API_CONFIG.endpoints.leaderboard.list;

  return useQuery<LeaderboardResponse>({
    queryKey: ["leaderboard", filters],
    queryFn: async () => {
      const { data } = await axiosInstance.get<LeaderboardResponse>(url);
      return data;
    },
    enabled: status === "authenticated",
    staleTime: 1000 * 60 * 2,
  });
};

// ── My Leaderboard Entry ───────────────────────────────────────────────

export interface MyLeaderboardEntry {
  rank: number | null;
  total_coins: number;
  student_public_id: string;
  full_name: string;
  profile_photo: string | null;
  faculty: string | null;
  year_level: string | null;
}

export const useMyLeaderboardEntry = (filters: LeaderboardFilters = {}) => {
  const { status } = useSession();

  const params = new URLSearchParams();
  if (filters.period_type) params.set("period_type", filters.period_type);
  // Only send period_year if it exists and period_type is YEARLY
  if (filters.period_year && filters.period_type === 'YEARLY') {
    params.set("period_year", String(filters.period_year));
  }
  if (filters.faculty_public_id) params.set("faculty_public_id", filters.faculty_public_id);
  if (filters.year_level_public_id) params.set("year_level_public_id", filters.year_level_public_id);

  const queryString = params.toString();
  const url = queryString
    ? `${API_CONFIG.endpoints.leaderboard.me}?${queryString}`
    : API_CONFIG.endpoints.leaderboard.me;

  return useQuery<MyLeaderboardEntry | null>({
    queryKey: ["leaderboard-me", filters],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get<MyLeaderboardEntry>(url);
        return data;
      } catch (err: any) {
        if (err?.response?.status === 404) return null;
        throw err;
      }
    },
    enabled: status === "authenticated",
    staleTime: 1000 * 60 * 2,
  });
};
