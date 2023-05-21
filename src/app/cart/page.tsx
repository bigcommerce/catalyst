import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { getCart } from '@client';

export default async function CartPage() {
  const cartId = cookies().get('cartId')?.value;

  if (!cartId) {
    return <div>Cart is empty</div>;
  }

  const cart = await getCart(cartId);

  if (!cart) {
    return notFound();
  }

  return (
    <div>
      <div>A cart page</div>

      <ul>
        {cart.lineItems.physicalItems.map((product) => (
          <li key={product.entityId}>
            {product.name} - ${product.listPrice.value} x{product.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
}

export const runtime = 'edge';
// export const dynamic = 'force-dynamic';
