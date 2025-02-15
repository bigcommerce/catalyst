// handlerUpdateSessionUrl;

'use server';
import { cookies } from 'next/headers';
import { findCustomerDetails } from './find-customer';
import { getSessionUserDetails } from '~/auth';

export const InsertShopperVisitedUrl = async (sessionId: any, url: string) => {
  const cookieStore = await cookies();
  const CartId = cookieStore.get('cartId');
  const getCustomerData = await getSessionUserDetails();
  let response = null;
  if (getCustomerData?.user?.email) {
    response = await findCustomerDetails({
      first_name: '',
      last_name: '',
      email: getCustomerData?.user?.email,
    });
  }
  const responseData = {
    id: response?.data?.output[0]?.id ?? 0,
    email: response?.data?.output[0]?.email ?? '',
    first_name: response?.data?.output[0]?.first_name ?? '',
    last_name: response?.data?.output[0]?.last_name ?? '',
    customer_group_id: response?.data?.output[0]?.customer_group_id ?? 0,
  };
  try {
    let postData = JSON.stringify({
      session_id: sessionId,
      url: url,
      cart_id: CartId?.value,
      customer_id:responseData.id,
      customer_group_id:responseData.customer_group_id,
      customer_name:responseData.first_name + ' ' + responseData.last_name,
      customer_emailid:responseData.email,
      access_id: process.env.SALES_BUDDY_ACCESS_ID,
    });

    
    const apiUrl = process.env.SALES_BUDDY_API_URL!;
    const apiEnv = process.env.SALES_BUDDY_API_ENV!;
    const apiPath = process.env.SALES_BUDDY_API_PATH!;
    let data = await fetch(apiUrl + apiEnv + apiPath + 'update-session-url', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: postData,
    })
      .then((res) => res.json())
      .then((jsonData) => {
        return jsonData;
      })
      .catch((error) => {
        return { status: 500, error: error.message };
      });
    return data;
  } catch (error) {
    return { status: 500, error: JSON.stringify(error) };
  }
};
