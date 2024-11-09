import { cookies } from 'next/headers';
import { ReactNode } from 'react';

import { getCart } from '~/client/queries/get-cart';
import { Link } from '~/components/link';

import { CartIcon } from './cart-icon';

export const CartLink = ({ children }: { children: ReactNode }) => (
  <Link
    aria-label="Cart"
    className="relative rounded-lg p-1.5 ring-primary focus-visible:outline-0 focus-visible:ring-2 @4xl:hover:bg-contrast-100"
    href="/cart"
  >
    {children}
  </Link>
);

export const Cart = async () => {
  const cartId = cookies().get('cartId')?.value;

  if (!cartId) {
    return (
      <CartLink>
        <CartIcon />
      </CartLink>
    );
  }

  const cart = await getCart(cartId);

  const count = cart?.lineItems.totalQuantity ?? 0;

  return (
    <CartLink>
      <CartIcon count={count} />
    </CartLink>
  );
};
