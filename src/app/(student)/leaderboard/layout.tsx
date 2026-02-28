import { constructMetadata } from "@/lib/utils/seo";

export const metadata = constructMetadata({
  title: "Reyting",
  description: "Eng faol talabalar reytingi — ballar bo'yicha o'z o'rningizni bilib oling.",
});

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
