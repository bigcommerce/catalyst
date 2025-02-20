'use server';
import { cookies } from 'next/headers';
import { getSessionUserDetails } from '~/auth';
import { findCustomerDetails } from './find-customer';
import { InsertShopperVisitedUrl } from './insert-shopper-url';

export const getSessionIdCookie = async () => {
  const cookieStore = await cookies();

  return cookieStore.get('sessionId');
};
export const getCartIdCookie = async () => {
  const cookieStore = await cookies();

  return cookieStore.get('cartId');
};
export const getPMXFromCookies = async () => {
  const cookieStore = await cookies();
  if (cookieStore.get('pmx')?.value == undefined) {
    return ""
  }else{
    return cookieStore.get('pmx')?.value;
  }
};
// pmx

export const RemoveSessionIdCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete('sessionId');
};

export const createSession = async (Userdata: any) => {
  var  pmxdata=await getPMXFromCookies()  
  try {
    let postData = JSON.stringify({
      cart_id: Userdata?.cart_id,
      referral_id: Userdata?.referral_id,
      customer_id: Userdata?.customerDetails.id ?? 0,
      customer_group_id: Userdata?.customerDetails?.customer_group_id ?? 0,
      customer_name: Userdata?.customerDetails?.first_name+" "+ Userdata?.customerDetails?.last_name ,
      customer_emailid: Userdata?.customerDetails?.email ?? "",
      shopper_information: Userdata?.shopper_information,
      pmx: pmxdata,
      access_id: process.env.SALES_BUDDY_ACCESS_ID,
    });
    const apiUrl = process.env.SALES_BUDDY_API_URL!;
    const apiEnv = process.env.SALES_BUDDY_API_ENV!;
    const apiPath = process.env.SALES_BUDDY_API_PATH!;
    let data = await fetch(apiUrl + apiEnv + apiPath + 'create-session-id', {
      method: 'POST',
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
    //return ({status : 200, output: 1234567890 });
  } catch (error) {
    return { status: 500, error: JSON.stringify(error) };
  }
};



export const createSessionIdCookie = async (localMachineInformation: any, fullUrl: string) => {
  const cookieStore = await cookies();
  const hasCookie = cookieStore.has('sessionId');
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
    shopper_information: localMachineInformation,
    customerDetails: responseData,
  };
  if (!hasCookie) {
    let sessioncheck = await createSession(data);
    InsertShopperVisitedUrl(sessioncheck.output, fullUrl);
    cookieStore.set({
      name: 'sessionId',
      value: sessioncheck.output,
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
    });

    return sessioncheck;
  }
};
