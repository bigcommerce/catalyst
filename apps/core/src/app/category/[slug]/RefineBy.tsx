import { Tag, TagAction, TagContent } from '@bigcommerce/reactant/Tag';
import z from 'zod';

import { fetchCategory, PublicSearchParamsSchema } from './fetchCategory';

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
                value: '1',
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
  const refinements = mapFacetsToRefinements(facets);

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
        {refinements.map((param) => (
          <li key={`${param.key}-${param.value}`}>
            <Tag>
              <TagContent>{param.display_name}</TagContent>
              <TagAction />
            </Tag>
          </li>
        ))}
      </ul>
    </div>
  );
};
