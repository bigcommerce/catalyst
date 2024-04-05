import { AlertCircle } from 'lucide-react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { toast } from 'react-hot-toast';

import { getCheckout } from '~/client/queries/get-checkout';

import { getShippingCountries } from '../_actions/get-shipping-countries';

import { CouponCode } from './coupon-code';
import { ShippingEstimator } from './shipping-estimator';

export const CheckoutSummary = async ({ cartId, locale }: { cartId: string; locale: string }) => {
  const t = await getTranslations({ locale, namespace: 'Cart.CheckoutSummary' });
  const messages = await getMessages({ locale });

  const [checkout, shippingCountries] = await Promise.all([
    getCheckout(cartId),
    getShippingCountries(),
  ]);

  if (!checkout) {
    toast.error(t('errorMessage'), {
      icon: <AlertCircle className="text-error-secondary" />,
    });

    return null;
  }

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: checkout.cart?.currencyCode,
  });

  return (
    <>
      <div className="flex justify-between border-t border-t-gray-200 py-4">
        <span className="font-semibold">{t('subTotal')}</span>
        <span>{currencyFormatter.format(checkout.subtotal?.value || 0)}</span>
      </div>

      <NextIntlClientProvider locale={locale} messages={{ Cart: messages.Cart ?? {} }}>
        <ShippingEstimator checkout={checkout} shippingCountries={shippingCountries} />
      </NextIntlClientProvider>

      {checkout.cart?.discountedAmount && (
        <div className="flex justify-between border-t border-t-gray-200 py-4">
          <span className="font-semibold">{t('discounts')}</span>
          <span>-{currencyFormatter.format(checkout.cart.discountedAmount.value)}</span>
        </div>
      )}

      <NextIntlClientProvider locale={locale} messages={{ Cart: messages.Cart ?? {} }}>
        <CouponCode checkout={checkout} />
      </NextIntlClientProvider>

      {checkout.taxTotal && (
        <div className="flex justify-between border-t border-t-gray-200 py-4">
          <span className="font-semibold">{t('tax')}</span>
          <span>{currencyFormatter.format(checkout.taxTotal.value)}</span>
        </div>
      )}

      <div className="flex justify-between border-t border-t-gray-200 py-4 text-xl font-bold lg:text-2xl">
        {t('grandTotal')}
        <span>{currencyFormatter.format(checkout.grandTotal?.value || 0)}</span>
      </div>
    </>
  );
};
