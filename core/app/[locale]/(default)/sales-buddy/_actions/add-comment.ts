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
        const apiUrl = process.env.SALES_BUDDY_API_URL_SERVER!;
        const apiEnv = process.env.SALES_BUDDY_API_ENV_SERVER!;
        const apiPath = process.env.SALES_BUDDY_API_PATH_SERVER!;
        const accessId = process.env.SALES_BUDDY_ACCESS_ID;

        let postData = JSON.stringify({
            "comments": comment,
            "action": action,
            "cart_id": cartId,
            "access_id": accessId
        });
console.log("====postData=======",postData);
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
                return jsonData;
            }).catch((error) => {
                return ({ status: 500, error: error.message });
            });
        return data;
    } catch (error) {
        return ({ status: 500, error: JSON.stringify(error) });
    }
}

