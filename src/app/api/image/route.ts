import { type NextRequest, NextResponse } from "next/server";

const BACKEND = (process.env.NEXT_PUBLIC_API_URL || "https://test.univibe.uz").replace(/\/$/, "");

// Root domain from BACKEND, e.g. "test.univibe.uz" → "univibe.uz"
const ROOT_DOMAIN = new URL(BACKEND).hostname.split(".").slice(-2).join(".");

// Allow the backend host itself + any subdomain (minio.univibe.uz, cdn.univibe.uz, etc.)
function isAllowed(hostname: string): boolean {
  return hostname === ROOT_DOMAIN || hostname.endsWith(`.${ROOT_DOMAIN}`);
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");

  if (!raw) return new NextResponse("Missing url", { status: 400 });

  let target: string;
  if (raw.startsWith("/")) {
    target = `${BACKEND}${raw}`;
  } else {
    try {
      const parsed = new URL(raw);
      if (!isAllowed(parsed.hostname)) {
        return new NextResponse(`Forbidden: ${parsed.hostname}`, { status: 403 });
      }
      parsed.protocol = "https:";
      target = parsed.toString();
    } catch {
      return new NextResponse("Invalid url", { status: 400 });
    }
  }

  try {
    const upstream = await fetch(target, { headers: { "User-Agent": "Univibe/1.0" } });

    if (!upstream.ok) {
      return new NextResponse(`Upstream ${upstream.status}`, { status: upstream.status });
    }

    const blob = await upstream.arrayBuffer();
    const ct = upstream.headers.get("content-type") || "image/jpeg";

    return new NextResponse(blob, {
      headers: {
        "Content-Type": ct,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "X-Proxy-Target": target,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new NextResponse(`Fetch failed: ${msg}`, { status: 502 });
  }
}
