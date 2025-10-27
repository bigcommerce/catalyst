'use client';

import { useEffect, useRef } from 'react';

import { useVisitorId } from '~/hooks/use-visitor-id';
import { trackProductView } from '~/lib/vertex-ga4/events';

interface Props {
  productId: number;
}

/**
 * Client component to track product page views with GA4 (Vertex AI compatible)
 */
export function ProductVertexTracker({ productId }: Props) {
  const visitorId = useVisitorId();
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current || !visitorId) {
      return;
    }

    isMounted.current = true;

    trackProductView(visitorId, productId);
  }, [visitorId, productId]);

  return null;
}
