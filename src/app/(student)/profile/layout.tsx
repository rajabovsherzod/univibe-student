import { constructMetadata } from "@/lib/utils/seo";

export const metadata = constructMetadata({
  title: "Profil",
  description: "Shaxsiy ma'lumotlaringiz, Telegram bog'lanishi va sozlamalar.",
});

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
