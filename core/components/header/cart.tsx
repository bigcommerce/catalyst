import { ReactNode } from 'react';

import { getCartQuantity } from '~/client/queries/get-cart-quantity';
import { Link } from '~/components/link';
import { getCartId } from '~/lib/cookies/cart';

import { CartIcon } from './cart-icon';

export const CartLink = ({ children }: { children: ReactNode }) => (
  <Link className="relative flex justify-between p-3 font-semibold" href="/cart">
    {children}
  </Link>
);

export const Cart = async () => {
  const cartId = await getCartId();

  if (!cartId) {
    return (
      <CartLink>
        <CartIcon />
      </CartLink>
    );
  }

  const count = await getCartQuantity(cartId);

  return (
    <CartLink>
      <CartIcon count={count} />
    </CartLink>
  );
};
