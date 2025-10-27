/**
 * Hook to manage Vertex AI visitor ID in cookies
 * Reuses the existing visitor ID from BigCommerce analytics
 * Reads from client-accessible cookie (not HTTP-only)
 */

'use client';

import { useEffect, useState } from 'react';

import { getCookieValue } from '~/lib/client-cookies';

const VISITOR_COOKIE_NAME = 'catalyst.visitorId';

export function useVisitorId(): string | null {
  const [visitorId, setVisitorId] = useState<string | null>(null);

  useEffect(() => {
    // Read from client-accessible cookie
    const id = getCookieValue(VISITOR_COOKIE_NAME);
    if (id) {
      setVisitorId(id);
    }
  }, []);

  return visitorId;
}
