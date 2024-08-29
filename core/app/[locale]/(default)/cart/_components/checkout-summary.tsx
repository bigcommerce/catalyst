import { getFormatter, getTranslations } from 'next-intl/server';

import { FragmentOf, graphql } from '~/client/graphql';

import { CouponCode } from './coupon-code';
import { CouponCodeFragment } from './coupon-code/fragment';
import { ShippingEstimator } from './shipping-estimator';
import { GeographyFragment, ShippingEstimatorFragment } from './shipping-estimator/fragment';
import { getShippingCountries } from './shipping-estimator/get-shipping-countries';

const MoneyFieldsFragment = graphql(`
  fragment MoneyFields on Money {
    currencyCode
    value
  }
`);

export const CheckoutSummaryFragment = graphql(
  `
    fragment CheckoutSummaryFragment on Checkout {
      ...ShippingEstimatorFragment
      ...CouponCodeFragment
      subtotal {
        ...MoneyFields
      }
      grandTotal {
        ...MoneyFields
      }
      taxTotal {
        ...MoneyFields
      }
      cart {
        currencyCode
        discountedAmount {
          ...MoneyFields
        }
      }
    }
  `,
  [MoneyFieldsFragment, ShippingEstimatorFragment, CouponCodeFragment],
);

interface Props {
  checkout: FragmentOf<typeof CheckoutSummaryFragment>;
  geography: FragmentOf<typeof GeographyFragment>;
}

export const CheckoutSummary = async ({ checkout, geography }: Props) => {
  const t = await getTranslations('Cart.CheckoutSummary');
  const format = await getFormatter();

  const { cart, grandTotal, subtotal, taxTotal } = checkout;

  const shippingCountries = await getShippingCountries({ geography });

  return (
    <>
      <div className="flex justify-between border-t border-t-gray-200 py-4">
        <span className="font-semibold">{t('subTotal')}</span>
        <span>
          {format.number(subtotal?.value || 0, {
            style: 'currency',
            currency: cart?.currencyCode,
          })}
        </span>
      </div>

      <ShippingEstimator checkout={checkout} shippingCountries={shippingCountries} />

      {cart?.discountedAmount && (
        <div className="flex justify-between border-t border-t-gray-200 py-4">
          <span className="font-semibold">{t('discounts')}</span>
          <span>
            -
            {format.number(cart.discountedAmount.value, {
              style: 'currency',
              currency: cart.currencyCode,
            })}
          </span>
        </div>
      )}

      <CouponCode checkout={checkout} />

      {taxTotal && (
        <div className="flex justify-between border-t border-t-gray-200 py-4">
          <span className="font-semibold">{t('tax')}</span>
          <span>
            {format.number(taxTotal.value, {
              style: 'currency',
              currency: cart?.currencyCode,
            })}
          </span>
        </div>
      )}

      <div className="flex justify-between border-t border-t-gray-200 py-4 text-xl font-bold lg:text-2xl">
        {t('grandTotal')}
        <span>
          {format.number(grandTotal?.value || 0, {
            style: 'currency',
            currency: cart?.currencyCode,
          })}
        </span>
      </div>
    </>
  );
};
