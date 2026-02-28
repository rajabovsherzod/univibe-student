import { constructMetadata } from "@/lib/utils/seo";

export const metadata = constructMetadata({
  title: "Mening tadbirlarim",
  description: "Siz ishtirok etgan va ishtirok etadigan tadbirlar ro'yxati.",
});

export default function MyEventsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
