import type { createClient } from '@bigcommerce/catalyst-client';

type Client = ReturnType<typeof createClient>;

export interface SitemapConfig {
  /**
   * BigCommerce client instance configured with store hash, storefront token, etc.
   */
  client: Client;
  
  /**
   * Function to get the channel ID, either from configuration or from locale/request context
   */
  getChannelId: (request: Request) => Promise<string> | string;
  
  /**
   * Optional hostname override. If not provided, will use the host from the request headers
   */
  hostname?: string;
  
  /**
   * Optional protocol override. If not provided, will detect from request headers
   */
  protocol?: 'http' | 'https';
}

/**
 * Creates a sitemap route handler for Next.js App Router
 * @param config Configuration for the sitemap handler
 * @returns Next.js route handler function
 */
export function createSitemapHandler(config: SitemapConfig) {
  return async function GET(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const incomingHost = config.hostname ?? request.headers.get('host') ?? url.host;
    const incomingProto = config.protocol ?? 
      request.headers.get('x-forwarded-proto') ?? 
      url.protocol.replace(':', '');

    const type = url.searchParams.get('type');
    const page = url.searchParams.get('page');

    // Get channel ID for this request
    const channelId = await config.getChannelId(request);

    // If a specific sitemap within the index is requested, require both params
    if (type !== null || page !== null) {
      if (!type || !page) {
        return new Response('Both "type" and "page" query params are required', {
          status: 400,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }

      const upstream = await config.client.fetchSitemapResponse(
        { type, page },
        channelId,
      );

      // Pass-through upstream status/body but enforce XML content-type
      const body = await upstream.text();

      return new Response(body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: { 'Content-Type': 'application/xml' },
      });
    }

    // Otherwise, return the sitemap index with normalized internal links
    const sitemapIndex = await config.client.fetchSitemapIndex(channelId);

    const rewritten = sitemapIndex.replace(
      /<loc>([^<]+)<\/loc>/g,
      (match: string, locUrlStr: string) => {
        try {
          // Decode XML entities for '&' so URL parsing works
          const decoded: string = locUrlStr.replace(/&amp;/g, '&');
          const original = new URL(decoded);

          if (!original.pathname.endsWith('/xmlsitemap.php')) {
            return match;
          }

          const normalized = new URL(`${incomingProto}://${incomingHost}/sitemap.xml`);

          const t = original.searchParams.get('type');
          const p = original.searchParams.get('page');

          // Only rewrite entries that include both type and page; otherwise leave untouched
          if (!t || !p) {
            return match;
          }

          normalized.searchParams.set('type', t);
          normalized.searchParams.set('page', p);

          // Re-encode '&' for XML output
          const normalizedXml: string = normalized.toString().replace(/&/g, '&amp;');

          return `<loc>${normalizedXml}</loc>`;
        } catch {
          return match;
        }
      },
    );

    return new Response(rewritten, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  };
}