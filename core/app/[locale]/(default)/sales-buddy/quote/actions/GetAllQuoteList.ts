'use server';

import { cookies } from "next/headers";

export const GetAllQuoteList = async () => {
  const cookieStore = await cookies();
  const cartId = cookieStore.get('cartId')?.value;
  try {
    // const { quote_id, bc_customer_id, quote_type, qr_customer, qr_product,page_type } = dataToSend 
    const apiUrl = process.env.SALES_BUDDY_API_URL!;
    const apiPath = process.env.SALES_BUDDY_API_PATH!;
    const accessId = process.env.QUOTE_ACCESS_ID;
    const bc_channel_id = process.env.BIGCOMMERCE_CHANNEL_ID;
    console.log(apiUrl, apiPath);
    
    let data = await fetch('http://localhost:3003/quote-api/v1/get-all-quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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

