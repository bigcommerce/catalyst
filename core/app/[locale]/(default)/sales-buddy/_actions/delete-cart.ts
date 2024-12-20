'use server';

import { cookies } from "next/headers";

export const deleteCart = async () => {
  const cookieStore = await cookies();
  const cartId = cookieStore.get('cartId')?.value;

  if(cartId == undefined){
    return ({ status: 500, error: "Please Check Cart Id" });
  }else{
    try {
      const apiUrl = process.env.SALES_BUDDY_API_URL!;
      const apiEnv = process.env.SALES_BUDDY_API_ENV!;
      const apiPath = process.env.SALES_BUDDY_API_PATH!;
      const accessId = process.env.SALES_BUDDY_ACCESS_ID;

      let postData = JSON.stringify({
        "cart_id": cartId,
        "access_id": accessId
      });
      const endPoint = `${apiUrl}${apiEnv}${apiPath}delete-cart`
      let data = await fetch(endPoint,
        {
          method: 'DELETE',
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
}