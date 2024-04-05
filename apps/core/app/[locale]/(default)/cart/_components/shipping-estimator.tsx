'use client';

import { Button } from '@bigcommerce/components/button';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { getCheckout } from '~/client/queries/get-checkout';
import { ExistingResultType } from '~/client/util';

import { getShippingCountries } from '../_actions/get-shipping-countries';

import { ShippingInfo } from './shipping-info';
import { ShippingOptions } from './shipping-options';

export const ShippingEstimator = ({
  checkout,
  shippingCountries,
}: {
  checkout: ExistingResultType<typeof getCheckout>;
  shippingCountries: ExistingResultType<typeof getShippingCountries>;
}) => {
  const t = useTranslations('Cart.CheckoutSummary');

  const [showShippingInfo, setShowShippingInfo] = useState(false);
  const [showShippingOptions, setShowShippingOptions] = useState(false);

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: checkout.cart?.currencyCode,
  });

  const selectedShippingConsignment = checkout.shippingConsignments?.find(
    (shippingConsignment) => shippingConsignment.selectedShippingOption,
  );

  const prevCheckout = useRef(checkout);

  useEffect(() => {
    const checkoutChanged = !Object.is(prevCheckout.current, checkout);

    if (checkoutChanged && showShippingInfo) {
      setShowShippingOptions(true);
    }

    if (showShippingInfo === false) {
      setShowShippingOptions(false);
    }

    if (checkoutChanged && selectedShippingConsignment && showShippingInfo && showShippingOptions) {
      setShowShippingInfo(false);
      setShowShippingOptions(false);
    }

    prevCheckout.current = checkout;
  }, [checkout, selectedShippingConsignment, showShippingInfo, showShippingOptions]);

  return (
    <>
      <div className="flex flex-col gap-2 border-t border-t-gray-200 py-4">
        <div className="flex justify-between">
          <span className="font-semibold">{t('shippingCost')}</span>
          {selectedShippingConsignment ? (
            <span>{currencyFormatter.format(checkout.shippingCostTotal?.value || 0)}</span>
          ) : (
            <Button
              aria-controls="shipping-options"
              className="w-fit p-0 text-primary hover:bg-transparent"
              onClick={() => setShowShippingInfo((open) => !open)}
              variant="subtle"
            >
              {showShippingInfo ? t('cancel') : t('add')}
            </Button>
          )}
        </div>

        {selectedShippingConsignment && (
          <div className="flex justify-between">
            <span>{selectedShippingConsignment.selectedShippingOption?.description}</span>
            <Button
              aria-controls="shipping-options"
              className="w-fit p-0 text-primary hover:bg-transparent"
              onClick={() => setShowShippingInfo((open) => !open)}
              variant="subtle"
            >
              {showShippingInfo ? t('cancel') : t('change')}
            </Button>
          </div>
        )}

        <ShippingInfo
          checkout={checkout}
          hideShippingOptions={() => setShowShippingOptions(false)}
          isVisible={showShippingInfo}
          shippingCountries={shippingCountries}
        />

        {showShippingOptions && checkout.shippingConsignments && (
          <div className="flex flex-col" id="shipping-options">
            {checkout.shippingConsignments.map(({ entityId, availableShippingOptions }) => {
              return (
                <ShippingOptions
                  availableShippingOptions={availableShippingOptions}
                  checkout={checkout}
                  consignmentEntityId={entityId}
                  key={entityId}
                />
              );
            })}
          </div>
        )}
      </div>

      {Boolean(checkout.handlingCostTotal?.value) && (
        <div className="flex justify-between border-t border-t-gray-200 py-4">
          <span className="font-semibold">{t('handlingCost')}</span>
          <span>{currencyFormatter.format(checkout.handlingCostTotal?.value || 0)}</span>
        </div>
      )}
    </>
  );
};
