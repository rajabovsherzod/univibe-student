import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_CONFIG } from "@/lib/api/config";
import axiosInstance from "@/lib/axios";

// ── Types ──────────────────────────────────────────────────────────────────

export interface OrderItem {
  product_public_id: string;
  product_name_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  line_total_snapshot: number;
}

export interface Order {
  public_id: string;
  student_name: string;
  student_public_id: string;
  status: "PENDING" | "FULFILLED" | "CANCELED" | "RETURNED";
  total_coins: number;
  item_count?: string;
  returned_reason?: string | null;
  processed_by_name?: string | null;
  processed_by_public_id?: string | null;
  items?: OrderItem[];
  created_at: string;
  updated_at?: string;
  fulfilled_at?: string | null;
  returned_at?: string | null;
}

export interface CreateOrderInput {
  items: { product_public_id: string; quantity: number }[];
}

// ── Hook ───────────────────────────────────────────────────────────────────

/** Place a redemption order. Coins are debited atomically. */
export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      const { data } = await axiosInstance.post<Order>(
        API_CONFIG.endpoints.market.orderCreate,
        input
      );
      return data;
    },
    onSuccess: () => {
      // Refresh balance after purchase
      queryClient.invalidateQueries({ queryKey: ["student-balance"] });
      queryClient.invalidateQueries({ queryKey: ["market-products"] });
      queryClient.invalidateQueries({ queryKey: ["market-orders"] });
      queryClient.invalidateQueries({ queryKey: ["student-transactions"] });
    },
  });
}
