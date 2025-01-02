'use server';
export const get_product_by_entity_id = async (entityId: any) => {
  try {
    const apiUrl = process.env.SALES_BUDDY_API_URL!;
    const apiEnv = process.env.SALES_BUDDY_API_ENV!;
    const apiPath = process.env.SALES_BUDDY_API_PATH!;
    const accessId = process.env.SALES_BUDDY_ACCESS_ID;
    let postData = JSON.stringify({
      product_ids: entityId,
      access_id: accessId,
    });
    let data = await fetch(
      `${apiUrl}${apiEnv}${apiPath}get-product-info`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: postData,
      },
    )
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


export const get_cart_price_adjuster_data=async(cartId: any)=>{
  try {
    const apiUrl = process.env.SALES_BUDDY_API_URL!;
    const apiEnv = process.env.SALES_BUDDY_API_ENV!;
    const apiPath = process.env.SALES_BUDDY_API_PATH!;
    const accessId = process.env.SALES_BUDDY_ACCESS_ID;
    let postData = JSON.stringify({
      cart_id: cartId,
      access_id: accessId,
    });
    let data = await fetch(`${apiUrl}${apiEnv}${apiPath}get-cart-product-info`, {
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
}
