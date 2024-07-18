import * as TabsPrimitive from '@radix-ui/react-tabs';
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react';

import { cn } from '~/lib/utils';

type Tab = {
  content: React.ReactNode;
  title: string | React.ReactNode;
  value: string;
};
interface Props {
  className?: string;
  defaultValue?: string;
  tabs: Tab[];
}

export function Tabs({ className, tabs, defaultValue }: Props) {
  return (
    <TabsPrimitive.Root activationMode="manual" defaultValue={defaultValue} className={className}>
      <TabsPrimitive.List className="mb-8 flex list-none items-start overflow-x-auto text-base">
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.value}
            className={
              'px-4 pb-2 data-[state=active]:border-b-4 data-[state=active]:border-primary data-[state=active]:text-primary'
            }
            value={tab.value}
          >
            {tab.title}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {tabs.map((tab) => (
        <TabsPrimitive.Content key={tab.value} value={tab.value}>
          {tab.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
