import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { GetProductMetaFields, GetProductVariantMetaFields } from '../management-apis';

interface MetaField {
  entityId: number;
  key: string;
  value: string;
}

interface MetaFieldResponse {
  metaField: MetaField | null;
  productMetaField: MetaField | null; // Added for product metadata
  message: string;
  hasVariantOptions: boolean;
  isVariantData: boolean;
}

export const getVariantId = async (product: any) => {
  let getvariantData = removeEdgesAndNodes(product?.variants);
  if (getvariantData) {
    let getvariant: any = getvariantData?.find((variant: any) => variant?.sku === product?.sku);
    if (getvariant) {
      return getvariant?.entityId;
    }
  }
  return null;
};

export const getMetaFieldsByProduct = async (
  product: any,
  metaKey: string,
): Promise<MetaFieldResponse> => {
  let entityId = product?.entityId;
  let variantData: any = removeEdgesAndNodes(product?.variants);
  let optionsData: any = removeEdgesAndNodes(product?.productOptions);

  console.log('========variantData=======', variantData);
  console.log('========optionsData=======', optionsData);

  let result: MetaFieldResponse = {
    metaField: null,
    productMetaField: null, // Added for product metadata
    message: '',
    hasVariantOptions: false,
    isVariantData: false,
  };

  // Get product metafields regardless of variant status

  const productMetaFields = await GetProductMetaFields(entityId, '');
  if (productMetaFields) {
    const productMeta = productMetaFields?.find((meta: MetaField) => meta.key === metaKey);
    if (productMeta) {
      result.productMetaField = productMeta;
    }
  }

  // Check if variant data exists and SKU matches
  const hasMatchingVariant = variantData?.some((variant: any) => variant.sku === product.sku);

  // Check if both variant data and options data are available and valid
  if (
    variantData &&
    Array.isArray(variantData) &&
    variantData.length > 0 &&
    optionsData &&
    Array.isArray(optionsData) &&
    optionsData.length > 0 &&
    hasMatchingVariant
  ) {
    // Check if there are any variant options
    const hasVariantOptions = optionsData.some((option: any) => option.isVariantOption === true);
    result.hasVariantOptions = hasVariantOptions;

    if (hasVariantOptions) {
      const variantId = await getVariantId(product);
      if (variantId) {
        const variantMetaFields = await GetProductVariantMetaFields(entityId, variantId, '');
        if (variantMetaFields && variantMetaFields.length > 0) {
          const variantMeta = variantMetaFields.find((meta: MetaField) => meta.key === metaKey);
          if (variantMeta) {
            result.metaField = variantMeta;
            result.message = 'Found both variant and product data';
            result.isVariantData = true;
            return result;
          }
        }
      }
      // If variant metadata not found but hasVariantOptions is true
      if (result.productMetaField) {
        result.message = 'No variant data found, showing product data only';
        result.isVariantData = false;
      }
    } else {
      // If no variant options but product metadata exists
      if (result.productMetaField) {
        result.message = 'No variant options, showing product data only';
        result.isVariantData = false;
      }
    }
  } else {
    // If no variant data at all but product metadata exists
    if (result.productMetaField) {
      result.message = 'No variant data available, showing product data only';
      result.isVariantData = false;
    }
  }

  return result;
};
