import { ChevronDown, ChevronUp } from 'lucide-react';
import { ComponentPropsWithRef, ElementRef, forwardRef, useRef, useState } from 'react';

import { cs } from '../../utils/cs';

interface CounterProps extends Omit<ComponentPropsWithRef<'input'>, 'onChange'> {
  isIntegerOnly?: boolean;
  onChange?: (value: number | string) => void | Promise<void>;
}

export const Counter = forwardRef<ElementRef<'div'>, CounterProps>(
  (
    {
      children,
      className,
      disabled,
      isIntegerOnly = true,
      max: maxProp,
      min: minProp = 0,
      onChange,
      step: stepProp = 1,
      type,
      value: valueProp = 1,
      ...props
    },
    ref,
  ) => {
    const [value, setValue] = useState<number | string>(Number(valueProp));
    const currValue = onChange ? Number(valueProp) : value;
    const inputRef = useRef<ElementRef<'input'>>(null);

    const min = Number(minProp);
    const max = Number(maxProp);
    const step = Number(stepProp);

    return (
      <div className={cs('relative')} ref={ref}>
        <button
          aria-hidden="true"
          aria-label="Decrease count"
          className={cs(
            'peer/down absolute start-0 top-0 flex h-full w-12 items-center justify-center focus:outline-none disabled:text-gray-200',
          )}
          disabled={Number(currValue) <= min || disabled}
          onClick={async () => {
            if (onChange) {
              await onChange(Number(currValue) - step);
            } else {
              setValue(Number(currValue) - step);
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
          disabled={(max && Number(currValue) === max) || disabled}
          onClick={async () => {
            if (onChange) {
              await onChange(Number(currValue) + step);
            } else {
              setValue(Number(currValue) + step);
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
          max={max || undefined}
          min={min || undefined}
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
              isIntegerOnly && !Number.isNaN(e.target.valueAsNumber)
                ? Math.round(e.target.valueAsNumber)
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
          value={currValue}
          {...props}
          ref={inputRef}
        />
      </div>
    );
  },
);

Counter.displayName = 'Counter';
