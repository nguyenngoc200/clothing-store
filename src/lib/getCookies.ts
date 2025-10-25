'use server';

import { cookies } from 'next/headers';

/**
 * Utility for server components to get cookies as string
 */
export async function getServerCookiesString(): Promise<string> {
  return (await cookies())
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');
}

/**
 * Universal cookie header builder
 * @param customCookies Optional custom cookies (for testing or manual override)
 */
export async function buildCookieHeader(cookieHeader?: string | null): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Include cookies when provided, regardless of environment
  if (cookieHeader !== undefined && cookieHeader !== null) {
    headers['Cookie'] = cookieHeader;
  }

  return headers;
}
