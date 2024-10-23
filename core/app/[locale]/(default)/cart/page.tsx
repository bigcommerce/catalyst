import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';

import { CartItem, CartItemFragment } from './_components/cart-item';
import { CartViewed } from './_components/cart-viewed';
import { CheckoutButton } from './_components/checkout-button';
import { CheckoutSummary, CheckoutSummaryFragment } from './_components/checkout-summary';
import { EmptyCart } from './_components/empty-cart';
import { GeographyFragment } from './_components/shipping-estimator/fragment';

const CartPageQuery = graphql(
  `
    query CartPageQuery($cartId: String) {
      site {
        cart(entityId: $cartId) {
          entityId
          currencyCode
          lineItems {
            ...CartItemFragment
          }
        }
        checkout(entityId: $cartId) {
          ...CheckoutSummaryFragment
        }
      }
      geography {
        ...GeographyFragment
      }
    }
  `,
  [CartItemFragment, CheckoutSummaryFragment, GeographyFragment],
);

export async function generateMetadata() {
  const t = await getTranslations('Cart');

  return {
    title: t('title'),
  };
}

export default async function Cart() {
  const cookieStore = await cookies();

  const cartId = cookieStore.get('cartId')?.value;

  if (!cartId) {
    return <EmptyCart />;
  }

  const t = await getTranslations('Cart');

  const customerId = await getSessionCustomerId();

  const { data } = await client.fetch({
    document: CartPageQuery,
    variables: { cartId },
    customerId,
    fetchOptions: {
      cache: 'no-store',
      next: {
        tags: [TAGS.cart, TAGS.checkout],
      },
    },
  });

  const cart = data.site.cart;
  const checkout = data.site.checkout;
  const geography = data.geography;

  if (!cart) {
    return <EmptyCart />;
  }

  const lineItems = [...cart.lineItems.physicalItems, ...cart.lineItems.digitalItems];

  return (
    <div>
      <h1 className="pb-6 text-4xl font-black lg:pb-10 lg:text-5xl">{t('heading')}</h1>
      <div className="pb-12 md:grid md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <ul className="col-span-2">
          {lineItems.map((product) => (
            <CartItem currencyCode={cart.currencyCode} key={product.entityId} product={product} />
          ))}
        </ul>

        <div className="col-span-1 col-start-2 lg:col-start-3">
          {checkout && <CheckoutSummary checkout={checkout} geography={geography} />}

          <CheckoutButton cartId={cartId} />
        </div>
      </div>
      <CartViewed checkout={checkout} currencyCode={cart.currencyCode} lineItems={lineItems} />
    </div>
  );
}

export const runtime = 'edge';
