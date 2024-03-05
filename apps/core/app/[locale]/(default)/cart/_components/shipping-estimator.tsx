'use client';

import { Button } from '@bigcommerce/components/button';
import { useTranslations } from 'next-intl';
import { useContext, useState } from 'react';

import { ShippingInfo } from '~/components/forms';

import { CheckoutContext, createCurrencyFormatter } from './checkout-summary';

export const ShippingEstimator = ({
  shippingItems,
}: {
  shippingItems: Array<{ quantity: number; lineItemEntityId: string }>;
}) => {
  const { isShippingMethodSelected, shippingCosts, currencyCode } = useContext(CheckoutContext);
  const [isOpened, setIsOpened] = useState(false);
  const [wasShippingMethodSelectedBefore, setWasShippingMethodSelectedBefore] =
    useState(isShippingMethodSelected);
  const t = useTranslations('Cart.CheckoutSummary');

  const currencyFormatter = createCurrencyFormatter(currencyCode);

  // hide ShippingInfo form after shipping update
  if (isShippingMethodSelected !== wasShippingMethodSelectedBefore) {
    setWasShippingMethodSelectedBefore(isShippingMethodSelected);

    if (isShippingMethodSelected) {
      setIsOpened(false);
    }
  }

  return shippingCosts && shippingCosts.selectedShippingOption ? (
    <div className="flex flex-col justify-between gap-4 border-t border-t-gray-200 py-4">
      <div className="w-full">
        <p className="flex justify-between">
          <span className="text-base font-semibold">{t('shippingCost')}</span>
          <span className="text-base">
            {currencyFormatter.format(shippingCosts.shippingCostTotal)}
          </span>
        </p>
        <p className="inline-flex gap-2">
          <span className="text-base">{shippingCosts.selectedShippingOption}</span>
          <Button
            className="w-fit p-0 text-base text-blue-primary"
            onClick={() => setIsOpened((open) => !open)}
            variant="subtle"
          >
            {t('change')}
          </Button>
        </p>
        <ShippingInfo
          cartItems={shippingItems}
          isVisible={isOpened}
          key={shippingCosts.selectedShippingOption}
        />
      </div>
      <div className="inline-flex justify-between border-t border-t-gray-200 pt-4">
        <span className="text-base font-semibold">{t('handlingCost')}</span>
        <span className="text-base">
          {currencyFormatter.format(shippingCosts.handlingCostTotal)}
        </span>
      </div>
    </div>
  ) : (
    <div className="flex flex-col justify-between gap-4 border-t border-t-gray-200 py-4">
      <div className="inline-flex w-full flex-col justify-between">
        <div className="inline-flex items-center justify-between">
          <span className="text-base font-semibold">{t('shippingCost')}</span>
          <Button
            className="w-fit p-0 text-base text-blue-primary"
            onClick={() => setIsOpened((open) => !open)}
            variant="subtle"
          >
            {isOpened ? t('cancel') : t('add')}
          </Button>
        </div>
        <ShippingInfo cartItems={shippingItems} isVisible={isOpened} />
      </div>
    </div>
  );
};
