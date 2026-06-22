import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { PromotionCalloutItem } from '@/vibes/soul/primitives/promotion-callout';

import type { fetchFacetedSearch } from './fetch-faceted-search';

type FacetedSearchResult = Awaited<ReturnType<typeof fetchFacetedSearch>>;

export function streamPromotionCallouts(
  streamableFacetedSearch: Streamable<FacetedSearchResult>,
): Streamable<PromotionCalloutItem[]> {
  return Streamable.from(async () => {
    const search = await streamableFacetedSearch;
    const seen = new Set<string>();

    return search.products.items
      .flatMap((product) =>
        removeEdgesAndNodes(product.featuredPromotions).map((promo) => ({
          id: promo.entityId.toString(),
          text: promo.text,
        })),
      )
      .filter(({ id }) => {
        if (seen.has(id)) return false;
        seen.add(id);

        return true;
      });
  });
}
