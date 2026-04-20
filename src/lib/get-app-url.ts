/**
 * Returns the logout redirect URL.
 * 
 * Uses NEXT_PUBLIC_APP_URL from environment variables to ensure
 * consistent redirects across all environments (dev, staging, production).
 * 
 * This is the professional approach because:
 * - Single source of truth for app URL
 * - Works correctly with proxies, tunnels, and load balancers
 * - Environment-specific configuration
 * - Prevents redirect issues when window.location.origin is incorrect
 */
export function getLogoutUrl(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  
  if (!appUrl) {
    console.warn('NEXT_PUBLIC_APP_URL not set, falling back to window.location.origin');
    return typeof window !== 'undefined' 
      ? `${window.location.origin}/login`
      : '/login';
  }
  
  return `${appUrl}/login`;
}
