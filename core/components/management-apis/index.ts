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
    )
      .then((res) => res.json())
      .then((jsonData) => {
        return jsonData;
      });
    return customerData;
  } catch (error) {
    console.error(error);
  }
};

export const GetEmailId = async (email: string) => {
  try {
    let emailId = await fetch(
      `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/customers?email:in=${email}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
        },
      },
    )
      .then((res) => res.json())
      .then((jsonData) => {
        return jsonData;
      });
    return emailId;
  } catch (error) {
    console.error(error);
  }
};

export const GetProductMetaFields = async (entityId: number, nameSpace: string) => {
  let metaFieldsArray: any = [];
  let productMetaFields: any = await getMetaFieldsByProduct(entityId, nameSpace, 1);
  if (productMetaFields?.data) {
    metaFieldsArray.push(...productMetaFields?.data);
    let totalPages = productMetaFields?.meta?.pagination?.total_pages;
    if (totalPages > 1) {
      for (let i = 2; i <= totalPages; i++) {
        let productMeta: any = await getMetaFieldsByProduct(entityId, nameSpace, i);
        metaFieldsArray.push(...productMeta?.data);
      }
    }
  }
  return metaFieldsArray;
};

export const getDeliveryMessage = async (
  entityId: number,
  variantId: number
) => {
  const channelId = process.env.BIGCOMMERCE_CHANNEL_ID;

  // Attempt to get meta fields by product variant
  let metaFields: any = await getMetaFieldsByProductVariant(
    entityId,
    variantId,
    "delivery_message",
  );

  // Check if metaFields has data
  if ( metaFields.data.length > 0) {
    const deliveryMessage = metaFields.data

    if (deliveryMessage) {
      const deliveryKey = deliveryMessage?.[0]?.['value']?.split('|'); //split by "|"
      const result = deliveryKey?.map((item: any) => {
        const parts = item.split(':'); // Split by ':'
        const id = parseInt(parts[0].trim(), 10); // Get the ID
        const value = parts.slice(1).join(':').trim().replace(/: Backorder/g, '').trim(); //trimed ":Backorder" add in value
        return { id, value };
    }) || [];

      // Parse the channelId as an integer (if it exists)
      const parsedChannelId = channelId ? parseInt(channelId, 10) : null;
      // Find the matched delivery based on channelId
      const matchedDelivery = parsedChannelId !== null ? result.find((item: any) => item.id === parsedChannelId) : null;

      if (matchedDelivery) {
        return matchedDelivery.value; // Return the value of the matched delivery
      }
    }
  }

  // If no data from getMetaFieldsByProductVariant, try getMetaFieldsByProduct
  metaFields = await getMetaFieldsByProduct(entityId, "delivery_message");
  if (metaFields && metaFields.data && metaFields.data.length > 0) {
    const deliveryMessage = metaFields.data

    if (deliveryMessage) {
      // Split the delivery message by '|' and parse it
      const deliveryKey = deliveryMessage?.[0]?.['value']?.split('|');
      const result = deliveryKey?.map((item: any) => {
        const [id, value] = item.split(':').map((str: any) => str.trim()); // Split and trim
        return { id: parseInt(id, 10), value };
      });

      // Parse the channelId as an integer (if it exists)
      const parsedChannelId = channelId ? parseInt(channelId, 10) : null;

      // Find the matched delivery based on channelId
      const matchedDelivery = parsedChannelId !== null ? result.find((item: any) => item.id === parsedChannelId) : null;

      if (matchedDelivery) {
        return matchedDelivery.value; // Return the value of the matched delivery
      }
    }
  }

  // Return null if no delivery message is found in either call
  return null;
};

export const GetProductVariantMetaFields = async (
  entityId: number,
  variantId: number,
  nameSpace: string,
) => {
  let metaFieldsArray: any = [];
  let productMetaFields: any = await getMetaFieldsByProductVariant(
    entityId,
    variantId,
    nameSpace,
    1,
  );
  if (productMetaFields?.data) {
    metaFieldsArray.push(...productMetaFields?.data);
    let totalPages = productMetaFields?.meta?.pagination?.total_pages;
    if (totalPages > 1) {
      for (let i = 2; i <= totalPages; i++) {
        let productMeta: any = await getMetaFieldsByProductVariant(
          entityId,
          variantId,
          nameSpace,
          i,
        );
        metaFieldsArray.push(...productMeta?.data);
      }
    }
  }
  return metaFieldsArray;
};

const getMetaFieldsByProduct = async (entityId: number, nameSpace: string = '', page = 1) => {
  try {
    let nameSpaceValue = '';
    if (nameSpace) {
      nameSpaceValue = '&namespace=' + nameSpace;
    }
    let productMetaFields = await fetch(
      `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/catalog/products/${entityId}/metafields?page=${page}${nameSpaceValue}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
        },
        next: {
          revalidate: 3600,
        },
      },
    )
      .then((res) => res.json())
      .then((jsonData) => {
        return jsonData;
      });
    return productMetaFields;
  } catch (error) {
    console.error(error);
  }
};



const getMetaFieldsByProductVariant = async (
  entityId: Number,
  variantId: number,
  namespace: string = '',
  page = 1,
) => {
  try {
    console.log("namespace", namespace)
    let nameSpaceValue = '';
    if (namespace) {
      nameSpaceValue = '&namespace=' + encodeURIComponent(namespace);;
    }
    let productMetaFields = await fetch(
      `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/catalog/products/${entityId}/variants/${variantId}/metafields?page=${page}${nameSpaceValue}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
        },
        next: {
          revalidate: 3600,
        },
      },
    )
      .then((res) => res.json())
      .then((jsonData) => {
        // console.log("jsonData", jsonData);
        return jsonData;
      });
    return productMetaFields;
  } catch (error) {
    console.error(error);
  }
};

export const UpdateCartLineItems = async (entityId: string, itemId: string, postData: any) => {
  try {
    let { data } = await fetch(
      `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/carts/${entityId}/items/${itemId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
        },
        body: JSON.stringify(postData),
        cache: 'no-store',
      },
    )
      .then((res) => res.json())
      .then((jsonData) => {
        return jsonData;
      });
    return data;
  } catch (error) {
    console.error(error);
  }
};

export const UpdateCartMetaFields = async (
  entityId: string,
  metaFieldId: string,
  postData: any,
) => {
  try {
    let { data } = await fetch(
      `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/carts/${entityId}/metafields/${metaFieldId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
        },
        body: JSON.stringify(postData),
        cache: 'no-store',
      },
    )
      .then((res) => res.json())
      .then((jsonData) => {
        return jsonData;
      });
    return data;
  } catch (error) {
    console.error(error);
  }
};

export const CreateCartMetaFields = async (entityId: string, postData: any) => {
  try {
    let { data } = await fetch(
      `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/carts/${entityId}/metafields`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
        },
        body: JSON.stringify(postData),
        cache: 'no-store',
      },
    )
      .then((res) => res.json())
      .then((jsonData) => {
        return jsonData;
      });
    return data;
  } catch (error) {
    console.error(error);
  }
};

export const RemoveCartMetaFields = async (entityId: string, metaId: number) => {
  try {
    let { data } = await fetch(
      `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/carts/${entityId}/metafields/${metaId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
        },
        cache: 'no-store',
      },
    )
      .then((res) => res?.json())
      .then((jsonData) => {
        return jsonData;
      });
    return data;
  } catch (error) {
    console.error(error);
  }
};

export const GetCartMetaFields = async (entityId: string, nameSpace: string) => {
  try {
    let nameSpaceValue = '';
    if (nameSpace) {
      nameSpaceValue = '?namespace=' + nameSpace;
    }
    let { data } = await fetch(
      `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/carts/${entityId}/metafields${nameSpaceValue}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
        },
        cache: 'no-store',
      },
    )
      .then((res) => res.json())
      .then((jsonData) => {
        return jsonData;
      });
    return data;
  } catch (error) {
    console.error(error);
  }
};

export const GetVariantsByProductId = async (entityId: Number) => {
  try {
    let { data } = await fetch(
      `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/catalog/products/${entityId}/variants`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
        },
        next: {
          revalidate: 3600,
        },
      },
    )
      .then((res) => res.json())
      .then((jsonData) => {
        return jsonData;
      });
    return data;
  } catch (error) {
    console.error(error);
  }
};

export const GetProductBySKU = async (sku: string) => {
  try {
    let { data } = await fetch(
      `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/catalog/products?sku:in=${sku}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
        },
        next: {
          revalidate: 3600,
        },
      },
    )
      .then((res) => res.json())
      .then((jsonData) => {
        return jsonData;
      });
    return data;
  } catch (error) {
    console.error(error);
  }
};

export const GetProductImagesById = async (id: Number) => {
  try {
    let { data } = await fetch(
      `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/catalog/products?sku:in=${sku}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
        },
        next: {
          revalidate: 3600,
        },
      },
    )
      .then((res) => res.json())
      .then((jsonData) => {
        return jsonData;
      });
    return data;
  } catch (error) {
    console.error(error);
  }
};
export const getCommonSettingByBrandChannel = async (brand) => {
  const commonSettingUrl=process?.env?.COMMON_SETTING_URL
  const postData = {
    brand_ids: brand,
    channel_id: process?.env?.BIGCOMMERCE_CHANNEL_ID,
  };
  if (!commonSettingUrl) { return { output: [] }; }
    try {
      const response = await fetch(`${commonSettingUrl}api/get-comman-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
        cache: 'no-store',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      throw error; // Re-throw the error to handle it in the calling component
    }
  
};

export const updateProductDiscount = async (checkoutId: string, postData: any) => {
  try {
    let { data } = await fetch(
      `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/checkouts/${checkoutId}/discounts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
        },
        body: postData,
        cache: 'no-store',
      },
    )
      .then((res) => res.json())
      .then((jsonData) => {
        console.log('========JSON===cal====', jsonData);
        return jsonData;
      });
    return data;
  } catch (error) {
    console.log('========error=======', error);
    console.error(error);
  }
};

export const deleteCouponCodeFromCart = async (checkoutId: string, couponCode: string) => {
  try {
    let { data } = await fetch(
      `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/checkouts/${checkoutId}/coupons/${couponCode}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
        },
        cache: 'no-store',
      },
    )
      .then((res) => res.json())
      .then((jsonData) => {
        console.log('========jsonData=delete======', jsonData);
        return jsonData;
      });
    return data;
  } catch (error) {
    console.error(error);
  }
};

export const addCouponCodeToCart = async (checkoutId: string, couponCode: string) => {
  try {
    let { data } = await fetch(
      `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/checkouts/${checkoutId}/coupons`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
        },
        body: {
          "coupon_code": couponCode,
          "version": 1
        },
        cache: 'no-store',
      },
    )
      .then((res) => res.json())
      .then((jsonData) => {
        console.log('========jsonData=add======', jsonData);
        return jsonData;
      });
    return data;
  } catch (error) {
    console.error(error);
  }
};

export const getGuestOrderDetailsFromAPI = async (orderId: any) => {
  try {
    let data = await fetch(
      `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v2/orders/${orderId}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
        },
        cache: 'no-store',
      },
    )
      .then((res) => res.json())
      .then((jsonData) => {
        return jsonData;
      });
    return data;
  } catch (error) {
    console.error(error);
  }
}
