'use server';

import { cookies } from "next/headers";

export const CreateQuote = async (dataToSend:any) => {
  const cookieStore = await cookies();
  const cartId = cookieStore.get('cartId')?.value;
  try {
    const { quote_id, bc_customer_id, quote_type, qr_customer, qr_product, page_type, quote_by } =
      dataToSend; 
     const apiUrl = process.env.SALES_BUDDY_API_URL!;
     const apiPath = process.env.QUOTE_API_PATH!;
     const apiEnv = process.env.SALES_BUDDY_API_ENV!;
    const accessId = process.env.QUOTE_ACCESS_ID;
    const bc_channel_id = process.env.BIGCOMMERCE_CHANNEL_ID;
    console.log(apiUrl, apiPath);
    let postData = JSON.stringify({
        quote_id: quote_id,
        quote_type:quote_type,
        bc_channel_id: bc_channel_id,
        bc_customer_id: bc_customer_id,
        qr_customer:qr_customer,
        qr_product: qr_product,
        page_type:page_type,
        access_id: accessId,
        quote_by:quote_by
    });
    console.log("{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{",dataToSend);
    
    let data = await fetch(`${apiUrl}${apiEnv}${apiPath}create-quote`, {
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
}
catch (error) {
    return { status: 500, error: JSON.stringify(error) };
  }
};

