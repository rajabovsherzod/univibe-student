import { type Metadata } from "next";

interface ConstructMetadataProps {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
}

export function constructMetadata({
  title = "Univibe Student",
  description = "Universitetdagi barcha voqealar, reyting, do'kon va boshqalar — bitta platformada.",
  image = "/og-image.png",
  icons = "/icon.svg",
  noIndex = false,
}: ConstructMetadataProps = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    icons,
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL?.replace("https://", "")}`
        : "http://localhost:3000"
    ),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
