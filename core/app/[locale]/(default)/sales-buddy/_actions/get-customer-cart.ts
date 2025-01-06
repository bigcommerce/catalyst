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
        return cartId;
      })
      .catch((error) => {
        return { status: 500, error: error.message };
      });

      
    return data;
  } catch (error) {
    return { status: 500, error: JSON.stringify(error) };
  }
};


export const getCustomerUrlSession_id = async (cartId: any) => {
  try {
    const postData = JSON.stringify({
      session_id: cartId,
      access_id: process.env.SALES_BUDDY_ACCESS_ID,
    });

    const apiUrl = process.env.SALES_BUDDY_API_URL!;
    const apiEnv = process.env.SALES_BUDDY_API_ENV!;
    const apiPath = process.env.SALES_BUDDY_API_PATH!;

    const response = await fetch(apiUrl + apiEnv + apiPath + 'get-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: postData,
    });

    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the JSON response
    const jsonData = await response.json();    
    // UpdateCartIdCookie(cartId)
    return jsonData;
  } catch (error) {
    console.error('Error fetching session data:', error);
    return {
      status: 500,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
