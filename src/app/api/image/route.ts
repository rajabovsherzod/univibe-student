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

  console.log("[image-proxy] BACKEND:", BACKEND, "| ROOT_DOMAIN:", ROOT_DOMAIN);
  console.log("[image-proxy] raw:", raw);

  if (!raw) return new NextResponse("Missing url", { status: 400 });

  let target: string;
  if (raw.startsWith("/")) {
    target = `${BACKEND}${raw}`;
  } else {
    try {
      const parsed = new URL(raw);
      console.log("[image-proxy] hostname:", parsed.hostname, "| allowed:", isAllowed(parsed.hostname));
      if (!isAllowed(parsed.hostname)) {
        console.log("[image-proxy] BLOCKED:", parsed.hostname);
        return new NextResponse(`Forbidden: ${parsed.hostname}`, { status: 403 });
      }
      parsed.protocol = "https:";
      target = parsed.toString();
    } catch (e) {
      console.log("[image-proxy] invalid url:", raw, e);
      return new NextResponse("Invalid url", { status: 400 });
    }
  }

  try {
    console.log("[image-proxy] fetching:", target);
    const upstream = await fetch(target, { headers: { "User-Agent": "Univibe/1.0" } });
    console.log("[image-proxy] status:", upstream.status, "| ct:", upstream.headers.get("content-type"));

    if (!upstream.ok) {
      const body = await upstream.text().catch(() => "");
      console.log("[image-proxy] upstream error:", upstream.status, body.slice(0, 200));
      return new NextResponse(`Upstream ${upstream.status}`, { status: upstream.status });
    }

    const blob = await upstream.arrayBuffer();
    const ct = upstream.headers.get("content-type") || "image/jpeg";
    console.log("[image-proxy] OK bytes:", blob.byteLength);

    return new NextResponse(blob, {
      headers: {
        "Content-Type": ct,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "X-Proxy-Target": target,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[image-proxy] EXCEPTION:", msg);
    return new NextResponse(`Fetch failed: ${msg}`, { status: 502 });
  }
}
