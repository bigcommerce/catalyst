'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Tag, TagAction, TagContent } from '~/components/ui/tag';

import type { Facet, PageType, PublicParamKeys } from '../types';

export interface Props {
  facets: Facet[];
  pageType: PageType;
}

interface FacetProps<Key extends string> {
  key: Key;
  display_name: string;
  value: string;
}

const mapFacetsToRefinements = ({ facets, pageType }: Props) =>
  facets
    .map<Array<FacetProps<string>>>((facet) => {
      switch (facet.__typename) {
        case 'BrandSearchFilter':
          if (pageType === 'brand') {
            return [];
          }

          return facet.brands
            .filter((brand) => brand.isSelected)
            .map<FacetProps<PublicParamKeys>>(({ name, entityId }) => ({
              key: 'brand',
              display_name: name,
              value: String(entityId),
            }));

        case 'CategorySearchFilter':
          if (pageType === 'category') {
            return [];
          }

          return facet.categories
            .filter((category) => category.isSelected)
            .map<FacetProps<PublicParamKeys>>(({ name, entityId }) => ({
              key: 'categoryIn',
              display_name: name,
              value: String(entityId),
            }));

        case 'RatingSearchFilter':
          return facet.ratings
            .filter((rating) => rating.isSelected)
            .map<FacetProps<PublicParamKeys>>(({ value }) => ({
              key: 'minRating',
              display_name: `Rating ${value} & up`,
              value,
            }));

        case 'ProductAttributeSearchFilter':
          return facet.attributes
            .filter(({ isSelected }) => isSelected)
            .map<FacetProps<string>>(({ value }) => {
              return {
                key: `attr_${facet.filterName}`,
                display_name: value,
                value,
              };
            });

        case 'OtherSearchFilter': {
          const { freeShipping, isFeatured, isInStock } = facet;

          const shipping: FacetProps<PublicParamKeys> | undefined = freeShipping?.isSelected
            ? {
                key: 'shipping',
                display_name: 'Free Shipping',
                value: 'free_shipping',
              }
            : undefined;

          const stock: FacetProps<PublicParamKeys> | undefined = isInStock?.isSelected
            ? {
                key: 'stock',
                display_name: 'In Stock',
                value: 'in_stock',
              }
            : undefined;

          const featured: FacetProps<PublicParamKeys> | undefined = isFeatured?.isSelected
            ? {
                key: 'isFeatured',
                display_name: 'Is Featured',
                value: 'on',
              }
            : undefined;

          return [shipping, stock, featured].filter(
            (props): props is FacetProps<PublicParamKeys> => props !== undefined,
          );
        }

        default:
          return [];
      }
    })
    .flat();

export const RefineBy = (props: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const refinements = mapFacetsToRefinements(props);
  const t = useTranslations('FacetedGroup.FacetedSearch.RefineBy');

  const removeRefinement = (refinement: FacetProps<string>) => {
    const filteredParams = Array.from(searchParams.entries()).filter(
      ([key, value]) => refinement.key !== key || refinement.value !== value,
    );

    const params = new URLSearchParams(filteredParams);

    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllRefinements = () => {
    router.push(pathname);
  };

  if (!refinements.length) {
    return null;
  }

  return (
    <div>
      <div className="flex flex-row items-center justify-between pb-2">
        <h3 className="text-2xl font-bold">{t('refineBy')}</h3>
        {/* TODO: Make subtle variant */}
        <button className="font-semibold text-primary" onClick={clearAllRefinements}>
          {t('clearAllRefinements')}
        </button>
      </div>
      <ul className="mb-4 flex flex-row flex-wrap gap-2 py-2">
        {refinements.map((refinement) => (
          <li key={`${refinement.key}-${refinement.value}`}>
            <Tag>
              <TagContent>{refinement.display_name}</TagContent>
              <TagAction onClick={() => removeRefinement(refinement)} />
            </Tag>
          </li>
        ))}
      </ul>
    </div>
  );
};
