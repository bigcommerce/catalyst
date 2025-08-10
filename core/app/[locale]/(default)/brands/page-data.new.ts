import { cache } from 'react';
import { getBrandsRest } from '~/client/queries/get-brands';
import { getProductsByIds } from '~/client/queries/get-products';

// Fetch brands using BigCommerce REST API, then fetch entities using GraphQL by entityIds
export const getBrandsData = cache(async ({ page = 1, limit = 20 } = {}) => {
  // 1. Fetch brands from REST API, sorted by name
  const restResult = await getBrandsRest({ page, limit });
  if (restResult.status !== 'success' || !restResult.brands) {
    return { brands: [], pageInfo: restResult.meta?.pagination || null, error: restResult.error };
  }

  // 2. Extract entityIds (brand ids)
  const entityIds = restResult.brands.map((b) => b.id);
  if (!entityIds.length) {
    return { brands: [], pageInfo: restResult.meta?.pagination || null };
  }

  // 3. Fetch entities by entityIds using GraphQL (if needed, e.g. for richer data)
  //    Here, we use getProductsByIds as an example; replace with actual brand GraphQL query if available
  //    If not needed, you can skip this step or adjust as needed
  //    const gqlResult = await getBrandsByIds(entityIds); // If such a function exists

  // 4. Return brands and pagination info
  return {
    brands: restResult.brands,
    pageInfo: restResult.meta?.pagination || null,
  };
});
