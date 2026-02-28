import { constructMetadata } from "@/lib/utils/seo";

export const metadata = constructMetadata({
  title: "Tadbirlar",
  description: "Universitetdagi barcha tadbirlar va ishtirok etish imkoniyatlari.",
});

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
