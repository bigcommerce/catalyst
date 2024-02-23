import { Button } from '@bigcommerce/components/button';
import { Trash2 as Trash } from 'lucide-react';
import { cookies } from 'next/headers';
import Image from 'next/image';
import { Suspense } from 'react';

import { getCheckoutUrl } from '~/client/management/get-checkout-url';
import { getCart } from '~/client/queries/get-cart';

import { getShippingCountries } from './_actions/get-shipping-countries';
import { removeProduct } from './_actions/remove-products';
import { CartItemCounter } from './_components/cart-item-counter';
import { CheckoutSummary, ShippingCosts } from './_components/checkout-summary';

export const metadata = {
  title: 'Cart',
};

const EmptyCart = () => (
  <div className="flex h-full flex-col">
    <h1 className="pb-6 text-4xl font-black lg:pb-10 lg:text-5xl">Your cart</h1>
    <div className="flex grow flex-col items-center justify-center gap-6 border-t border-t-gray-200 py-20">
      <h2 className="text-xl font-bold lg:text-2xl">Your cart is empty</h2>
      <p className="text-center">
        Looks like you have not addded anything to your cart. Go ahead & explore top categories.
      </p>
    </div>
  </div>
);

const CheckoutButton = async ({ cartId }: { cartId: string }) => {
  const checkoutUrl = await getCheckoutUrl(cartId);

  return (
    <Button asChild className="mt-6">
      <a href={checkoutUrl}>Proceed to checkout</a>
    </Button>
  );
};

export default async function CartPage() {
  const cartId = cookies().get('cartId')?.value;
  const shippingCostData = cookies().get('shippingCosts')?.value;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const shippingCosts: ShippingCosts | null = shippingCostData
    ? JSON.parse(shippingCostData)
    : null;

  if (!cartId) {
    return <EmptyCart />;
  }

  const cart = await getCart(cartId);
  const shippingCountries = await getShippingCountries();

  if (!cart) {
    return <EmptyCart />;
  }

  const extractCartlineItemsData = ({
    entityId,
    productEntityId,
    quantity,
    variantEntityId,
    selectedOptions,
  }: (typeof cart.lineItems.physicalItems)[number]) => ({
    lineItemEntityId: entityId,
    productEntityId,
    quantity,
    variantEntityId,
    selectedOptions,
  });

  return (
    <div>
      <h1 className="pb-6 text-4xl font-black lg:pb-10 lg:text-5xl">Your cart</h1>
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
                  <p className="text-xl font-bold lg:text-2xl">{product.name}</p>

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

                          case 'CartSelectedCheckboxOption':
                            return (
                              <div key={selectedOption.entityId}>
                                <span>{selectedOption.name}:</span>{' '}
                                <span className="font-semibold">{selectedOption.value}</span>
                              </div>
                            );

                          case 'CartSelectedNumberFieldOption':
                            return (
                              <div key={selectedOption.entityId}>
                                <span>{selectedOption.name}:</span>{' '}
                                <span className="font-semibold">{selectedOption.number}</span>
                              </div>
                            );

                          case 'CartSelectedMultiLineTextFieldOption':
                            return (
                              <div key={selectedOption.entityId}>
                                <span>{selectedOption.name}:</span>{' '}
                                <span className="font-semibold">{selectedOption.text}</span>
                              </div>
                            );

                          case 'CartSelectedTextFieldOption':
                            return (
                              <div key={selectedOption.entityId}>
                                <span>{selectedOption.name}:</span>{' '}
                                <span className="font-semibold">{selectedOption.text}</span>
                              </div>
                            );

                          case 'CartSelectedDateFieldOption':
                            return (
                              <div key={selectedOption.entityId}>
                                <span>{selectedOption.name}:</span>{' '}
                                <span className="font-semibold">
                                  {Intl.DateTimeFormat().format(new Date(selectedOption.date.utc))}
                                </span>
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
                  <p className="inline-flex w-24 justify-center text-lg font-bold">
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
          <CheckoutSummary
            cart={cart}
            shippingCosts={shippingCosts}
            shippingCountries={shippingCountries}
          />

          <Suspense fallback="Loading...">
            <CheckoutButton cartId={cartId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export const runtime = 'edge';
