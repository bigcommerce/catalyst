import { Sliders } from 'lucide-react';
import { Suspense } from 'react';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { Button } from '@/vibes/soul/primitives/button';
import * as SidePanel from '@/vibes/soul/primitives/side-panel';

import { Filter, FiltersPanel } from './filters-panel';

export function MobileFilters({
  label = 'Filters',
  filters,
}: {
  label?: string;
  filters: Streamable<Filter[]>;
}) {
  return (
    <SidePanel.Root>
      <SidePanel.Trigger asChild>
        <Button size="medium" variant="secondary">
          {label}
          <span className="hidden @xl:block">
            <Sliders size={20} />
          </span>
        </Button>
      </SidePanel.Trigger>
      <SidePanel.Content title={label}>
        <Suspense>
          <FiltersPanel filters={filters} />
        </Suspense>
      </SidePanel.Content>
    </SidePanel.Root>
  );
}
