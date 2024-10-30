// common-variant-metafiled.tsx
import { removeEdgesAndNodes } from "@bigcommerce/catalyst-client";
import { GetProductMetaFields } from "~/components/management-apis";

interface Variant {
  entityId: number;
  sku: string;
}

interface Product {
  variants: Connection<Variant>; // This expects a Connection type
  sku: string;
  entityId: number;
}

interface Connection<T> {
  edges: Array<{ node: T }>;
  pageInfo: {
    hasNextPage: boolean;
    endCursor?: string;
  };
}

export const getVariantIdAndMetaFieldByProduct = async (product: Product, metaKey: string) => {
  // Get variant data and handle the Connection type
  const variantData = removeEdgesAndNodes(product?.variants) as unknown as Connection<Variant>; // Adjust as needed
  const getvariantData: Variant[] = variantData.edges.map((edge) => edge.node); // Extract the nodes

  const matchingVariant = getvariantData.find((variant: Variant) => variant.sku === product.sku);

  // If variant ID is found, proceed to fetch meta fields
  if (matchingVariant) {
    const entityId = product.entityId;
    const metaFields = await GetProductMetaFields(entityId, '');
    const metaField = metaFields.find((meta: any) => meta.key === metaKey);

    return {
      variantId: matchingVariant.entityId,
      metaField: metaField || null,
    };
  }

  // Return null for both if no matching SKU variant is found
  return {
    variantId: null,
    metaField: null,
  };
};