import { constructMetadata } from "@/lib/utils/seo";

export const metadata = constructMetadata({
  title: "Bildirishnomalar",
  description: "Barcha bildirishnomalar va yangiliklar — tadbirlar, ballar va boshqalar.",
});

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
