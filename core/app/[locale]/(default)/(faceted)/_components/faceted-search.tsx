import { useTranslations } from 'next-intl';
import { ComponentPropsWithoutRef, PropsWithChildren } from 'react';

import { Props as FacetProps, Facets } from './facets';
import { RefineBy, Props as RefineByProps } from './refine-by';

interface Props extends FacetProps, RefineByProps, ComponentPropsWithoutRef<'aside'> {
  headingId: string;
}

export const FacetedSearch = ({
  facets,
  headingId,
  pageType,
  children,
  ...props
}: PropsWithChildren<Props>) => {
  const t = useTranslations('FacetedGroup.FacetedSearch');

  return (
    <aside aria-labelledby={headingId} {...props}>
      <h2 className="sr-only" id={headingId}>
        {t('filters')}
      </h2>

      {children}

      <RefineBy facets={facets} pageType={pageType} />

      <Facets facets={facets} pageType={pageType} />
    </aside>
  );
};
