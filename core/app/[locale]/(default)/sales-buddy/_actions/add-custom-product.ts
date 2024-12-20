'use server';

import { cookies } from "next/headers";

export const addCustomProduct = async (payload: {
  supplier: string;
  sku: string;
  cost: number;
  retailPrice: number;
  productName: string;
}) => {
  const cookieStore = await cookies();
  const cartId = cookieStore.get('cartId')?.value; 
  try {
    const { sku, cost, retailPrice, productName, supplier } = payload;
    const apiUrl = process.env.SALES_BUDDY_API_URL!;
    const apiEnv = process.env.SALES_BUDDY_API_ENV!;
    const apiPath = process.env.SALES_BUDDY_API_PATH!;
    const accessId = process.env.SALES_BUDDY_ACCESS_ID;

    let postData = JSON.stringify({
      "quantity": 1,
      "brand":supplier,
      "name": productName,
      "sku": sku, 
      "price": cost,
      "cost": retailPrice,        
      "cart_id": cartId,
      "access_id": accessId
    });

    console.log("=====postdata====",postData);

    let data = await fetch(
      `${apiUrl}${apiEnv}${apiPath}add-custom-product`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: postData,
      },
    ).then(res => res.json())
      .then(jsonData => {
        return jsonData;
      }).catch((error) => {
        return ({ status: 500, error: error.message });
      });
    return data;
  } catch (error) {
    return ({ status: 500, error: JSON.stringify(error) });
  }
}

