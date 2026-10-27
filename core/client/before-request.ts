// next/headers and next-intl/server are imported dynamically; see the note in `./index.ts`.

const getLocale = async () => {
  try {
    const { getLocale: getServerLocale } = await import('next-intl/server');

    return await getServerLocale();
  } catch {
    /**
     * Next-intl `getLocale` only works on the server, and when the proxy has run.
     *
     * Instances when `getLocale` will not work:
     * - Requests during next.config.ts resolution
     * - Requests in proxies
     * - Requests in `generateStaticParams`
     * - Request in api routes
     * - Requests in static sites without `setRequestLocale`
     */
  }
};

export const beforeRequest = async (fetchOptions?: RequestInit) => {
  // We can't serialize a `Headers` object within this method so we have to opt into using a plain object
  const requestHeaders: Record<string, string> = {};
  const locale = await getLocale();

  if (fetchOptions?.cache && ['no-store', 'no-cache'].includes(fetchOptions.cache)) {
    const { headers } = await import('next/headers');
    const ipAddress = (await headers()).get('X-Forwarded-For');

    if (ipAddress) {
      requestHeaders['X-Forwarded-For'] = ipAddress;
      requestHeaders['True-Client-IP'] = ipAddress;
    }

    // Only sent on uncacheable requests. The correlation ID is unique per request, and Next.js
    // includes request headers in the Data Cache key, so sending it alongside
    // `next: { revalidate }` makes every lookup miss and write a fresh entry.
    const { getCorrelationId } = await import('./correlation-id');

    requestHeaders['X-Correlation-ID'] = getCorrelationId();
  }

  if (locale) {
    requestHeaders['Accept-Language'] = locale;
  }

  return {
    headers: requestHeaders,
  };
};
