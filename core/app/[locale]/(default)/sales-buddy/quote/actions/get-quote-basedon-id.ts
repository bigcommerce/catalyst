'use server';

import { cookies } from "next/headers";

export const GetQuoteBasedOnID = async (QuoteId) => {
  const cookieStore = await cookies();
  const cartId = cookieStore.get('cartId')?.value;
   const apiUrl = process.env.SALES_BUDDY_API_URL!;
   const apiPath = process.env.QUOTE_API_PATH!;
   const apiEnv = process.env.SALES_BUDDY_API_ENV!;
  try {
    // const { quote_id, bc_customer_id, quote_type, qr_customer, qr_product,page_type } = dataToSend
    const apiUrl = process.env.SALES_BUDDY_API_URL!;
    const apiPath = process.env.SALES_BUDDY_API_PATH!;
    const accessId = process.env.QUOTE_ACCESS_ID;
    const bc_channel_id = process.env.BIGCOMMERCE_CHANNEL_ID;
    console.log(apiUrl, apiPath);
    var Inputdata = JSON.stringify({ quote_id: QuoteId });
    let data = await fetch(`${apiUrl}${apiEnv}${apiPath}get-quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: Inputdata,
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

