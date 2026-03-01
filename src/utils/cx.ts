import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
    extend: {
        theme: {
            text: ["display-xs", "display-sm", "display-md", "display-lg", "display-xl", "display-2xl"],
        },
    },
});

/**
 * This function is a wrapper around the twMerge function.
 * It is used to merge the classes inside style objects.
 */
export const cx = twMerge;

/**
 * This function does nothing besides helping us to be able to
 * sort the classes inside style objects which is not supported
 * by the Tailwind IntelliSense by default.
 */
export function sortCx<T extends Record<string, string | number | Record<string, string | number | Record<string, string | number>>>>(classes: T): T {
    return classes;
}

/**
 * Normalize backend image URLs for production (Vercel HTTPS).
 * Handles all Django media URL formats:
 *   - "https://..."            → keep as-is
 *   - "http://public-host/..." → upgrade to https://
 *   - "http://localhost:.../..." → replace with API_BASE + path
 *   - "/media/..."             → prepend API_BASE
 */
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://test.univibe.uz").replace(/\/$/, "");

export function toHttps(url: string | null | undefined): string | undefined {
    if (!url) return undefined;
    if (url.startsWith("https://")) return url;
    if (url.startsWith("/")) return `${API_BASE}${url}`;
    if (url.startsWith("http://")) {
        try {
            const { hostname, pathname, search } = new URL(url);
            const isInternal =
                hostname === "localhost" ||
                /^127\./.test(hostname) ||
                /^10\./.test(hostname) ||
                /^192\.168\./.test(hostname) ||
                /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);
            if (isInternal) return `${API_BASE}${pathname}${search}`;
        } catch { /* fall through */ }
        return "https://" + url.slice(7);
    }
    return url;
}
