import { getTranslations } from 'next-intl/server';

import { fetchFacetedSearch } from '~/app/[locale]/(default)/(faceted)/fetch-faceted-search';
import { ExistingResultType } from '~/client/util';

export const facetsTransformer = async (
  facets: ExistingResultType<typeof fetchFacetedSearch>['facets']['items'],
) => {
  const t = await getTranslations('FacetedGroup.FacetedSearch.Facets');

  return facets.map((facet) => {
    if (facet.__typename === 'CategorySearchFilter') {
      return {
        type: 'other' as const,
        name: 'categoryIn',
        title: facet.name,
        defaultCollapsed: facet.isCollapsedByDefault,
        options: facet.categories.map((category) => ({
          label: category.name,
          value: category.entityId.toString(),
          amount: facet.displayProductCount ? category.productCount : undefined,
          defaultSelected: category.isSelected,
        })),
      };
    }

    if (facet.__typename === 'BrandSearchFilter') {
      return {
        type: 'other' as const,
        name: 'brand',
        title: facet.name,
        defaultCollapsed: facet.isCollapsedByDefault,
        options: facet.brands.map((brand) => ({
          label: brand.name,
          value: brand.entityId.toString(),
          amount: facet.displayProductCount ? brand.productCount : undefined,
          defaultSelected: brand.isSelected,
        })),
      };
    }

    if (facet.__typename === 'ProductAttributeSearchFilter') {
      return {
        type: 'other' as const,
        name: `attr_${facet.filterName}`,
        title: facet.filterName,
        defaultCollapsed: facet.isCollapsedByDefault,
        options: facet.attributes.map((attribute) => ({
          label: attribute.value,
          value: attribute.value,
          amount: facet.displayProductCount ? attribute.productCount : undefined,
          defaultSelected: attribute.isSelected,
        })),
      };
    }

    if (facet.__typename === 'RatingSearchFilter') {
      return {
        type: 'rating' as const,
        name: 'minRating',
        title: facet.name,
        defaultCollapsed: facet.isCollapsedByDefault,
        options: facet.ratings.map((rating) => ({
          label: `Rating ${rating.value} & up`,
          value: rating.value,
          amount: rating.productCount,
          defaultSelected: rating.isSelected,
        })),
      };
    }

    if (facet.__typename === 'PriceSearchFilter') {
      return {
        type: 'range' as const,
        min: 'minPrice',
        max: 'maxPrice',
        title: facet.name,
        defaultCollapsed: facet.isCollapsedByDefault,
        options: {
          min: {
            value: facet.selected?.minPrice ?? undefined,
          },
          max: {
            value: facet.selected?.maxPrice ?? undefined,
          },
        },
      };
    }

    const otherOptions = [];

    if (facet.freeShipping) {
      otherOptions.push({
        label: t('freeShippingLabel'),
        key: 'shipping',
        value: 'free_shipping',
        amount: facet.displayProductCount ? facet.freeShipping.productCount : undefined,
        defaultSelected: facet.freeShipping.isSelected,
      });
    }

    if (facet.isFeatured) {
      otherOptions.push({
        label: t('isFeaturedLabel'),
        key: 'isFeatured',
        value: 'on',
        amount: facet.displayProductCount ? facet.isFeatured.productCount : undefined,
        defaultSelected: facet.isFeatured.isSelected,
      });
    }

    if (facet.isInStock) {
      otherOptions.push({
        label: t('inStockLabel'),
        key: 'stock',
        value: 'in_stock',
        amount: facet.displayProductCount ? facet.isInStock.productCount : undefined,
        defaultSelected: facet.isInStock.isSelected,
      });
    }

    return {
      type: 'other' as const,
      name: facet.name,
      title: facet.name,
      defaultCollapsed: facet.isCollapsedByDefault,
      options: otherOptions,
    };
  });
};
