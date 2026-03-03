import { NextResponse } from "next/server";

const BACKEND = (process.env.NEXT_PUBLIC_API_URL || "https://test.univibe.uz").replace(/\/$/, "");

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/api/v1/university/`, {
      headers: { "User-Agent": "Univibe/1.0" },
      next: { revalidate: 60 }, // cache 60 seconds on server
    });

    if (!res.ok) {
      return new NextResponse("Failed to fetch universities", { status: res.status });
    }

    const data = await res.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch {
    return new NextResponse("Failed to fetch universities", { status: 502 });
  }
}
