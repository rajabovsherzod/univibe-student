import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { API_CONFIG } from '@/lib/api/config';

/**
 * Fetch banners on server-side for SSR
 */
export async function getDashboardBanners() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return [];
    }

    const response = await fetch(`${API_CONFIG.baseURL}/api/v1/banners/dashboard/`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Accept-Language': 'uz',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching dashboard banners:', error);
    return [];
  }
}
