'use client';

import { useId } from 'react';

import type { Facet } from '../types';

import { Facets } from './facets';
import { RefineBy } from './refine-by';
import { SubCategories } from './sub-categories';

interface Props {
  categoryId: number;
  facets: Facet[];
}

export const FacetedSearch = ({ categoryId, facets }: Props) => {
  const id = useId();

  return (
    <aside aria-labelledby={id} className="hidden lg:block">
      <h2 className="sr-only" id={id}>
        Filters
      </h2>

      <SubCategories categoryId={categoryId} />

      <RefineBy facets={facets} />

      <Facets facets={facets} />
    </aside>
  );
};
