'use server';

import { cookies } from "next/headers";

export const addComment = async (payload: {
    comment: string;
    action: string;
}) => {
    const cookieStore = await cookies();
    const cartId = cookieStore.get('cartId')?.value;
    try {
        const { comment, action } = payload;
        const apiUrl = process.env.SALES_BUDDY_API_URL!;
        const apiEnv = process.env.SALES_BUDDY_API_ENV!;
        const apiPath = process.env.SALES_BUDDY_API_PATH!;
        const accessId = process.env.SALES_BUDDY_ACCESS_ID;

        let postData = JSON.stringify({
            "comments": comment,
            "action": action,
            "cart_id": cartId,
            "access_id": accessId
        });
        let data = await fetch(
            `${apiUrl}${apiEnv}${apiPath}add-order-comments`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: postData,
            },
        ).then(res => res.json())
        .then(jsonData => {
                return { status: 200, data: jsonData };
            }).catch((error) => {
                return ({ status: 500, error: error.message });
            });
        return data;
    } catch (error) {
        return ({ status: 500, error: JSON.stringify(error) });
    }
}


export const GetComment = async () => {
  const cookieStore = await cookies();
  const cartId = cookieStore.get('cartId')?.value;
  try {
    const apiUrl = process.env.SALES_BUDDY_API_URL!;
    const apiEnv = process.env.SALES_BUDDY_API_ENV!;
    const apiPath = process.env.SALES_BUDDY_API_PATH!;
    const accessId = process.env.SALES_BUDDY_ACCESS_ID;

    let postData = JSON.stringify({
      cart_id: cartId,
      access_id: accessId,
    });
    let data = await fetch(`${apiUrl}${apiEnv}${apiPath}get-order-comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: postData,
    })
      .then((res) => res.json())
      .then((jsonData) => {
        return { status: 200, data: jsonData };
      })
      .catch((error) => {
        return { status: 500, error: error.message };
      });
    return data;
  } catch (error) {
    return { status: 500, error: JSON.stringify(error) };
  }
};

