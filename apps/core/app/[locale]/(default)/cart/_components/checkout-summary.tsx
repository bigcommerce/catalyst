'use client';

import { useTranslations } from 'next-intl';
import { createContext, Dispatch, SetStateAction, useState } from 'react';

import { getCart } from '~/client/queries/get-cart';
import { ExistingResultType } from '~/client/util';

import { getShippingCountries } from '../_actions/get-shipping-countries';

import { ShippingEstimator } from './shipping-estimator';

export const createCurrencyFormatter = (currencyCode: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  });

type CartSummary = ExistingResultType<typeof getCart>;
export type CheckoutSummary = CartSummary & {
  shippingCostTotal: {
    currencyCode: string;
    value: number;
  };
  handlingCostTotal: {
    currencyCode: string;
    value: number;
  };
  consignmentEntityId: string;
};
export interface ShippingCosts {
  shippingCostTotal: number;
  handlingCostTotal: number;
  selectedShippingOption: string;
}
type ShippingCountries = ExistingResultType<typeof getShippingCountries>;

export const CheckoutContext = createContext<{
  availableShippingCountries: ShippingCountries;
  checkoutEntityId: string;
  consignmentEntityId: string | null;
  shippingCosts: ShippingCosts | null;
  currencyCode: string;
  isShippingMethodSelected: boolean;
  setIsShippingMethodSelected: (newIsShippingMethodSelected: boolean) => void;
  updateCheckoutSummary: Dispatch<SetStateAction<CheckoutSummary>>;
}>({
  availableShippingCountries: [],
  checkoutEntityId: '',
  consignmentEntityId: '',
  currencyCode: '',
  isShippingMethodSelected: false,
  setIsShippingMethodSelected: () => undefined,
  shippingCosts: null,
  updateCheckoutSummary: () => undefined,
});

export const CheckoutSummary = ({
  cart,
  shippingCountries,
  shippingCosts,
}: {
  cart: NonNullable<CartSummary>;
  shippingCountries: ShippingCountries;
  shippingCosts: ShippingCosts | null;
}) => {
  const t = useTranslations('Cart.CheckoutSummary');
  const [isShippingMethodSelected, setIsShippingMethodSelected] = useState(false);
  const [checkoutSummary, updateCheckoutSummary] = useState<CheckoutSummary>({
    ...cart,
    shippingCostTotal: {
      currencyCode: cart.currencyCode,
      value: shippingCosts?.shippingCostTotal ?? 0,
    },
    handlingCostTotal: {
      currencyCode: cart.currencyCode,
      value: shippingCosts?.handlingCostTotal ?? 0,
    },
    consignmentEntityId: '',
  });

  const currencyFormatter = createCurrencyFormatter(checkoutSummary.currencyCode);
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
    <CheckoutContext.Provider
      value={{
        availableShippingCountries: shippingCountries,
        checkoutEntityId: checkoutSummary.entityId,
        consignmentEntityId: checkoutSummary.consignmentEntityId,
        currencyCode: checkoutSummary.currencyCode,
        isShippingMethodSelected,
        setIsShippingMethodSelected,
        shippingCosts,
        updateCheckoutSummary,
      }}
    >
      <div className="flex justify-between border-t border-t-gray-200 py-4">
        <span className="text-base font-semibold">{t('subTotal')}</span>
        <span className="text-base">
          {currencyFormatter.format(cart.totalExtendedListPrice.value)}
        </span>
      </div>

      <ShippingEstimator
        shippingItems={checkoutSummary.lineItems.physicalItems.reduce<
          Array<{ quantity: number; lineItemEntityId: string }>
        >((items, product) => {
          const { lineItemEntityId, quantity } = extractCartlineItemsData(product);

          items.push({ quantity, lineItemEntityId });

          return items;
        }, [])}
      />

      <div className="flex justify-between border-t border-t-gray-200 py-4">
        <span className="text-base font-semibold">{t('discounts')}</span>
        <span className="text-base">
          {currencyFormatter.format(checkoutSummary.totalDiscountedAmount.value)}
        </span>
      </div>

      <div className="flex justify-between border-t border-t-gray-200 py-4">
        <span className="text-h5">{t('grandTotal')}</span>
        <span className="text-h5">
          {currencyFormatter.format(
            checkoutSummary.totalExtendedSalePrice.value +
              checkoutSummary.shippingCostTotal.value +
              checkoutSummary.handlingCostTotal.value,
          )}
        </span>
      </div>
    </CheckoutContext.Provider>
  );
};
