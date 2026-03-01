import { type NextRequest, NextResponse } from "next/server";

const BACKEND = (process.env.NEXT_PUBLIC_API_URL || "https://test.univibe.uz").replace(/\/$/, "");
const ALLOWED_HOSTNAME = new URL(BACKEND).hostname;

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");
  if (!raw) return new NextResponse("Missing url", { status: 400 });

  // Build absolute target URL
  let target: string;
  if (raw.startsWith("/")) {
    target = `${BACKEND}${raw}`;
  } else {
    try {
      const parsed = new URL(raw);
      // Security: only proxy from our own backend
      if (parsed.hostname !== ALLOWED_HOSTNAME) {
        return new NextResponse("Forbidden", { status: 403 });
      }
      parsed.protocol = "https:";
      target = parsed.toString();
    } catch {
      return new NextResponse("Invalid url", { status: 400 });
    }
  }

  try {
    const upstream = await fetch(target, {
      headers: { "User-Agent": "Univibe/1.0" },
    });
    if (!upstream.ok) {
      return new NextResponse("Not found", { status: upstream.status });
    }
    const blob = await upstream.arrayBuffer();
    const ct = upstream.headers.get("content-type") || "image/jpeg";
    return new NextResponse(blob, {
      headers: {
        "Content-Type": ct,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    console.error("[image-proxy] fetch error:", err);
    return new NextResponse("Upstream error", { status: 502 });
  }
}
