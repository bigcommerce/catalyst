'use server';

export const updateProductPrice = async (price: any, cartId : any, productId:number) => {
    try {
        let postData = JSON.stringify({
            "price": price,
            "product_id": productId,
            "cart_id": cartId,
            "access_id": process.env.SALES_BUDDY_ACCESS_ID,
            "type":"product"
        });
        const apiUrl = process.env.SALES_BUDDY_API_URL!;
        const apiEnv = process.env.SALES_BUDDY_API_ENV!;
        const apiPath = process.env.SALES_BUDDY_API_PATH!; 
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
            return ({status : 500, error: error.message});
        });
        return data;
      } catch (error) {
        return ({status : 500, error: JSON.stringify(error)});
      }
}