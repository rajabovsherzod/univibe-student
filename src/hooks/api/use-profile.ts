import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { API_CONFIG } from "@/lib/api/config";
import axiosInstance from "@/lib/axios";

// ── Types ──────────────────────────────────────────────────────────────────

export interface StudentMe {
  user_id: number;
  user_public_id: string;
  email: string;
  user_name: string;
  user_surname: string;
  university_id: number;
  university_name: string;
  university_public_id: string;
  role: string;
  is_active: boolean;
  is_banned: boolean;
  is_password_set: boolean;
  name: string;
  surname: string;
  middle_name: string | null;
  full_name: string;
  date_of_birth: string | null;       // "YYYY-MM-DD"
  university_student_id: string | null;
  faculty_name: string | null;
  faculty_public_id: string | null;
  degree_level_name: string | null;
  degree_level_public_id: string | null;
  year_level_name: string | null;
  year_level_public_id: string | null;
  profile_photo_url: string | null;
  contact_phone_number: string | null;
  status: "waited" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface Faculty {
  public_id: string;
  name: string;
}

export interface DegreeLevel {
  public_id: string;
  name: string;
}

export interface YearLevel {
  public_id: string;
  name: string;
  year_number: number;
}

// ── Hooks ──────────────────────────────────────────────────────────────────

export const useStudentMe = () => {
  const { status } = useSession();
  return useQuery({
    queryKey: ["student-me"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<StudentMe>(API_CONFIG.endpoints.student.me);
      return data;
    },
    enabled: status === "authenticated",
    staleTime: 1000 * 60 * 5, // 5 min
    retry: false, // don't retry — not_found users get 404, avoid cascade of requests
  });
};

export const useFaculties = (universityId?: string) => {
  return useQuery({
    queryKey: ["faculties", universityId],
    queryFn: async () => {
      const url = universityId
        ? `${API_CONFIG.endpoints.faculty.list}?university_id=${universityId}`
        : API_CONFIG.endpoints.faculty.list;
      const { data } = await axiosInstance.get<Faculty[]>(url);
      return data;
    },
  });
};

export const useDegreeLevels = (universityId?: string) => {
  return useQuery({
    queryKey: ["degree-levels", universityId],
    queryFn: async () => {
      const url = universityId
        ? `${API_CONFIG.endpoints.degreeLevel.list}?university_id=${universityId}`
        : API_CONFIG.endpoints.degreeLevel.list;
      const { data } = await axiosInstance.get<DegreeLevel[]>(url);
      return data;
    },
  });
};

export const useYearLevels = (universityId?: string) => {
  return useQuery({
    queryKey: ["year-levels", universityId],
    queryFn: async () => {
      const url = universityId
        ? `${API_CONFIG.endpoints.yearLevel.list}?university_id=${universityId}`
        : API_CONFIG.endpoints.yearLevel.list;
      const { data } = await axiosInstance.get<YearLevel[]>(url);
      return data;
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await axiosInstance.post(API_CONFIG.endpoints.student.profile, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-me"] });
    },
  });
};
