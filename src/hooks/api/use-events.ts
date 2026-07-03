import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { API_CONFIG } from "@/lib/api/config";
import axiosInstance from "@/lib/axios";

// ── Types (match the backend EventSerializer) ───────────────────────────────

export interface EventCollaborator {
  club_public_id?: string;
  club_name?: string;
  staff_public_id?: string;
  staff_name?: string;
}

export interface StudentEvent {
  public_id: string;
  title: string;
  slug: string;
  description: string;
  banner: string | null;
  location: string;
  start_time: string; // ISO
  end_time: string; // ISO
  registration_start: string | null;
  registration_end: string | null;
  participant_limit: number | null;
  coin_reward: number;
  status: string; // "published" | ...
  organizer_club_name: string | null;
  organizer_staff_name: string | null;
  registered_count: number;
  collaborators?: EventCollaborator[];
  can_manage?: boolean;
  /** whether the current student registered/attended */
  is_registered?: boolean;
  /** the current student's own registration status */
  registration_status?: "REGISTERED" | "ATTENDED" | "CANCELLED" | "MISSED" | null;
  created_at: string;
}

export interface EventsParams {
  search?: string;
  page?: number;
  page_size?: number;
}

// ── List ────────────────────────────────────────────────────────────────────

export const useEvents = (params: EventsParams = {}) => {
  const { status } = useSession();

  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));

  const queryString = qs.toString();
  const url = queryString
    ? `${API_CONFIG.endpoints.events.list}?${queryString}`
    : API_CONFIG.endpoints.events.list;

  return useQuery<StudentEvent[]>({
    queryKey: ["events", params],
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

export const useEvent = (id: string | undefined) => {
  const { status } = useSession();

  return useQuery<StudentEvent>({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(API_CONFIG.endpoints.events.detail(id!));
      return data;
    },
    enabled: status === "authenticated" && !!id,
    staleTime: 1000 * 60,
  });
};

// ── Register / cancel ───────────────────────────────────────────────────────

export const useRegisterEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.post(API_CONFIG.endpoints.events.register(id));
      return data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

export const useCancelEventRegistration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.post(API_CONFIG.endpoints.events.cancelRegistration(id));
      return data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

// ── QR attendance ───────────────────────────────────────────────────────────

export interface MyEventQr {
  qr_data: string;
  event_public_id: string;
  status: string;
}

export const useMyEventQr = (id: string | undefined, enabled: boolean) => {
  const { status } = useSession();
  return useQuery<MyEventQr>({
    queryKey: ["event-qr", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(API_CONFIG.endpoints.events.myQr(id!));
      return data;
    },
    enabled: status === "authenticated" && !!id && enabled,
    staleTime: 1000 * 30,
  });
};

export const useConfirmAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, token }: { id: string; token: string }) => {
      const { data } = await axiosInstance.post(API_CONFIG.endpoints.events.confirmAttendance(id), { token });
      // NOTE: the backend returns `coins_awarded` as a BOOLEAN (whether coins
      // were issued on this REGISTERED→ATTENDED transition), not the amount.
      return data as { detail: string; coins_awarded?: boolean; status?: string };
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      // Also refresh the list queries so My Events / Events cards flip to "attended".
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
};
