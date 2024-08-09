import * as TabsPrimitive from '@radix-ui/react-tabs';
import { ReactNode } from 'react';

interface Tab {
  content: ReactNode;
  value: string;
}

interface Props {
  className?: string;
  defaultValue?: string;
  label: string;
  onValueChange: (value: string) => void;
  tabs: Tab[];
  value?: string;
}

export function Tabs({ className, defaultValue, label, tabs, ...props }: Props) {
  return (
    <TabsPrimitive.Root activationMode="manual" defaultValue={defaultValue} {...props}>
      <TabsPrimitive.List
        aria-label={label}
        className="mb-8 flex list-none items-start overflow-x-auto text-base"
      >
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            className="px-4 pb-2 data-[state=active]:border-b-4 data-[state=active]:border-primary data-[state=active]:text-primary"
            key={tab.value}
            value={tab.value}
          >
            {tab.value}
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
