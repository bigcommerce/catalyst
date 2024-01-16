import { ChevronDown, ChevronUp } from 'lucide-react';
import { ComponentPropsWithRef, ElementRef, forwardRef, useRef, useState } from 'react';

import { cs } from '../../utils/cs';

interface CounterProps extends Omit<ComponentPropsWithRef<'input'>, 'onChange'> {
  defaultValue?: number | '';
  isInteger?: boolean;
  max?: number;
  min?: number;
  step?: number;
  value?: number | '';
  onChange?: (value: number | '') => void;
}

const getDefaultValue = (defaultValue: number | '', min: number, max: number) => {
  if (typeof defaultValue === 'number') {
    if (defaultValue < min) {
      return min;
    } else if (defaultValue > max) {
      return max;
    }
  }

  return defaultValue;
};

export const Counter = forwardRef<ElementRef<'div'>, CounterProps>(
  (
    {
      children,
      className,
      defaultValue = 0,
      disabled = false,
      isInteger = true,
      max = Infinity,
      min = 0,
      step = 1,
      onChange,
      type,
      value: valueProp,
      ...props
    },
    ref,
  ) => {
    const [value, setValue] = useState<number | ''>(getDefaultValue(defaultValue, min, max));
    const inputRef = useRef<ElementRef<'input'>>(null);
    const currValue = valueProp ?? value;

    const updateValue = (newValue: number | '') => {
      if (onChange) {
        onChange(newValue);
      } else {
        setValue(newValue);
      }
    };

    const increment = () => {
      updateValue(currValue === '' ? step : currValue + step);
    };

    const decrement = () => {
      updateValue(currValue === '' ? -step : currValue - step);
    };

    const canIncrement = () => {
      if (disabled) {
        return false;
      }

      const tmpValue = currValue === '' ? 0 : currValue;

      return tmpValue < max;
    };

    const canDecrement = () => {
      if (disabled) {
        return false;
      }

      const tmpValue = currValue === '' ? 0 : currValue;

      return tmpValue > min;
    };

    return (
      <div className={cs('relative')} ref={ref}>
        <button
          aria-hidden="true"
          aria-label="Decrease count"
          className={cs(
            'peer/down absolute start-0 top-0 flex h-full w-12 items-center justify-center focus:outline-none disabled:text-gray-200',
          )}
          disabled={!canDecrement()}
          onClick={() => {
            decrement();

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
          disabled={!canIncrement()}
          onClick={() => {
            increment();

            inputRef.current?.focus();
          }}
          tabIndex={-1}
          type="button"
        >
          <ChevronUp />
        </button>

        <input
          className={cs(
            'peer/input w-full border-2 border-gray-200 px-12 py-2.5 text-center text-base placeholder:text-gray-500 hover:border-blue-primary focus:border-blue-primary focus:outline-none focus:ring-4 focus:ring-blue-primary/20 disabled:bg-gray-100 disabled:hover:border-gray-200 peer-hover/down:border-blue-primary peer-hover/up:border-blue-primary peer-hover/down:disabled:border-gray-200 peer-hover/up:disabled:border-gray-200 [&::-webkit-inner-spin-button]:appearance-none',
            className,
          )}
          disabled={disabled}
          max={max}
          min={min}
          onBlur={(e) => {
            const valueAsNumber = e.target.valueAsNumber;

            if (valueAsNumber < min) {
              updateValue(min);
            } else if (valueAsNumber > max) {
              updateValue(max);
            }
          }}
          onChange={(e) => {
            const valueAsNumber =
              isInteger && !Number.isNaN(e.target.valueAsNumber)
                ? Math.trunc(e.target.valueAsNumber)
                : e.target.valueAsNumber;

            updateValue(Number.isNaN(valueAsNumber) ? '' : valueAsNumber);
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
