import { BigCommerceResponse, FetcherInput } from '../fetcher';
import { generateQueryOp, QueryGenqlSelection, QueryResult } from '../generated';

export interface GetBrandOptions {
  brandId: number;
}

export const getBrand = async <T>(
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
  { brandId }: GetBrandOptions,
  config: T = {} as T,
) => {
  const query = {
    site: {
      brand: {
        __args: {
          entityId: brandId,
        },
        entityId: true,
        name: true,
        path: true,
        searchKeywords: true,
        seo: {
          __scalar: true,
        },
      },
    },
  } satisfies QueryGenqlSelection;

  const queryOp = generateQueryOp(query);

  const response = await customFetch<QueryResult<typeof query>>({
    ...queryOp,
    ...config,
  });

  const brand = response.data.site.brand;

  if (!brand) {
    return undefined;
  }

  return brand;
};
