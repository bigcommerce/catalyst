import React from 'react';
import OrderTracking from './_components/order-tracking';
import OrderSummary from './_components/order-summary';
import HelpCenter from './_components/help-center';
import { imageManagerImageUrl } from '~/lib/store-assets';

export default function page() {
  const icon = imageManagerImageUrl("waving-hand-1-.png", '24w');
  return (
    <div className="my-[2rem] text-[#353535]">
      {<OrderTracking icon={icon} />}
      {<HelpCenter />}
    </div>
  );
}
