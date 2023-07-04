import React, { ReactNode, useState } from 'react';

import * as Select from '@radix-ui/react-select';
import { Warning } from '../Warning';
import clsx from 'clsx';

import { Check, ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface Props {
  className?: string;
  value?: string;
  options: Option[];
}

export function SelectMenu({ className, value, options }: Props) {
  const [selectedOption, setSelectedOption] = useState(value);

  return (
    <div className={clsx(className, 'relative')}>
      <Select.Root value={selectedOption} onValueChange={setSelectedOption}>
        <Select.Trigger
          className="group inline-flex h-12 w-full items-center gap-2 truncate border-2 border-gray-200 bg-white px-4 text-left leading-none text-black outline-none ring-4 ring-transparent hover:border-blue-primary focus:border-blue-primary focus:ring-blue-primary/20 data-[placeholder]:text-black"
          aria-label="Sort by"
        >
          <Select.Value />
          <Select.Icon className="absolute right-4">
            <ChevronDown className="group-hover:stroke-blue-primary" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Content position="popper" className="w-[var(--radix-select-trigger-width)]" asChild>
          <div className="absolute top-full z-10 bg-white py-2 shadow-lg shadow-gray-600/10">
            {options?.map((option, i) => (
              <Select.Item
                key={i}
                value={option.value}
                className="relative cursor-pointer select-none truncate py-2 pl-4 pr-14 text-base data-[disabled]:pointer-events-none data-[highlighted]:bg-blue-secondary/10 data-[highlighted]:text-blue-primary data-[highlighted]:outline-none"
              >
                <Select.ItemText className="truncate">{option.label}</Select.ItemText>
                <Select.ItemIndicator className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Check size={20} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </div>
        </Select.Content>
      </Select.Root>
    </div>
  );
}
