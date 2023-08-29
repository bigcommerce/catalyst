import { ComponentPropsWithoutRef } from 'react';

import type { Facet } from '../types';

import { Facets } from './facets';
import { RefineBy } from './refine-by';
import { SubCategories } from './sub-categories';

interface Props extends ComponentPropsWithoutRef<'aside'> {
  categoryId: number;
  facets: Facet[];
  headingId: string;
}

export const FacetedSearch = ({ categoryId, facets, headingId, ...props }: Props) => {
  return (
    <aside aria-labelledby={headingId} {...props}>
      <h2 className="sr-only" id={headingId}>
        Filters
      </h2>

      <SubCategories categoryId={categoryId} />

      <RefineBy facets={facets} />

      <Facets facets={facets} />
    </aside>
  );
};
