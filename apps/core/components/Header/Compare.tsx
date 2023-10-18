'use client';

import { Badge } from '@bigcommerce/reactant/Badge';
import { NavigationMenuLink } from '@bigcommerce/reactant/NavigationMenu';
import { Scale } from 'lucide-react';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { useCompareProductsContext } from '../../app/contexts/CompareProductsContext';

import { LinkNoCache } from './LinkNoCache';

const CompareLink = forwardRef<ElementRef<'a'>, ComponentPropsWithRef<'a'>>(({ children }, ref) => {
  const { productIds } = useCompareProductsContext();

  return (
    <NavigationMenuLink asChild ref={ref}>
      <LinkNoCache className="relative" href={`/compare?ids=${productIds.join(',')}`}>
        {children}
      </LinkNoCache>
    </NavigationMenuLink>
  );
});

export const Compare = forwardRef<ElementRef<'a'>, ComponentPropsWithRef<'a'>>((_, ref) => {
  const { productIds } = useCompareProductsContext();
  const count = productIds.length;

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
