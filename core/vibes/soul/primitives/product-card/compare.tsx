'use client';

import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs';
import { startTransition } from 'react';

import { Checkbox } from '@/vibes/soul/form/checkbox';

import { useCompareDrawer } from '../compare-drawer';

interface CompareDrawerItem {
  id: string;
  image?: { src: string; alt: string };
  href: string;
  title: string;
}

interface Props {
  colorScheme?: 'light' | 'dark';
  paramName?: string;
  label?: string;
  product: CompareDrawerItem;
}

export const Compare = function Compare({
  colorScheme = 'light',
  paramName = 'compare',
  label = 'Compare',
  product,
}: Props) {
  const [, setParam] = useQueryState(
    paramName,
    parseAsArrayOf(parseAsString).withOptions({ shallow: false }),
  );

  const { optimisticItems, setOptimisticItems } = useCompareDrawer();

  return (
    <Checkbox
      checked={!!optimisticItems.find((item) => item.id === product.id)}
      colorScheme={colorScheme}
      label={label}
      onCheckedChange={(value) => {
        void setParam((prev) => {
          const next =
            value === true
              ? [...(prev ?? []), product.id]
              : (prev ?? []).filter((v) => v !== product.id);

          startTransition(() => {
            setOptimisticItems({
              type: value ? 'add' : 'remove',
              item: product,
            });
          });

          return next.length > 0 ? next : null;
        });
      }}
    />
  );
};
