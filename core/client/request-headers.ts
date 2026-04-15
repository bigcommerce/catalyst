import { headers } from 'next/headers';

export async function getRequestHeaders(): Promise<Record<string, string>> {
  const reqHeaders: Record<string, string> = {};

  try {
    const ipAddress = (await headers()).get('X-Forwarded-For');

    if (ipAddress) {
      reqHeaders['X-Forwarded-For'] = ipAddress;
      reqHeaders['True-Client-IP'] = ipAddress;
    }
  } catch {
    // Not in a request context
  }

  return reqHeaders;
}
