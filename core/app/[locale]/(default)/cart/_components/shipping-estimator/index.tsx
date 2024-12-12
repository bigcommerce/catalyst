'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { FragmentOf } from '~/client/graphql';
import { ExistingResultType } from '~/client/util';

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

  const [showShippingOptions, setShowShippingOptions] = useState(false);

  const selectedShippingConsignment = checkout.shippingConsignments?.find(
    (shippingConsignment) => shippingConsignment.selectedShippingOption,
  );

  const prevCheckout = useRef(checkout);

  useEffect(() => {
    const checkoutChanged = !Object.is(prevCheckout.current, checkout);

    if (checkoutChanged) {
      setShowShippingOptions(true);
    }

    if (checkoutChanged && selectedShippingConsignment && showShippingOptions) {
      setShowShippingOptions(false);
    }

    prevCheckout.current = checkout;
  }, [checkout, selectedShippingConsignment, showShippingOptions]);

  return (
    <>
      <div className="flex flex-col gap-2 pb-1">
        <div className="text-left font-sans text-[20px] font-medium leading-[32px] tracking-[0.15px] text-[#002A37]">
          Order Summary
        </div>

        <ShippingInfo
          checkout={checkout}
          isVisible={true}
          shippingCountries={shippingCountries}
        />
      </div>
    </>
  );
};
