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
 * Proxy backend image URLs through /api/image route.
 * This solves all production issues:
 *   - Mixed content (http vs https)
 *   - Backend not directly accessible from browser
 *   - Any Django media URL format (absolute, relative, http, localhost)
 */
export function toHttps(url: string | null | undefined): string | undefined {
    if (!url) return undefined;
    return `/api/image?url=${encodeURIComponent(url)}`;
}
