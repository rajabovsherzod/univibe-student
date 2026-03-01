import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { API_CONFIG } from "@/lib/api/config";
import axiosInstance from "@/lib/axios";

// ── Types ──────────────────────────────────────────────────────────────────

export interface StudentBalance {
  student_name: string;
  student_public_id: string;
  university_name: string;
  total_balance: number;
  last_transaction_at: string | null;
  last_updated_at: string;
}

export interface CoinTransaction {
  transaction_public_id: string;
  staff_member_name: string | null;
  staff_member_public_id: string | null;
  coin_rule_name: string | null;
  coin_rule_public_id: string | null;
  transaction_type: "ISSUANCE" | string;
  amount: number;
  comment: string | null;
  created_at: string;
}

export interface TransactionListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CoinTransaction[];
}

export interface TransactionParams {
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

// ── Hooks ──────────────────────────────────────────────────────────────────

/** Fetch the student's current coin balance */
export function useBalance() {
  const { status } = useSession();
  return useQuery<StudentBalance>({
    queryKey: ["student-balance"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<StudentBalance>(
        API_CONFIG.endpoints.coins.balance
      );
      return data;
    },
    enabled: status === "authenticated",
    staleTime: 1000 * 60 * 2,
  });
}

/** Fetch the student's transaction history with optional date filtering */
export function useTransactions(params: TransactionParams = {}) {
  const { status } = useSession();
  return useQuery<TransactionListResponse>({
    queryKey: ["student-transactions", params],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (params.date_from) sp.set("date_from", params.date_from);
      if (params.date_to) sp.set("date_to", params.date_to);
      if (params.page) sp.set("page", String(params.page));
      if (params.page_size) sp.set("page_size", String(params.page_size));
      const qs = sp.toString();
      const { data } = await axiosInstance.get<TransactionListResponse>(
        `${API_CONFIG.endpoints.coins.transactions}${qs ? `?${qs}` : ""}`
      );
      return data;
    },
    enabled: status === "authenticated",
    staleTime: 1000 * 60 * 2,
  });
}
