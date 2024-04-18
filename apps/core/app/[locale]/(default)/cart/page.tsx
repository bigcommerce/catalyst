import { Button } from '@bigcommerce/components/button';
import { cookies } from 'next/headers';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { getCart } from '~/client/queries/get-cart';
import { LocaleType } from '~/i18n';
import { redirectToCheckout } from '~/lib/checkout-action';

import { CartItem } from './_components/cart-item';
import { CheckoutSummary } from './_components/checkout-summary';

export const metadata = {
  title: 'Cart',
};

const EmptyCart = () => {
  const t = useTranslations('Cart');

  return (
    <div className="flex h-full flex-col">
      <h1 className="pb-6 text-4xl font-black lg:pb-10 lg:text-5xl">{t('heading')}</h1>
      <div className="flex grow flex-col items-center justify-center gap-6 border-t border-t-gray-200 py-20">
        <h2 className="text-xl font-bold lg:text-2xl">{t('empty')}</h2>
        <p className="text-center">{t('emptyDetails')}</p>
      </div>
    </div>
  );
};

const CheckoutButton = ({ label }: { label: string }) => {
  return (
    <form action={redirectToCheckout}>
      <Button className="mt-6" type="submit">
        {label}
      </Button>
    </form>
  );
};

interface Props {
  params: {
    locale: LocaleType;
  };
}

export default async function CartPage({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: 'Cart' });
  const cartId = cookies().get('cartId')?.value;

  if (!cartId) {
    return <EmptyCart />;
  }

  const cart = await getCart(cartId);

  if (!cart) {
    return <EmptyCart />;
  }

  return (
    <div>
      <h1 className="pb-6 text-4xl font-black lg:pb-10 lg:text-5xl">{t('heading')}</h1>
      <div className="pb-12 md:grid md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <ul className="col-span-2">
          {cart.lineItems.physicalItems.map((product) => (
            <CartItem
              currencyCode={cart.currencyCode}
              key={product.entityId}
              locale={locale}
              product={product}
            />
          ))}

          {cart.lineItems.digitalItems.map((product) => (
            <CartItem
              currencyCode={cart.currencyCode}
              key={product.entityId}
              locale={locale}
              product={product}
            />
          ))}
        </ul>

        <div className="col-span-1 col-start-2 lg:col-start-3">
          <CheckoutSummary cartId={cartId} locale={locale} />

          <Suspense fallback={t('loading')}>
            <CheckoutButton label={t('proceedToCheckout')} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export const runtime = 'edge';
