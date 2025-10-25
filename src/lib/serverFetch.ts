import { buildCookieHeader } from '@/lib/getCookies';

export const serverFetch = async (cookieHeader: string | undefined): Promise<{ headers: HeadersInit } | undefined> => {
  try {
    let headers: HeadersInit = {};

    // Server-side handling
    if (cookieHeader && typeof window === 'undefined') {
      headers = await buildCookieHeader(cookieHeader);
    }

    return {
      headers,
    };
  } catch (error) {
    console.error('error', error);
  }
};
