'use server';

import { cookies } from 'next/headers';

export const UpdateQuote = async (dataToSend: any) => {
  const cookieStore = await cookies();
  const cartId = cookieStore.get('cartId')?.value;

  try {
    const { quote_id, bc_customer_id, quote_type, qr_customer, qr_product, page_type } = dataToSend;
    const apiUrl = process.env.SALES_BUDDY_API_URL!;
    const apiPath = process.env.QUOTE_API_PATH!;
    const apiEnv = process.env.SALES_BUDDY_API_ENV!;
    const accessId = process.env.QUOTE_ACCESS_ID;
    const bc_channel_id = process.env.BIGCOMMERCE_CHANNEL_ID;

    console.log('API URL:', apiUrl, 'API Path:', apiPath);
    console.log('UpdateQuote API:', `${apiUrl}${apiEnv}${apiPath}update-quote`);
    // Prepare payload
    let postData = JSON.stringify({
      quote_id,
      quote_type,
      bc_channel_id,
      bc_customer_id,
      qr_customer,
      qr_product,
      page_type,
      access_id: accessId,
    });

    // Send request to backend API
    const response = await fetch(`${apiUrl}${apiEnv}${apiPath}update-quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: postData,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    // Parse response
    const jsonData = await response.json();
    return jsonData;
  } catch (error: any) {
    console.error('UpdateQuote Error:', error);
    return { status: 500, error: error.message || JSON.stringify(error) };
  }
};
