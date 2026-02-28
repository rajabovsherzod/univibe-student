import { constructMetadata } from "@/lib/utils/seo";

export const metadata = constructMetadata({
  title: "Do'kon",
  description: "Ballaringiz bilan mahsulotlarni xarid qiling — futbolkalar, kitoblar va boshqalar.",
});

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
