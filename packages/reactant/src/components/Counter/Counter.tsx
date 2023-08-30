import { ChevronDown, ChevronUp } from 'lucide-react';
import { ComponentPropsWithRef, ElementRef, forwardRef, useRef, useState } from 'react';

import { cs } from '../../utils/cs';

export const Counter = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'input'>>(
  ({ className, children, type, value: valueProp = 1, onChange, disabled, ...props }, ref) => {
    const [value, setValue] = useState(Number(valueProp));

    const inputRef = useRef<ElementRef<'input'>>(null);

    return (
      <div className={cs('relative')} ref={ref}>
        <button
          aria-hidden="true"
          aria-label="Decrease count"
          className={cs(
            'peer/down absolute start-0 top-0 flex h-full w-12 items-center justify-center focus:outline-none disabled:text-gray-200',
          )}
          disabled={value <= 1 || disabled}
          onClick={() => {
            setValue(value - 1);
            inputRef.current?.focus();
          }}
          tabIndex={-1}
          type="button"
        >
          <ChevronDown />
        </button>
        <button
          aria-hidden="true"
          aria-label="Increase count"
          className={cs(
            'peer/up absolute end-0 top-0 flex h-full w-12 items-center justify-center focus:outline-none disabled:text-gray-200',
          )}
          disabled={disabled}
          onClick={() => {
            setValue(value + 1);
            inputRef.current?.focus();
          }}
          tabIndex={-1}
          type="button"
        >
          <ChevronUp />
        </button>
        <input
          className={cs(
            'focus:ring-primary-blue/20 peer/input w-full border-2 border-gray-200 px-12 py-2.5 text-center text-base placeholder:text-gray-500 hover:border-blue-primary focus:border-blue-primary focus:outline-none focus:ring-4 disabled:bg-gray-100 disabled:hover:border-gray-200 peer-hover/down:border-blue-primary peer-hover/up:border-blue-primary peer-hover/down:disabled:border-gray-200 peer-hover/up:disabled:border-gray-200 [&::-webkit-inner-spin-button]:appearance-none',
            className,
          )}
          disabled={disabled}
          onChange={(e) => {
            setValue(e.target.valueAsNumber);

            onChange?.(e);
          }}
          type="number"
          value={value}
          {...props}
          ref={inputRef}
        />
      </div>
    );
  },
);
