import { useQuery } from "@tanstack/react-query";

export interface University {
  public_id: string;
  name: string;
  logo: string | null;
}

export const useUniversities = () => {
  return useQuery({
    queryKey: ["universities"],
    queryFn: async () => {
      // Use local Next.js proxy to avoid CORS issues in production.
      // Server-side fetch (no browser CORS restrictions) + 60s cache.
      const res = await fetch("/api/universities");
      if (!res.ok) throw new Error("Universities fetch failed");
      return res.json() as Promise<University[]>;
    },
    staleTime: 5 * 60 * 1000,
  });
};
