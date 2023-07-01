import React, { ReactNode } from 'react';

import * as Checkbox from '@radix-ui/react-checkbox';

import { Check } from 'lucide-react';

interface Props {
  children?: ReactNode;
  id?: string;
  count?: number;
}

export function CheckboxFilter({ id, children, count }: Props) {
  return (
    <div className="ml-0.5 flex items-center gap-3 py-2">
      <Checkbox.Root
        className="flex h-6 w-6 appearance-none items-center justify-center border-2 border-gray-200 bg-white outline-none ring-2 ring-transparent hover:border-blue-primary focus:border-blue-primary focus:ring-blue-primary/20 aria-checked:border-blue-primary aria-checked:bg-blue-primary aria-checked:hover:border-blue-secondary aria-checked:hover:bg-blue-secondary"
        defaultChecked
        id={id}
      >
        <Checkbox.Indicator>
          <Check absoluteStrokeWidth className="stroke-white" size={16} />
        </Checkbox.Indicator>
      </Checkbox.Root>
      <label
        className="flex flex-1 cursor-pointer items-center text-base leading-normal"
        htmlFor={id}
      >
        {children}
        <span className="ml-3 text-gray-500">{count}</span>
      </label>
    </div>
  );
}
