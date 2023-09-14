import { ComponentPropsWithoutRef, PropsWithChildren } from 'react';

import { Props as FacetProps, Facets } from './facets';
import { RefineBy } from './refine-by';

interface Props extends FacetProps, ComponentPropsWithoutRef<'aside'> {
  headingId: string;
}

export const FacetedSearch = ({
  facets,
  headingId,
  pageType,
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

      <Facets facets={facets} pageType={pageType} />
    </aside>
  );
};
