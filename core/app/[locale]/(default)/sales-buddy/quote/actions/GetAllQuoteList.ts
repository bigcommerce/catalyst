'use server';

import { cookies } from "next/headers";

export const GetAllQuoteList = async (inputData:any) => {
  const cookieStore = await cookies();
  const cartId = cookieStore.get('cartId')?.value;
  try {
    // const { quote_id, bc_customer_id, quote_type, qr_customer, qr_product,page_type } = dataToSend 
    const apiUrl = process.env.SALES_BUDDY_API_URL!;
    const apiPath = process.env.QUOTE_API_PATH!;
    const apiEnv = process.env.SALES_BUDDY_API_ENV!;
    const accessId = process.env.QUOTE_ACCESS_ID;
    const bc_channel_id = process.env.BIGCOMMERCE_CHANNEL_ID;
    console.log(apiUrl, apiPath);
    const inputs = {
      quote_id: inputData.qouteId ?? '',
      company_name: inputData.company ?? '',
      first_name: inputData.firstName ?? '',
      last_name: inputData.lastName ?? '',
      requested_date: inputData.dateFrom ?? '',
    };
    console.log('GetAllQuoteList Api-----------------', `${apiUrl}${apiEnv}${apiPath}list-quote`);
     let data = await fetch(`${apiUrl}${apiEnv}${apiPath}list-quote`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify(inputs),
     })
       .then((res) => res.json())
       .then((jsonData) => {
         return jsonData;
       })
       .catch((error) => {
         return { status: 500, error: error.message };
       });
      return data;
}
catch (error) {
    return { status: 500, error: JSON.stringify(error) };
  }
};

