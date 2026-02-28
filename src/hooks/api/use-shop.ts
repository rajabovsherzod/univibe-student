import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { API_CONFIG } from "@/lib/api/config";
import axiosInstance from "@/lib/axios";

// ── Types ──────────────────────────────────────────────────────────────────

export interface ShopProduct {
  public_id: string;
  name: string;
  description?: string;
  image: string | null;
  price_coins: number;
  stock_type: "UNLIMITED" | "LIMITED";
  stock_quantity: number | null;
  is_active: boolean;
  created_at: string;
}

export interface ShopProductListParams {
  search?: string;
  page?: number;
  page_size?: number;
}

// ── Hook ───────────────────────────────────────────────────────────────────

export const useShopProducts = (params: ShopProductListParams = {}) => {
  const { status } = useSession();

  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));

  const queryString = qs.toString();
  const url = queryString
    ? `${API_CONFIG.endpoints.market.products}?${queryString}`
    : API_CONFIG.endpoints.market.products;

  return useQuery<ShopProduct[]>({
    queryKey: ["shop-products", params],
    queryFn: async () => {
      const { data } = await axiosInstance.get(url);
      console.log("[Shop API Response]", data);
      // Handle both flat array and paginated {results: []} response
      if (Array.isArray(data)) return data;
      if (data?.results && Array.isArray(data.results)) return data.results;
      return [];
    },
    enabled: status === "authenticated",
    staleTime: 1000 * 60 * 2,
  });
};
