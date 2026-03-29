import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import type { BannersResponse } from "@/types/banners";

/**
 * useBanners - Fetch dashboard banners for authenticated users
 * 
 * This hook calls GET /api/v1/banners/dashboard/ which returns
 * only currently visible banners based on:
 * - status = PUBLISHED
 * - is_active = true
 * - within start_at/end_at schedule
 * - user's university (for UNIVERSITY scope banners)
 * 
 * @param page - Page number (default: 1)
 * @param pageSize - Items per page (default: 10, max: 50)
 * @returns Query result with banners data
 */
export function useBanners(page = 1, pageSize = 10) {
  return useQuery<BannersResponse>({
    queryKey: ['banners-dashboard', page, pageSize],
    queryFn: async () => {
      const { data } = await axiosInstance.get<BannersResponse>(
        `/api/v1/banners/dashboard/?page=${page}&page_size=${pageSize}`
      );
      return data;
    },
    enabled: true, // Always enabled for authenticated users
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 30 * 60 * 1000,   // 30 minutes garbage collection
  });
}
