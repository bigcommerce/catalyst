'use client';

import { useB2BAuth } from './use-b2b-auth';
import { useB2BCart } from './use-b2b-cart';

interface Props {
  token?: string;
  cartId?: string | null;
}

export function B2BClientEffects({ cartId, token }: Props) {
  useB2BAuth(token);
  useB2BCart(cartId);

  return null;
}
