import { removeEdgesAndNodes } from "@bigcommerce/catalyst-client";
import { GetProductMetaFields } from "../management-apis";

export const getMetaFieldsByProduct = async (product: any, metaKey: string) => {
  let getvariantData = removeEdgesAndNodes(product?.variants);
  let entityId = product?.entityId;
  let variantId = 0;
  if(getvariantData) {
    let getvariant: any = getvariantData?.find((variant: any) => variant?.sku == product?.sku);
    if(getvariant) {
      variantId = getvariant?.entityId;
    }
  }
  let metaFields = await GetProductMetaFields(entityId, '');
  if(metaFields) {
    return metaFields?.find((meta:any) => meta.key == metaKey);
  }
}