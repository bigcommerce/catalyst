/**
 * Built-in BigCommerce analytics functionality
 * Self-contained with no external dependencies except the GraphQL client
 */

const PRODUCT_VIEWED_MUTATION = `
  mutation ProductViewed($input: ProductViewedEventInput!) {
    analytics {
      productViewedEvent(input: $input) {
        executed
      }
    }
  }
`;

const VISITOR_COOKIE_NAME = 'catalyst.visitorId';
const VISIT_COOKIE_NAME = 'catalyst.visitId';

interface ProductViewedEventInput {
  productId: number;
  initiator: {
    visitId: string;
    visitorId: string;
  };
  request: {
    url: string;
    refererUrl: string;
    userAgent: string;
  };
}

/**
 * Get visitor ID from cookies (server-side compatible)
 */
async function getVisitorIdCookie(request: any): Promise<string | undefined> {
  try {
    // Try to get from Next.js cookies() if available (server-side)
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return cookieStore.get(VISITOR_COOKIE_NAME)?.value;
  } catch {
    // Fallback: parse from request headers
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`${VISITOR_COOKIE_NAME}=([^;]+)`));
    return match?.[1];
  }
}

/**
 * Get visit ID from cookies (server-side compatible)
 */
async function getVisitIdCookie(request: any): Promise<string | undefined> {
  try {
    // Try to get from Next.js cookies() if available (server-side)
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return cookieStore.get(VISIT_COOKIE_NAME)?.value;
  } catch {
    // Fallback: parse from request headers
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`${VISIT_COOKIE_NAME}=([^;]+)`));
    return match?.[1];
  }
}

/**
 * Record product visit analytics event
 */
export async function recordProductVisit(
  client: any,
  request: any,
  productId: number
): Promise<void> {
  try {
    const visitId = await getVisitIdCookie(request);
    const visitorId = await getVisitorIdCookie(request);

    if (!visitId || !visitorId) {
      // No analytics cookies available, skip tracking
      return;
    }

    const input: ProductViewedEventInput = {
      productId,
      initiator: { visitId, visitorId },
      request: {
        url: request.url,
        refererUrl: request.headers.get('referer') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    };

    await client.fetch({
      document: PRODUCT_VIEWED_MUTATION,
      variables: { input },
    });
  } catch (error) {
    // Analytics errors should not break the middleware
    console.warn('[Catalyst Routes] Analytics error:', error);
  }
}