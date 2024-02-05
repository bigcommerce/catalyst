import { Badge } from '@bigcommerce/reactant/Badge';
import { NavigationMenuLink } from '@bigcommerce/reactant/NavigationMenu';
import { ShoppingCart } from 'lucide-react';
import { ReactNode } from 'react';

import { useCartProvider } from '~/app/contexts/CartContext';
import { getCart } from '~/client/queries/getCart';
import { Link } from '~/components/Link';

export const CartLink = ({ children }: { children: ReactNode }) => (
  <NavigationMenuLink asChild>
    <Link className="relative" href="/cart">
      {children}
    </Link>
  </NavigationMenuLink>
);

export const Cart = async () => {
  const cartId = useCartProvider();

  const cart = await getCart(cartId);

  if (!cartId) {
    return (
      <CartLink>
        <ShoppingCart aria-label="cart" />
      </CartLink>
    );
  }

  const count = cart?.lineItems.totalQuantity;

  return (
    <CartLink>
      <span className="sr-only">Cart Items</span>
      <ShoppingCart aria-hidden="true" />
      {Boolean(count) && <Badge> {count}</Badge>}
    </CartLink>
  );
};
