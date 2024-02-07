import { Badge } from '@bigcommerce/components/Badge';
import { NavigationMenuLink } from '@bigcommerce/components/NavigationMenu';
import { ShoppingCart } from 'lucide-react';
import { cookies } from 'next/headers';
import { ReactNode } from 'react';

import { getCart } from '~/client/queries/get-cart';
import { Link } from '~/components/link';

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
        <ShoppingCart aria-label="cart" />
      </CartLink>
    );
  }

  const cart = await getCart(cartId);

  const count = cart?.lineItems.totalQuantity;

  return (
    <CartLink>
      <span className="sr-only">Cart Items</span>
      <ShoppingCart aria-hidden="true" />
      {Boolean(count) && <Badge> {count}</Badge>}
    </CartLink>
  );
};
