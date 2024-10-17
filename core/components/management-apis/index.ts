'use server';
export const GetCustomerById = async (entityId: Number) => {
    try {
        let customerData = await fetch(
          `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/customers?id:in=${entityId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
            },
          },
        ).then(res => res.json())
        .then(jsonData => {
            return jsonData;
        });
        return customerData;
      } catch (error) {
        console.error(error);
      }
};