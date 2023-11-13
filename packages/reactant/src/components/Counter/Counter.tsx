import { ChevronDown, ChevronUp } from 'lucide-react';
import { ComponentPropsWithRef, ElementRef, forwardRef, useRef, useState } from 'react';

import { cs } from '../../utils/cs';

interface CounterProps extends Omit<ComponentPropsWithRef<'input'>, 'onChange'> {
  defaultValue?: number;
  onChange?: (value: number | string) => void | Promise<void>;
}

export const Counter = forwardRef<ElementRef<'div'>, CounterProps>(
  (
    {
      children,
      className,
      defaultValue = 0,
      disabled = false,
      max: maxProp = Infinity,
      min: minProp = 0,
      onChange,
      step: stepProp = 1,
      type,
      value: valueProp,
      ...props
    },
    ref,
  ) => {
    const [value, setValue] = useState<number | string>(defaultValue);
    const inputRef = useRef<ElementRef<'input'>>(null);

    const currValue = Number(valueProp) || Number(value);
    const min = Number(minProp);
    const max = Number(maxProp);
    const step = Number(stepProp);

    const isInteger = Number(stepProp) % 1 === 0;

    return (
      <div className={cs('relative')} ref={ref}>
        <button
          aria-hidden="true"
          aria-label="Decrease count"
          className={cs(
            'peer/down absolute start-0 top-0 flex h-full w-12 items-center justify-center focus:outline-none disabled:text-gray-200',
          )}
          disabled={currValue <= min || disabled}
          onClick={async () => {
            if (onChange) {
              await onChange(currValue - step);
            } else {
              setValue(currValue - step);
            }

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
          disabled={value === max || disabled}
          onClick={async () => {
            if (onChange) {
              await onChange(currValue + step);
            } else {
              setValue(currValue + step);
            }

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
          max={max}
          min={min}
          onBlur={async (e) => {
            const valueAsNumber = e.target.valueAsNumber;

            if (Number.isNaN(valueAsNumber)) {
              return;
            }

            if (valueAsNumber < min) {
              if (onChange) {
                await onChange(min);
              } else {
                setValue(min);
              }
            } else if (valueAsNumber > max) {
              if (onChange) {
                await onChange(max);
              } else {
                setValue(max);
              }
            }
          }}
          onChange={async (e) => {
            const valueAsNumber =
              isInteger && !Number.isNaN(e.target.valueAsNumber)
                ? Math.trunc(e.target.valueAsNumber)
                : e.target.valueAsNumber;

            if (Number.isNaN(valueAsNumber)) {
              if (onChange) {
                await onChange('');
              } else {
                setValue('');
              }

              return;
            }

            if (onChange) {
              await onChange(valueAsNumber);
            } else {
              setValue(valueAsNumber);
            }
          }}
          step={step}
          type="number"
          value={valueProp || value}
          {...props}
          ref={inputRef}
        />
      </div>
    );
  },
);

Counter.displayName = 'Counter';
