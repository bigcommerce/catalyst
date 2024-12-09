import React from 'react';
import OrderTracking from './_components/order-tracking';
import OrderNonMember from './_components/order-non-member';
import OrderSummary from './_components/order-summary';
import HelpCenter from './_components/help-center';

export default function page() {
  return (
    <div className="my-[2rem] text-[#353535]">
      {/* <OrderTracking /> */}
      {/* <OrderNonMember /> */}
      <OrderSummary />
      {/* <HelpCenter/> */}
    </div>
  );
}
