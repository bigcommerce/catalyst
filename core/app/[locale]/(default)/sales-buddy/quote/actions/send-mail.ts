'use server';

import { cookies } from "next/headers";

export const CreateCartForQouteItems = async (quote_id: any) => {
  const cookieStore = await cookies();
  const cartId = cookieStore.get('cartId')?.value;
  try {
    
    const apiUrl = process.env.SALES_BUDDY_API_URL!;
    const apiPath = process.env.QUOTE_API_PATH!;
    const apiEnv = process.env.SALES_BUDDY_API_ENV!;
    const accessId = process.env.SALES_BUDDY_ACCESS_ID!;
    let postData = JSON.stringify({
      quote_id: quote_id,
      access_id: accessId,
    });
    let data = await fetch(`${apiUrl}${apiEnv}${apiPath}create-cart`, {
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
  } catch (error) {
    return { status: 500, error: JSON.stringify(error) };
  }
};

