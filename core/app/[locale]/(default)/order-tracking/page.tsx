import React from 'react';
import OrderTracking from './_components/order-tracking';
import HelpCenter from './_components/help-center';
import { imageManagerImageUrl } from '~/lib/store-assets';
import { getSessionCustomerAccessToken } from '~/auth';

export default async function page() {
  const icon = imageManagerImageUrl("waving-hand-1-.png", '24w');
  let guestUserCheck = 0;
  const customerAccessToken = await getSessionCustomerAccessToken();

  if(!customerAccessToken) {
    guestUserCheck = 1;
  }

  return (
    <div className="my-[2rem] text-[#353535]">
      {<OrderTracking icon={icon} guestUserCheck={guestUserCheck} />}
      {<HelpCenter />}
    </div>
  );
}
