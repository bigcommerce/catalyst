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
import { MapPin } from 'lucide-react';

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

    if (!showShippingInfo) {
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
      <div className="flex flex-col gap-2 pb-1">
        <div className="text-left font-sans text-[20px] font-medium leading-[32px] tracking-[0.15px] text-[#002A37]">
          Order Summary
        </div>

        <div className='flex flex-col justify-center items-start py-[10px] gap-[5px]'>
          <div className='font-normal text-[14px] leading-[24px] tracking-[0.25px] text-[#353535]'>Calculate Shipping/Tax:</div>
          <div className='flex justify-center items-center p-0 gap-[5px] w-full'>
            <div className='flex-1'>
              <input  type="text" height={44} className='w-full min-h-[44px] p-[6px_10px] bg-[#ffffff] border border-[#cccbcb] rounded-[3px]' />
            </div>
            <button className='font-[500] text-[14px] leading-[24px] tracking-[1.25px] text-[#002a37] flex justify-center items-center px-[10px] bg-[#ffffff] border border-[#4eaecc] h-[44px]'>CALCULATE</button>
          </div>
          <div className='flex items-center p-0 gap-[5px]'>
            <div className=''>
              <MapPin width={15} height={18} />
            </div>
            <div className='font-normal text-[14px] leading-[24px] tracking-[0.25px] text-[#353535] underline'>Use your current location</div>
          </div>
        </div>

        <div className="flex justify-between">
          <span className="text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem]">
            {t('shippingCost')}
          </span>
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
              className="w-fit p-0 text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] underline"
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
