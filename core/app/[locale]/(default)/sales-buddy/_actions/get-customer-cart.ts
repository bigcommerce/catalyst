'use server';

export const getCustomerCart = async (cartId: any) => {
  try {
    let postData = JSON.stringify({
      cart_id: cartId,
      access_id: process.env.SALES_BUDDY_ACCESS_ID,
    });

    const apiUrl = process.env.SALES_BUDDY_API_URL!;
    const apiEnv = process.env.SALES_BUDDY_API_ENV!;
    const apiPath = process.env.SALES_BUDDY_API_PATH!;
    console.log(postData);
    // return;    
    let data = await fetch(apiUrl + apiEnv + apiPath +'get-cart', {
      method: 'post',
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

      console.log('getCsutomercartData----', data);
      
    return data;
  } catch (error) {
    return { status: 500, error: JSON.stringify(error) };
  }
};
