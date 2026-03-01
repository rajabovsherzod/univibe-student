import { constructMetadata } from "@/lib/utils/seo";

export const metadata = constructMetadata({
  title: "Hamyon",
  description: "Ballar tarixi va tranzaksiyalar — to'plangan va sarflangan ballaringiz.",
});

export default function WalletLayout({ children }: { children: React.ReactNode }) {
  return children;
}
