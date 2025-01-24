import React from 'react';
import OrderTracking from './_components/order-tracking';
import HelpCenter from './_components/help-center';
import { imageManagerImageUrl } from '~/lib/store-assets';
import { getSessionCustomerAccessToken } from '~/auth';
import wavingHandIcon from '~/public/pdp-icons/wavingHandIcon.svg'

export default async function page() {
  let guestUserCheck = 0;
  const customerAccessToken = await getSessionCustomerAccessToken();

  if(!customerAccessToken) {
    guestUserCheck = 1;
  }

  return (
    <div className="text-[#353535] mb-[2rem]">
      {<OrderTracking icon={wavingHandIcon} guestUserCheck={guestUserCheck} />}
    </div>
  );
}
