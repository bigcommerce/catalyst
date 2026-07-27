'use client';

import { preconnect } from 'react-dom';

export function CheckoutPreconnect({ url }: { url: string }) {
  preconnect(url);

  return null;
}
