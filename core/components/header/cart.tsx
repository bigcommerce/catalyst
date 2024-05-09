import { cookies } from 'next/headers';
import { ReactNode } from 'react';

import { getCart } from '~/client/queries/get-cart';
import { Link } from '~/components/link';
import { NavigationMenuLink } from '~/components/ui/navigation-menu';

import { CartIcon } from './cart-icon';

export const CartLink = ({ children }: { children: ReactNode }) => (
  <NavigationMenuLink asChild>
    <Link className="relative" href="/cart">
      {children}
    </Link>
  </NavigationMenuLink>
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
