import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import {
  fetchFacetedSearch,
  PublicSearchParamsSchema,
  PublicToPrivateParams,
} from '~/app/[locale]/(default)/(faceted)/fetch-faceted-search';
import { ExistingResultType } from '~/client/util';

export const facetsTransformer2 = async ({
  facets,
  searchParams,
}: {
  facets: ExistingResultType<typeof fetchFacetedSearch>['facets']['items'];
  searchParams: z.input<typeof PublicSearchParamsSchema>;
}) => {
  const t = await getTranslations('Faceted.FacetedSearch.Facets');
  const { filters } = PublicToPrivateParams.parse(searchParams);

  return facets.map((facet) => {
    if (facet.__typename === 'CategorySearchFilter') {
      return {
        type: 'toggle-group' as const,
        paramName: 'categoryIn',
        label: facet.name,
        defaultCollapsed: facet.isCollapsedByDefault,
        options: facet.categories.map((category) => {
          const refinedCategory = facet.categories.find((c) => c.entityId === category.entityId);
          const isSelected = filters.categoryEntityIds?.includes(category.entityId) === true;

          return {
            label: category.name,
            value: category.entityId.toString(),
            disabled: refinedCategory == null && !isSelected,
          };
        }),
      };
    }

    if (facet.__typename === 'BrandSearchFilter') {
      return {
        type: 'toggle-group' as const,
        paramName: 'brand',
        label: facet.name,
        defaultCollapsed: facet.isCollapsedByDefault,
        options: facet.brands.map((brand) => {
          const refinedBrand = facet.brands.find((b) => b.entityId === brand.entityId);
          const isSelected = filters.brandEntityIds?.includes(brand.entityId) === true;

          return {
            label: brand.name,
            value: brand.entityId.toString(),
            disabled: refinedBrand == null && !isSelected,
          };
        }),
      };
    }

    if (facet.__typename === 'ProductAttributeSearchFilter') {
      return {
        type: 'toggle-group' as const,
        paramName: `attr_${facet.filterName}`,
        label: facet.filterName,
        options: facet.attributes.map((attribute) => {
          const refinedAttribute = facet.attributes.find((a) => a.value === attribute.value);

          const isSelected =
            filters.productAttributes?.some((attr) => attr.values.includes(attribute.value)) ===
            true;

          return {
            label: attribute.value,
            value: attribute.value,
            disabled: refinedAttribute == null && !isSelected,
          };
        }),
      };
    }

    if (facet.__typename === 'RatingSearchFilter') {
      const isSelected = filters.rating?.minRating != null;

      return {
        type: 'rating' as const,
        paramName: 'minRating',
        label: facet.name,
        disabled: !isSelected,
      };
    }

    if (facet.__typename === 'PriceSearchFilter') {
      const isSelected = filters.price?.minPrice != null || filters.price?.maxPrice != null;

      return {
        type: 'range' as const,
        minParamName: 'minPrice',
        maxParamName: 'maxPrice',
        label: facet.name,
        min: facet.selected?.minPrice ?? undefined,
        max: facet.selected?.maxPrice ?? undefined,
        disabled: !isSelected,
      };
    }

    if (facet.freeShipping) {
      const isSelected = filters.isFreeShipping === true;

      return {
        type: 'toggle-group' as const,
        paramName: `shipping`,
        label: t('freeShippingLabel'),
        options: [
          {
            label: t('freeShippingLabel'),
            value: 'free_shipping',
            disabled: !isSelected,
          },
        ],
      };
    }

    if (facet.isFeatured) {
      const isSelected = filters.isFeatured === true;

      return {
        type: 'toggle-group' as const,
        paramName: `isFeatured`,
        label: t('isFeaturedLabel'),
        options: [
          {
            label: t('isFeaturedLabel'),
            value: 'on',
            disabled: !isSelected,
          },
        ],
      };
    }

    if (facet.isInStock) {
      const isSelected = filters.hideOutOfStock === true;

      return {
        type: 'toggle-group' as const,
        paramName: `stock`,
        label: t('inStockLabel'),
        options: [
          {
            label: t('inStockLabel'),
            value: 'in_stock',
            disabled: !isSelected,
          },
        ],
      };
    }

    return null;
  });
};
