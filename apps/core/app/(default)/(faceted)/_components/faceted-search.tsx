import { ComponentPropsWithoutRef, PropsWithChildren } from 'react';

import type { Facet } from '../types';

import { Facets } from './facets';
import { RefineBy } from './refine-by';

interface Props extends ComponentPropsWithoutRef<'aside'> {
  facets: Facet[];
  headingId: string;
}

export const FacetedSearch = ({
  facets,
  headingId,
  children,
  ...props
}: PropsWithChildren<Props>) => {
  return (
    <aside aria-labelledby={headingId} {...props}>
      <h2 className="sr-only" id={headingId}>
        Filters
      </h2>

      {children}

      <RefineBy facets={facets} />

      <Facets facets={facets} />
    </aside>
  );
};
