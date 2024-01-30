import { Badge } from '@bigcommerce/reactant/Badge';
import { ShoppingCart } from 'lucide-react';
import { cookies } from 'next/headers';

import { getCart } from '~/client/queries/getCart';
import { Link } from '~/components/Link';

export const Cart = async () => {
  const cartId = cookies().get('cartId')?.value;

  if (!cartId) {
    return (
      <Link href="/cart">
        <ShoppingCart aria-label="cart" />
      </Link>
    );
  }

  const cart = await getCart(cartId);

  const count = cart?.lineItems.totalQuantity;

  return (
    <Link href="/cart">
      <span className="sr-only">Cart Items</span>
      <ShoppingCart aria-hidden="true" />
      {Boolean(count) && <Badge> {count}</Badge>}
    </Link>
  );
};
