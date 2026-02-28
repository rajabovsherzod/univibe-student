import { useQuery } from "@tanstack/react-query";
import { API_CONFIG } from "@/lib/api/config";
import axiosInstance from "@/lib/axios";

export interface University {
  public_id: string;
  name: string;
  logo: string | null;
}

export const useUniversities = () => {
  return useQuery({
    queryKey: ["universities"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<University[]>(API_CONFIG.endpoints.university.list);
      return data;
    },
  });
};
