import { cookies } from 'next/headers';
import { ReactNode } from 'react';

import { getCart } from '~/client/queries/get-cart';
import { Link } from '~/components/link';

import { CartIcon } from './cart-icon';

export const CartLink = ({ children }: { children: ReactNode }) => (
  <Link className="relative flex justify-between p-3 font-semibold" href="/cart" role="status">
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
