'use server';

import { revalidatePath } from "next/cache";

export const updateProductQuantity = async (cartId: any, quantity: number, sku: string) => {
  try {
    const apiUrl = process.env.SALES_BUDDY_API_URL!;
    const apiEnv = process.env.SALES_BUDDY_API_ENV!;
    const apiPath = process.env.SALES_BUDDY_API_PATH!;
    const accessId = process.env.SALES_BUDDY_ACCESS_ID;

    let postData = JSON.stringify({
      cart_id: cartId,
      sku: sku,
      quantity: quantity,
      access_id: accessId,
    });

    let data = await fetch(apiUrl + apiEnv + apiPath + 'update-qty', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: postData,
      cache: 'no-store',
    })
      .then((res) => res.json())
      .then((jsonData) => {
        revalidatePath('/cart');
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
