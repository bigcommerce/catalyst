import { Streamable } from '@/vibes/soul/lib/streamable';
import { headers } from 'next/headers';
import { getVisitIdCookie, getVisitorIdCookie } from '.';
import { sendProductViewedEvent } from './data-events';

export async function sendProductViewedAnalyticsEvent(
  streamableProduct: Streamable<{ entityId: number; path: string }>,
): Promise<void> {
  const visitId = await getVisitIdCookie();
  const visitorId = await getVisitorIdCookie();

  if (visitId && visitorId) {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') ?? '';
    const refererUrl = headersList.get('referer') ?? '';
    const protocol = headersList.get('x-forwarded-proto') || 'https';
    const host = headersList.get('host') || '';

    const product = await streamableProduct;

    const path = product.path.startsWith('/') ? product.path : `/${product.path}`;
    const url = `${protocol}://${host}${path}`;

    await sendProductViewedEvent({
      productId: product.entityId,
      initiator: { visitId, visitorId },
      request: {
        url,
        userAgent,
        refererUrl
      },
    });
  }
}
