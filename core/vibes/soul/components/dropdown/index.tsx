'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemProps,
  DropdownMenuTrigger,
  DropdownMenuTriggerProps,
} from '@radix-ui/react-dropdown-menu';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { Label } from '@/vibes/soul/components/label';

interface Props {
  label: string;
  labelOnTop?: boolean;
  style?: 'round' | 'rectangle';
  items: Array<{
    textValue: string;
    onSelect: DropdownMenuItemProps['onSelect'];
    selected?: boolean;
  }>;
}

export const Dropdown = function Dropdown({
  label,
  labelOnTop = false,
  style = 'rectangle',
  items,
  ...props
}: Props & DropdownMenuTriggerProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  return (
    <div>
      {Boolean(label) && labelOnTop && (
        <Label className="mb-2 block text-foreground">{label}</Label>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          className={clsx(
            style === 'rectangle' ? 'rounded-xl' : 'rounded-full',
            'flex h-fit w-full select-none items-center justify-between gap-3 border border-contrast-100 bg-white p-2 px-5 py-3 font-medium text-foreground',
            'text-sm ring-primary transition-colors hover:bg-contrast-100 focus-visible:outline-none focus-visible:ring-2',
          )}
          {...props}
        >
          {selectedItem ?? label}
          <ChevronDown className="w-5 text-foreground transition-transform" strokeWidth={1.5} />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-50 mt-2 max-h-80 w-full overflow-y-scroll rounded-xl bg-background p-2 shadow-[2px_4px_24px_#00000010] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 @4xl:-ml-14 @4xl:rounded-3xl @4xl:p-4">
          {items.map((item) => (
            <DropdownMenuItem
              className={clsx(
                'w-full cursor-default select-none rounded-xl px-3 py-2 text-sm font-medium text-contrast-400 outline-none transition-colors',
                'hover:bg-contrast-100 hover:text-foreground @4xl:text-base',
                {
                  'text-foreground': item.selected,
                },
              )}
              key={item.textValue}
              onSelect={item.onSelect}
            >
              {item.textValue}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
