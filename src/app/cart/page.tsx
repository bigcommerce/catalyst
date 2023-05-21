import { Trash2 as Trash } from 'lucide-react';
import { cookies } from 'next/headers';
import Image from 'next/image';
import { Suspense } from 'react';

import { getCart, getCheckoutUrl } from '@client';

import { removeProduct } from './_actions/removeProduct';

const CheckoutButton = async ({ cartId }: { cartId: string }) => {
  const checkoutUrl = await getCheckoutUrl(cartId);

  return (
    <a
      className="inline-block w-full bg-[#053FB0] py-3 text-center text-base font-semibold text-white hover:opacity-95"
      href={checkoutUrl}
    >
      Proceed to checkout
    </a>
  );
};

export default async function CartPage() {
  const cartId = cookies().get('cartId')?.value;

  if (!cartId) {
    return <div>Your cart is empty</div>;
  }

  const cart = await getCart(cartId);

  if (!cart) {
    return <div>Your cart is empty</div>;
  }

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: cart.currencyCode,
  });

  return (
    <div>
      <h1 className="mb-3 text-[50px] font-black leading-[66px] text-black">Your cart</h1>

      <div className="md:grid md:grid-cols-3 md:gap-8">
        <ul className="col-span-2">
          {cart.lineItems.physicalItems.map((product) => (
            <li key={product.entityId}>
              <div className="flex items-center gap-6 border-t-[1px] border-t-gray-300 py-4">
                <div>
                  <Image alt={product.name} height={104} src={product.imageUrl ?? ''} width={104} />
                </div>

                <div className="flex-1">
                  <p className="text-base text-[#546E7A]">{product.brand}</p>
                  <p className="text-xl font-bold">{product.name}</p>
                </div>

                <div>
                  <p className="text-base font-bold">x{product.quantity}</p>
                </div>

                <div>
                  <p className="text-base font-bold">${product.extendedSalePrice.value}</p>
                </div>

                <form action={removeProduct}>
                  <input name="lineItemEntityId" type="hidden" value={product.entityId} />
                  <button type="submit">
                    <Trash />
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>

        <div className="col-span-1">
          <div className="flex justify-between border-t-[1px] border-t-gray-300 py-4">
            <span className="text-base font-semibold">Subtotal</span>
            <span className="text-base">
              {currencyFormatter.format(cart.totalExtendedListPrice.value)}
            </span>
          </div>

          <div className="flex justify-between border-t-[1px] border-t-gray-300 py-4">
            <span className="text-base font-semibold">Discounts</span>
            <span className="text-base">
              {currencyFormatter.format(cart.totalDiscountedAmount.value)}
            </span>
          </div>

          <div className="flex justify-between border-t-[1px] border-t-gray-300 py-4">
            <span className="text-xl font-semibold">Grand total</span>
            <span className="text-xl font-semibold">
              {currencyFormatter.format(cart.totalExtendedSalePrice.value)}
            </span>
          </div>

          <Suspense fallback="Loading...">
            {/* @ts-expect-error Server Component */}
            <CheckoutButton cartId={cartId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export const runtime = 'edge';
