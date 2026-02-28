import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { API_CONFIG } from "@/lib/api/config";
import axiosInstance from "@/lib/axios";

// ── Types ──────────────────────────────────────────────────────────────────

export interface TelegramAccount {
  telegram_user_id: number;
  telegram_username: string;
  telegram_fullname: string;
  phone_number: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface TelegramConnectLink {
  connect_link: string;
  expires_at: string;
}

// ── Hooks ──────────────────────────────────────────────────────────────────

/** Check if user has a linked Telegram account */
export const useTelegramAccount = () => {
  const { status } = useSession();
  return useQuery<TelegramAccount | null>({
    queryKey: ["telegram-account"],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get<TelegramAccount>(
          API_CONFIG.endpoints.telegram.account
        );
        return data;
      } catch (err: any) {
        if (err?.response?.status === 404) return null;
        throw err;
      }
    },
    enabled: status === "authenticated",
    staleTime: 1000 * 60 * 5,
  });
};

/** Generate a deep link to connect Telegram */
export const useTelegramConnectLink = (enabled = false) => {
  const { status } = useSession();
  return useQuery<TelegramConnectLink>({
    queryKey: ["telegram-connect-link"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<TelegramConnectLink>(
        API_CONFIG.endpoints.telegram.connectLink
      );
      return data;
    },
    enabled: enabled && status === "authenticated",
    staleTime: 1000 * 60 * 10,
  });
};

/** Disconnect (unlink) Telegram account */
export const useDisconnectTelegram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await axiosInstance.delete(API_CONFIG.endpoints.telegram.account);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["telegram-account"] });
    },
  });
};
