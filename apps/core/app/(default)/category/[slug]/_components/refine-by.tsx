'use client';

import { Tag, TagAction, TagContent } from '@bigcommerce/reactant/Tag';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';

import { fetchCategory, PublicSearchParamsSchema } from '../fetchCategory';

interface Props {
  facets: Awaited<ReturnType<typeof fetchCategory>>['facets'];
}

interface FacetProps<Key extends string> {
  key: Key;
  display_name: string;
  value: string;
}

const publicParamKeys = PublicSearchParamsSchema.keyof();

type PublicParamKeys = z.infer<typeof publicParamKeys>;

const mapFacetsToRefinements = (facets: Props['facets']) =>
  facets.items
    .map<Array<FacetProps<PublicParamKeys | string>>>((facet) => {
      switch (facet.__typename) {
        case 'BrandSearchFilter':
          return facet.brands
            .filter((brand) => brand.isSelected)
            .map<FacetProps<PublicParamKeys>>(({ name, entityId }) => ({
              key: 'brand',
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
                key: facet.filterName,
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

export const RefineBy = ({ facets }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const refinements = mapFacetsToRefinements(facets);

  const removeRefinement = (refinement: FacetProps<string>) => {
    const filteredParams = Array.from(searchParams.entries()).filter(
      ([key, value]) => refinement.key !== key || refinement.value !== value,
    );

    const params = new URLSearchParams(filteredParams);

    return router.push(`${pathname}?${params.toString()}`);
  };

  if (!refinements.length) {
    return null;
  }

  return (
    <div>
      <div className="flex flex-row items-center justify-between pb-2">
        <h3 className="text-h5">Refine by</h3>
        {/* TODO: Make subtle variant */}
        <button className="font-semibold text-blue-primary">Clear all</button>
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
