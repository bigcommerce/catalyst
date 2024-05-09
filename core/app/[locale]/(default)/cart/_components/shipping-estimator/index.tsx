'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { FragmentOf } from '~/client/graphql';
import { ExistingResultType } from '~/client/util';
import { Button } from '~/components/ui/button';

import { ShippingInfo } from '../shipping-info';
import { ShippingOptions } from '../shipping-options';

import { ShippingEstimatorFragment } from './fragment';
import { getShippingCountries } from './get-shipping-countries';

interface Props {
  checkout: FragmentOf<typeof ShippingEstimatorFragment>;
  shippingCountries: ExistingResultType<typeof getShippingCountries>;
}

export const ShippingEstimator = ({ checkout, shippingCountries }: Props) => {
  const t = useTranslations('Cart.CheckoutSummary');
  const format = useFormatter();

  const [showShippingInfo, setShowShippingInfo] = useState(false);
  const [showShippingOptions, setShowShippingOptions] = useState(false);

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
            <span>
              {format.number(checkout.shippingCostTotal?.value || 0, {
                style: 'currency',
                currency: checkout.cart?.currencyCode,
              })}
            </span>
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
            {checkout.shippingConsignments.map((consignment) => {
              return (
                <ShippingOptions
                  checkoutEntityId={checkout.entityId}
                  currencyCode={checkout.cart?.currencyCode}
                  data={consignment}
                  key={consignment.entityId}
                />
              );
            })}
          </div>
        )}
      </div>

      {Boolean(checkout.handlingCostTotal?.value) && (
        <div className="flex justify-between border-t border-t-gray-200 py-4">
          <span className="font-semibold">{t('handlingCost')}</span>
          <span>
            {format.number(checkout.handlingCostTotal?.value || 0, {
              style: 'currency',
              currency: checkout.cart?.currencyCode,
            })}
          </span>
        </div>
      )}
    </>
  );
};
