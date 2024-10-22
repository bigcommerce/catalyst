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

export const GetProductMetaFields = async (entityId: number, nameSpace: string) => {
  let metaFieldsArray: any = [];
  let productMetaFields: any = await getMetaFieldsByProduct(entityId, nameSpace, 1);
  if(productMetaFields?.data) {
    metaFieldsArray.push(...productMetaFields?.data);
    let totalPages = productMetaFields?.meta?.pagination?.total_pages;
    if(totalPages > 1) {
      for(let i=2; i<= totalPages; i++) {
        let productMeta: any = await getMetaFieldsByProduct(entityId, nameSpace, i);
        metaFieldsArray.push(...productMeta?.data);
      }
    }
  }
  return metaFieldsArray;
};

export const GetProductVariantMetaFields = async (entityId: number, variantId: number, nameSpace: string) => {
  let metaFieldsArray: any = [];
  let productMetaFields: any = await getMetaFieldsByProductVariant(entityId, variantId, nameSpace, 1);
  if(productMetaFields?.data) {
    metaFieldsArray.push(...productMetaFields?.data);
    let totalPages = productMetaFields?.meta?.pagination?.total_pages;
    if(totalPages > 1) {
      for(let i=2; i<= totalPages; i++) {
        let productMeta: any = await getMetaFieldsByProductVariant(entityId, variantId, nameSpace, i);
        metaFieldsArray.push(...productMeta?.data);
      }
    }
  }
  return metaFieldsArray;
};

const getMetaFieldsByProduct = async (entityId: number, nameSpace: string = '', page = 1) => {
  try {
    let nameSpaceValue = '';
    if(nameSpace) {
      nameSpaceValue = '&namespace='+nameSpace;
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
          revalidate: 3600 
        }
      },
    ).then(res => res.json())
    .then(jsonData => {
        return jsonData;
    });
    return productMetaFields;
  } catch (error) {
    console.error(error);
  }
};

const getMetaFieldsByProductVariant = async (entityId: Number, variantId: number, nameSpace: string = '', page = 1) => {
  try {
    let nameSpaceValue = '';
    if(nameSpace) {
      nameSpaceValue = '&namespace='+nameSpace;
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
          revalidate: 3600 
        }
      },
    ).then(res => res.json())
    .then(jsonData => {
        return jsonData;
    });
    return productMetaFields;
  } catch (error) {
    console.error(error);
  }
};