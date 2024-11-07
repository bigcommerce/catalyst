import { Sliders } from 'lucide-react';

import { Button } from '@/vibes/soul/primitives/button';
import * as SidePanel from '@/vibes/soul/primitives/side-panel';

import { Filter, FiltersPanel } from './filters-panel';
import { Suspense, use } from 'react';

type Props = {
  filters: Filter[] | Promise<Filter[]>;
  label?: string;
};

export function MobileFilters(props: Props) {
  return (
    <Suspense fallback={null}>
      <MobileFiltersInner {...props} />
    </Suspense>
  );
}

export function MobileFiltersInner({ filters, label = 'Filters' }: Props) {
  const resolved = filters instanceof Promise ? use(filters) : filters;

  if (resolved.length === 0) return null;

  return (
    <SidePanel.Root>
      <SidePanel.Trigger asChild>
        <Button variant="secondary" size="medium">
          {label}
          <span className="hidden @xl:block">
            <Sliders size={20} />
          </span>
        </Button>
      </SidePanel.Trigger>
      <SidePanel.Content title={label}>
        <FiltersPanel filters={resolved} />
      </SidePanel.Content>
    </SidePanel.Root>
  );
}
