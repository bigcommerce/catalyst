import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { GetProductMetaFields, GetProductVariantMetaFields } from '../management-apis';

interface MetaField {
  entityId: number;
  key: string;
  value: string;
  description?: string;
  id?: number;
  namespace?: string;
  resource_type?: string;
  resource_id?: number;
  date_created?: string;
  date_modified?: string;
  owner_client_id?: string;
}

interface MetaFieldResponse {
  metaField: MetaField | null;
  productMetaField: MetaField | null;
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

  let result: MetaFieldResponse = {
    metaField: null,
    productMetaField: null,
    message: '',
    hasVariantOptions: false,
    isVariantData: false,
  };

  // First get product level metadata
  const productMetaFields = await GetProductMetaFields(entityId, '');
  if (productMetaFields) {
    const productMeta = productMetaFields?.find((meta: MetaField) => meta.key === metaKey);
    if (productMeta) {
      result.productMetaField = productMeta;
    }
  }

  // Check if this SKU exists in variants
  const hasMatchingVariant = variantData?.some((variant: any) => variant.sku === product.sku);

  // Early return if there's no variant data at all
  if (!variantData || !Array.isArray(variantData) || variantData.length === 0) {
    if (result.productMetaField) {
      result.message = 'No variants available, showing product data only';
    }
    return result;
  }

  // Early return if there's no options data
  if (!optionsData || !Array.isArray(optionsData) || optionsData.length === 0) {
    if (result.productMetaField) {
      result.message = 'No variant options available, showing product data only';
    }
    return result;
  }

  // Early return if the current SKU doesn't match any variant
  if (!hasMatchingVariant) {
    if (result.productMetaField) {
      result.message = 'No matching variant found, showing product data only';
    }
    return result;
  }

  // Check if there are actual variant options
  const hasVariantOptions = optionsData.some((option: any) => option.isVariantOption === true);
  result.hasVariantOptions = hasVariantOptions;

  if (!hasVariantOptions) {
    if (result.productMetaField) {
      result.message = 'No variant options, showing product data only';
    }
    return result;
  }

  // If we have variant options, try to get variant-specific data
  const variantId = await getVariantId(product);
  if (variantId) {
    const variantMetaFields = await GetProductVariantMetaFields(entityId, variantId, '');
    if (variantMetaFields && variantMetaFields.length > 0) {
      const variantMeta = variantMetaFields.find((meta: MetaField) => meta.key === metaKey);
      if (variantMeta) {
        result.metaField = variantMeta;
        result.isVariantData = true;

        // Only set this message if we actually have both variant and product data
        if (result.productMetaField) {
          result.message = 'Found both variant and product data';
        } else {
          result.message = 'Found variant data only';
        }
        return result;
      }
    }
  }

  // If we got here and have product data, it means we checked for variants but found none
  if (result.productMetaField) {
    result.message = 'No variant data found, showing product data only';
  } else {
    result.message = 'No data found';
  }

  return result;
};