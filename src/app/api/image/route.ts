import { type NextRequest, NextResponse } from "next/server";

const BACKEND = (process.env.NEXT_PUBLIC_API_URL || "https://test.univibe.uz").replace(/\/$/, "");

// Allow any subdomain of the backend host too
function isAllowed(hostname: string): boolean {
  const base = new URL(BACKEND).hostname; // e.g. "test.univibe.uz"
  return hostname === base || hostname.endsWith(`.${base}`);
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");

  console.log("[image-proxy] ── START ──────────────────────────────────");
  console.log("[image-proxy] BACKEND:", BACKEND);
  console.log("[image-proxy] raw url param:", raw);

  if (!raw) {
    console.log("[image-proxy] ERROR: missing url param");
    return new NextResponse("Missing url", { status: 400 });
  }

  // Build absolute target URL
  let target: string;
  if (raw.startsWith("/")) {
    target = `${BACKEND}${raw}`;
    console.log("[image-proxy] relative path → target:", target);
  } else {
    try {
      const parsed = new URL(raw);
      console.log("[image-proxy] parsed hostname:", parsed.hostname);

      if (!isAllowed(parsed.hostname)) {
        console.log("[image-proxy] ERROR: hostname not allowed:", parsed.hostname, "| expected:", new URL(BACKEND).hostname);
        return new NextResponse(`Forbidden: ${parsed.hostname} not in allowed list`, { status: 403 });
      }
      parsed.protocol = "https:";
      target = parsed.toString();
      console.log("[image-proxy] absolute url → target:", target);
    } catch (e) {
      console.log("[image-proxy] ERROR: invalid url:", raw, e);
      return new NextResponse("Invalid url", { status: 400 });
    }
  }

  try {
    console.log("[image-proxy] fetching:", target);
    const upstream = await fetch(target, {
      headers: { "User-Agent": "Univibe/1.0" },
    });

    console.log("[image-proxy] upstream status:", upstream.status, upstream.statusText);
    console.log("[image-proxy] upstream content-type:", upstream.headers.get("content-type"));

    if (!upstream.ok) {
      const body = await upstream.text().catch(() => "");
      console.log("[image-proxy] ERROR: upstream not ok:", upstream.status, body.slice(0, 200));
      return new NextResponse(`Upstream ${upstream.status}: ${upstream.statusText}`, {
        status: upstream.status,
      });
    }

    const blob = await upstream.arrayBuffer();
    const ct = upstream.headers.get("content-type") || "image/jpeg";

    console.log("[image-proxy] SUCCESS: bytes:", blob.byteLength, "content-type:", ct);

    return new NextResponse(blob, {
      headers: {
        "Content-Type": ct,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "X-Proxy-Target": target, // visible in browser devtools response headers
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[image-proxy] FETCH EXCEPTION:", msg);
    return new NextResponse(`Fetch failed: ${msg}`, { status: 502 });
  }
}
