'use client';

import { Badge } from '@bigcommerce/reactant/Badge';
import { NavigationMenuLink } from '@bigcommerce/reactant/NavigationMenu';
import { Scale } from 'lucide-react';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { useCompareProductsContext } from '../../app/contexts/CompareProductsContext';

import { LinkNoCache } from './LinkNoCache';

const CompareLink = forwardRef<ElementRef<'a'>, ComponentPropsWithRef<'a'>>(({ children }, ref) => {
  const { productIds } = useCompareProductsContext();

  const ids = Object.keys(productIds)
    .filter((id) => productIds[id])
    .join(',');

  return (
    <NavigationMenuLink asChild ref={ref}>
      <LinkNoCache className="relative" href={`/compare?ids=${ids}`}>
        {children}
      </LinkNoCache>
    </NavigationMenuLink>
  );
});

export const Compare = forwardRef<ElementRef<'a'>, ComponentPropsWithRef<'a'>>((_, ref) => {
  const { productIds } = useCompareProductsContext();
  const count = Object.keys(productIds).filter((id) => productIds[id]).length;

  return (
    <CompareLink ref={ref}>
      <p role="status">
        <span className="sr-only">Compare Items</span>
        <Scale aria-hidden="true" />
        {Boolean(count) && <Badge>{count}</Badge>}
      </p>
    </CompareLink>
  );
});
