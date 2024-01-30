import { Badge } from '@bigcommerce/reactant/Badge';
import { ShoppingCart } from 'lucide-react';
import { cookies } from 'next/headers';

import { getCart } from '~/client/queries/getCart';

export const Cart = async () => {
  const cartId = cookies().get('cartId')?.value;

  if (!cartId) {
    return <ShoppingCart aria-label="cart" />;
  }

  const cart = await getCart(cartId);

  const count = cart?.lineItems.totalQuantity;

  return (
    <p role="status">
      <span className="sr-only">Cart Items</span>
      <ShoppingCart aria-hidden="true" />
      {Boolean(count) && <Badge>{count}</Badge>}
    </p>
  );
};
