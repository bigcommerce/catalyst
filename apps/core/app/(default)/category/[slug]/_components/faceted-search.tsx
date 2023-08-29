'use client';

import { useId } from 'react';

import { fetchCategory } from '../fetchCategory';

import { Facets } from './facets';
import { RefineBy } from './refine-by';
import { SubCategories } from './sub-categories';

interface Props {
  categoryId: number;
  facets: Awaited<ReturnType<typeof fetchCategory>>['facets'];
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
