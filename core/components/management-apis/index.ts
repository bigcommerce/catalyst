'use server';

import { cookies } from 'next/headers';

export const CheckProductFreeShipping = async (productId: string) => {
  try {
    let { data } = await fetch(
      `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/catalog/products/${productId}`,
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

    // Check if the product has free shipping
    const isFreeShipping = data?.is_free_shipping || false;
    return isFreeShipping;
  } catch (error) {
    console.error(error);
    return false;
  }
};

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
        next: {
          revalidate: 3600,
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

export const GetCustomerGroupById = async (id: number) => {
  try {
    let groupDetails = await fetch(
      `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v2/customer_groups/${id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
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
    return groupDetails;
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

export const getMetaFieldValue = async (entityId: number, variantId: number, namespace: string) => {
  const getMetaFields = async (entityId: number, variantId: number, namespace: string) => {
    let metaFields: any = await getMetaFieldsByProductVariant(entityId, variantId, namespace);
    if (metaFields?.data?.length > 0) {
      return metaFields.data.map((item: any) => item.value);
    }

    metaFields = await getMetaFieldsByProduct(entityId, namespace);
    if (metaFields?.data?.length > 0) {
      return metaFields.data.map((item: any) => item.value);
    }
    return null;
  };

  // Fetch closeout or delivery message based on namespace
  const metaFieldValues = await getMetaFields(entityId, variantId, namespace);

  if (metaFieldValues && namespace === 'Details') {
    return metaFieldValues;
  } else if (metaFieldValues && namespace === 'delivery_message') {
    const deliveryKey = metaFieldValues.join(',');
    try {
      const parsedValue = JSON?.parse(deliveryKey);
      return parsedValue;
    } catch (error) {
      return null;
    }
  }
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
    let nameSpaceValue = '';
    if (namespace) {
      nameSpaceValue = '&namespace=' + encodeURIComponent(namespace);
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

export const GetCartMetaFields = async (entityId: string, nameSpace?: string) => {
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

export const CreateOrderMetaFields = async (orderId: number, postData: any) => {
  try {
    let { data } = await fetch(
      `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/orders/${orderId}/metafields`,
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

export const GetOrderMetaFields = async (orderId: number) => {
  try {
    let { data } = await fetch(
      `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/orders/${orderId}/metafields`,
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

export const UpdateOrderData = async (
  orderId: number,
  staffNotes: string,
) => {
  try {
    const postData={
      staff_notes:staffNotes
    };
    let { data } = await fetch(
      `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v2/orders/${orderId}`,
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

export const GetOrderDetailsFromAPI = async (orderId : Number) => {
  try {
    let orderDetails = await fetch(
      `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v2/orders/${orderId}?include=consignments.line_items`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
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
    return orderDetails;
  } catch (error) {
    console.error(error);
  }
}

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
export const getCommonSettingByBrandChannel = async (brand: any) => {
  const commonSettingUrl = process?.env?.COMMON_SETTING_URL;

  const postData = {
    brand_ids: brand,
    channel_id: process?.env?.BIGCOMMERCE_CHANNEL_ID,
  };
  if (!commonSettingUrl) {
    return { output: [] };
  }
  try {
    const response = await fetch(`${commonSettingUrl}api/get-comman-settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error; // Re-throw the error to handle it in the calling component
  }
};

export const addCartLevelDiscount = async (checkoutId: string, postData: any) => {
  try {
    let { data } = await fetch(
      `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/checkouts/${checkoutId}/discounts`,
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
        return jsonData;
      });
    return data;
  } catch (error) {
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
        body: JSON.stringify({
          coupon_code: couponCode,
        }),
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

export const getGuestOrderDetailsFromAPI = async (orderId: any) => {
  try {
    let data = await fetch(
      `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v2/orders/${orderId}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
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

export const createGiftCardCoupon = async (amount: string, code: string) => {
  try {
    let data = await fetch(
      `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v2/gift_certificates`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          to_name: 'Kathir',
          to_email: 'kathir@arizon.digital',
          from_name: 'YuvaSri',
          from_email: 'yuvasri@arizon.digital',
          amount: amount,
          code: code,
          status: 'active',
          currency_code: 'USD',
        }),
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

export const processGiftCertificate = async (giftCode: string) => {
  try {
    let data = await fetch(
      `https://payments.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/payments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN, // Replace with the Payment Access Token
        },
        body: JSON.stringify({
          payment: {
            instrument: {
              type: 'gift_certificate',
              gift_certificate_code: giftCode,
            },
            payment_method_id: 'bigcommerce.gift_certificate',
          },
        }),
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

export const generateCouponPromotion = async (amount: string, productIds: any, code: string, name: string) => {
  try {
    let rulesObject: any = [];
    productIds?.forEach((product: any) => {
      if (product?.discounted_amount > 0) {
        rulesObject.push(`{
          "action": {
            "cart_items": {
              "discount": {
                "fixed_amount": "${product?.discounted_amount}"
              },
              "strategy": "LEAST_EXPENSIVE",
              "add_free_item": false,
              "as_total": true,
              "include_items_considered_by_condition": true,
              "exclude_items_on_sale": false,
              "items": {
                "products": [${product?.prodId}]
              }
            }
          },
          "apply_once": true,
          "stop": false,
          "condition": {
            "cart": {
              "items": {
                "products": [${product?.prodId}]
              },
              "minimum_quantity": 1
            }
          }
        }`);
      }
    });
    let promotionPayload = `{
        "name": "${name}-${amount}",
        "channels": [
          {
            "id": ${process.env.BIGCOMMERCE_CHANNEL_ID}
          }
        ],
        "rules": [${rulesObject}],
        "notifications": [],
        "stop": false,
        "currency_code": "USD",
        "redemption_type": "COUPON",
        "shipping_address": null,
        "current_uses": 0,
        "max_uses": 1,
        "start_date": "${new Date().toISOString()?.slice(0, 19) + '+00:00'}",
        "end_date": null,
        "status": "ENABLED",
        "can_be_used_with_other_promotions": true,
        "coupon_overrides_automatic_when_offering_higher_discounts": false,
        "display_name": "${name}-${amount}"
    }`;
    let data = await fetch(
      ` https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/promotions`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN, // Replace with the Payment Access Token
        },
        body: promotionPayload,
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

export const generateCouponCodeInPromotion = async (code: string, promoId: number) => {
  try {
    let promotionPayload = `{
      "code": "${code}",
      "max_uses": 1,
      "max_uses_per_customer": 1
    }`;
    let data = await fetch(
      ` https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/promotions/${promoId}/codes`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN, // Replace with the Payment Access Token
        },
        body: promotionPayload,
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

export const updateCouponPromotion = async (amount: any, productIds: any, id: number, name: string) => {
  try {
    let rulesObject: any = [];
    productIds?.forEach((product: any) => {
      if (product?.discounted_amount > 0) {
        rulesObject.push(`{
              "action": {
                "cart_items": {
                  "discount": {
                    "fixed_amount": "${product?.discounted_amount}"
                  },
                  "strategy": "LEAST_EXPENSIVE",
                  "add_free_item": false,
                  "as_total": true,
                  "include_items_considered_by_condition": true,
                  "exclude_items_on_sale": false,
                  "items": {
                    "products": [${product?.prodId}]
                  }
                }
              },
              "apply_once": true,
              "stop": false,
              "condition": {
                "cart": {
                  "items": {
                    "products": [${product?.prodId}]
                  },
                  "minimum_quantity": 1
                }
              }
       }`);
      }
    });
    let promotionPayload = `{
        "name": "${name}-${amount}",
        "channels": [
          {
            "id": ${process.env.BIGCOMMERCE_CHANNEL_ID}
          }
        ],
        "rules": [${rulesObject}],
        "notifications": [],
        "stop": false,
        "currency_code": "USD",
        "redemption_type": "COUPON",
        "shipping_address": null,
        "current_uses": 0,
        "max_uses": 1,
        "start_date": "${new Date().toISOString()?.slice(0, 19) + '+00:00'}",
        "end_date": null,
        "status": "ENABLED",
        "can_be_used_with_other_promotions": true,
        "coupon_overrides_automatic_when_offering_higher_discounts": false,
        "display_name": "${name}-${amount}"
    }`;
    let data = await fetch(
      ` https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/promotions/${id}`,
      {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN, // Replace with the Payment Access Token
        },
        body: promotionPayload,
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

// cookie-discounted-price-api
interface PriceUpdateData {
  cartId: string;
  price: number;
  productId: string;
  quantity: number;
}

// Main API function
export async function updateCartItemMaxPriceRuleDisccount(data: PriceUpdateData) {
  const url = `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/carts/${data.cartId}/items`;

  try {
    const lineItem = await getlineItem(data.productId, data.cartId);
    if (!lineItem) {
      throw new Error('Line item not found');
    }

    const updateUrl = `${url}/${lineItem.id}`;
    const response = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        line_item: {
          quantity: data.quantity,
          list_price: data.price,
          product_id: data.productId,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Price update successful:', result);
    return result;
  } catch (error) {
    console.error('Error updating cart price:', error);
    throw error;
  }
}

// Helper function
async function getlineItem(productId: string, cartId: string) {
  const url = `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/carts/${cartId}`;

  const response = await fetch(url, {
    headers: {
      'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  const lineItems = data.data.line_items.physical_items;

  return lineItems.find((item: any) => Number(item.product_id) === Number(productId));
}

export async function updateCartLineItemPrice(data: PriceUpdateData, lineItemId: string) {
  const url = `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/carts/${data.cartId}/items/${lineItemId}`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        line_item: {
          quantity: data.quantity,
          list_price: data.price,
          product_id: data.productId,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating cart price:', error);
    throw error;
  }
}
