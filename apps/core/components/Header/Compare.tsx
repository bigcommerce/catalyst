'use client';

import { Badge } from '@bigcommerce/reactant/Badge';
import { NavigationMenuLink } from '@bigcommerce/reactant/NavigationMenu';
import { Scale } from 'lucide-react';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { useCompareProductsContext } from '../../app/contexts/CompareProductsContext';

import { LinkNoCache } from './LinkNoCache';

export const Compare = forwardRef<ElementRef<'a'>, ComponentPropsWithRef<'a'>>((_, ref) => {
  const { productIds } = useCompareProductsContext();
  const selectedIds = Object.keys(productIds).filter((id) => productIds[id]);
  const count = selectedIds.length;

  return (
    <NavigationMenuLink asChild ref={ref}>
      <LinkNoCache className="relative" href={`/compare?ids=${selectedIds.join(',')}`}>
        <p role="status">
          <span className="sr-only">Compare Items</span>
          <Scale aria-hidden="true" />
          {Boolean(count) && <Badge>{count}</Badge>}
        </p>
      </LinkNoCache>
    </NavigationMenuLink>
  );
});
