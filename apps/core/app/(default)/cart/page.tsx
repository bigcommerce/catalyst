import { Button } from '@bigcommerce/reactant/Button';
import { Trash2 as Trash } from 'lucide-react';
import { cookies } from 'next/headers';
import Image from 'next/image';
import { Suspense } from 'react';

import client from '~/client';

import { removeProduct } from './_actions/removeProduct';
import { CartItemCounter } from './CartItemCounter';

const EmptyCart = () => (
  <div className="flex h-full flex-col">
    <h2 className="pb-6 text-h2 lg:pb-10">Your cart</h2>
    <div className="flex grow flex-col items-center justify-center gap-6 border-t border-t-gray-200 py-20">
      <h5 className="text-h5">Your cart is empty</h5>
      <p className="text-center">
        Looks like you have not addded anything to your cart. Go ahead & explore top categories.
      </p>
    </div>
  </div>
);

const CheckoutButton = async ({ cartId }: { cartId: string }) => {
  const checkoutUrl = await client.getCheckoutUrl(cartId);

  return (
    <Button asChild className="mt-6">
      <a href={checkoutUrl}>Proceed to checkout</a>
    </Button>
  );
};

export default async function CartPage() {
  const cartId = cookies().get('cartId')?.value;

  if (!cartId) {
    return <EmptyCart />;
  }

  const cart = await client.getCart(cartId, {
    cache: 'no-store',
    next: {
      tags: ['cart'],
    },
  });

  if (!cart) {
    return <EmptyCart />;
  }

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: cart.currencyCode,
  });
  const extractCartlineItemsData = ({
    entityId,
    productEntityId,
    quantity,
    variantEntityId,
  }: (typeof cart.lineItems.physicalItems)[number]) => ({
    lineItemEntityId: entityId,
    productEntityId,
    quantity,
    variantEntityId,
  });

  return (
    <div>
      <h2 className="pb-6 text-h2 lg:pb-10">Your cart</h2>
      <div className="pb-12 md:grid md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <ul className="col-span-2">
          {cart.lineItems.physicalItems.map((product) => (
            <li key={product.entityId}>
              <div className="flex items-center gap-6 border-t border-t-gray-200 py-4">
                <div>
                  <Image alt={product.name} height={104} src={product.imageUrl ?? ''} width={104} />
                </div>

                <div className="flex-1">
                  <p className="text-base text-gray-500">{product.brand}</p>
                  <p className="text-h5">{product.name}</p>

                  {product.selectedOptions.length > 0 && (
                    <div className="mt-2">
                      {product.selectedOptions.map((selectedOption) => {
                        switch (selectedOption.__typename) {
                          case 'CartSelectedMultipleChoiceOption':
                            return (
                              <div key={selectedOption.entityId}>
                                <span>{selectedOption.name}:</span>{' '}
                                <span className="font-semibold">{selectedOption.value}</span>
                              </div>
                            );
                        }

                        return null;
                      })}
                    </div>
                  )}
                </div>

                <CartItemCounter itemData={extractCartlineItemsData(product)} />

                <div>
                  <p className="inline-flex w-24 justify-center text-base font-bold">
                    ${product.extendedSalePrice.value}
                  </p>
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

        <div className="col-span-1 col-start-2 lg:col-start-3">
          <div className="flex justify-between border-t border-t-gray-200 py-4">
            <span className="text-base font-semibold">Subtotal</span>
            <span className="text-base">
              {currencyFormatter.format(cart.totalExtendedListPrice.value)}
            </span>
          </div>

          <div className="flex justify-between border-t border-t-gray-200 py-4">
            <span className="text-base font-semibold">Discounts</span>
            <span className="text-base">
              {currencyFormatter.format(cart.totalDiscountedAmount.value)}
            </span>
          </div>

          <div className="flex justify-between border-t border-t-gray-200 py-4">
            <span className="text-h5">Grand total</span>
            <span className="text-h5">
              {currencyFormatter.format(cart.totalExtendedSalePrice.value)}
            </span>
          </div>

          <Suspense fallback="Loading...">
            <CheckoutButton cartId={cartId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export const runtime = 'edge';
