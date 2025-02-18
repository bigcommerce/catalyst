'use server';
import { cookies } from 'next/headers';
import { getSessionUserDetails } from '~/auth';
import { findCustomerDetails } from './FindCustomerDetails';

export const getSessionIdCookie = async () => {
  const cookieStore = await cookies();

  return cookieStore.get('UserSessionId');
};
export const getCartIdCookie = async () => {
  const cookieStore = await cookies();

  return cookieStore.get('cartId');
};

export const RemoveSessionIdCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete('UserSessionId');
};

export const createSession = async (Userdata: any) => {
  try {
    let postData = JSON.stringify({
      cart_id: Userdata?.cart_id,
      referral_id: Userdata?.referral_id,
      customer_id: Userdata?.customerDetails.id ?? 0,
      customer_group_id: Userdata?.customerDetails?.customer_group_id ?? 0,
      customer_name: Userdata?.customerDetails?.first_name+" "+ Userdata?.customerDetails?.last_name ,
      customer_emailid: Userdata?.customerDetails?.email ?? "",
      shopper_information: Userdata?.shopper_information,
      access_id: process.env.SALES_BUDDY_ACCESS_ID,
    });
    const apiUrl = process.env.SALES_BUDDY_API_URL!;
    const apiPath = process.env.QUOTE_API_PATH!;
    const apiEnv = process.env.SALES_BUDDY_API_ENV!;
    let data = await fetch(apiUrl + apiEnv + apiPath + 'create-session-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: postData,
    })
      .then((res) => res.json())
      .then((jsonData) => {
        console.log("API Response:", jsonData);
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


export const 
createSessionIdCookie = async () => {
  const cookieStore = await cookies();
  const hasCookie = cookieStore.has('UserSessionId');
  console.log("Existing Session Cookie:", hasCookie);
  const CartId = cookieStore.get('cartId');
  const refferalId = cookieStore.get('referrerId');
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
  let data = {
    cart_id: CartId?.value ?? null,
    referral_id: refferalId?.value ?? null,
    customerDetails: responseData,
  };
  if (!hasCookie) {
    let sessioncheck = await createSession(data);

    cookieStore.set({
      name: 'UserSessionId',
      value: sessioncheck.output,
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
    });

    return sessioncheck;
  }
  return data;
};
