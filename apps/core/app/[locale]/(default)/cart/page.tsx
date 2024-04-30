import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { LocaleType } from '~/i18n';

import { CartItem, CartItemFragment } from './_components/cart-item';
import { CheckoutButton } from './_components/checkout-button';
import { CheckoutSummary, CheckoutSummaryFragment } from './_components/checkout-summary';
import { EmptyCart } from './_components/empty-cart';

export const metadata = {
  title: 'Cart',
};

interface Props {
  params: {
    locale: LocaleType;
  };
}

const CartPageQuery = graphql(
  `
    query getCart($cartId: String) {
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
    }
  `,
  [CartItemFragment, CheckoutSummaryFragment],
);

export default async function CartPage({ params: { locale } }: Props) {
  const cartId = cookies().get('cartId')?.value;

  if (!cartId) {
    return <EmptyCart locale={locale} />;
  }

  const t = await getTranslations({ locale, namespace: 'Cart' });
  const customerId = await getSessionCustomerId();

  const { data } = await client.fetch({
    document: CartPageQuery,
    variables: { cartId },
    customerId,
    fetchOptions: {
      cache: 'no-store',
      next: {
        tags: ['cart', 'checkout'],
      },
    },
  });

  const cart = data.site.cart;
  const checkout = data.site.checkout;

  if (!cart) {
    return <EmptyCart locale={locale} />;
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
          {checkout && <CheckoutSummary data={checkout} />}

          <Suspense fallback={t('loading')}>
            <CheckoutButton cartId={cartId} label={t('proceedToCheckout')} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export const runtime = 'edge';
