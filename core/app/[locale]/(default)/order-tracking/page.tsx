import React from 'react';
import OrderTracking from './_components/order-tracking';
import { getSessionCustomerAccessToken } from '~/auth';
import wavingHandIcon from '~/public/pdp-icons/wavingHandIcon.svg'
import { getSessionUserDetails } from "~/auth";

export default async function page() {

  const sessionUser = await getSessionUserDetails();
  const userEmail = sessionUser?.user?.email;

  let guestUserCheck = 0;
  const customerAccessToken = await getSessionCustomerAccessToken();

  if(!customerAccessToken) {
    guestUserCheck = 1;
  }

  return (
    <div className="text-[#353535] mb-[2rem]">
      {<OrderTracking userEmail={userEmail} icon={wavingHandIcon} guestUserCheck={guestUserCheck} />}
    </div>
  );
}
