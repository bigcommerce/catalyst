'use server';

export const updateProductPrice = async (newCost: any, cartId: any, productId: number,productType: string,sku:string) => {
    try {
        const apiUrl = process.env.SALES_BUDDY_API_URL!;
        const apiEnv = process.env.SALES_BUDDY_API_ENV!;
        const apiPath = process.env.SALES_BUDDY_API_PATH!;
        const accessId = process.env.SALES_BUDDY_ACCESS_ID;

        let postData = JSON.stringify({
            "product_id": productId,
            "price": newCost,
            "cart_id": cartId,
            "access_id": accessId,
            "sku":sku,
            "type":productType
        });

        let data = await fetch(
            apiUrl + apiEnv + apiPath + 'update-price',
            {
                method: 'PUT',
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