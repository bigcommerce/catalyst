import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  ComponentPropsWithRef,
  ElementRef,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { cn } from '~/lib/utils';

interface Props extends Omit<ComponentPropsWithRef<'input'>, 'onChange'> {
  error?: boolean;
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

type CounterRef = ElementRef<'input'> | null;

const Counter = forwardRef<ElementRef<'input'>, Props>(
  (
    {
      children,
      className,
      defaultValue = 0,
      disabled = false,
      error = false,
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
    const inputRef = useRef<CounterRef>(null);

    useImperativeHandle<CounterRef, CounterRef>(ref, () => inputRef.current);

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
      <div className={cn('relative', className)}>
        <button
          aria-hidden="true"
          aria-label="Decrease count"
          className="peer/down absolute start-0 top-0 flex h-full w-12 items-center justify-center focus-visible:outline-none disabled:text-gray-200"
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
          className="peer/up absolute end-0 top-0 flex h-full w-12 items-center justify-center focus-visible:outline-none disabled:text-gray-200"
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
          className={cn(
            'peer/input w-full border-2 border-gray-200 px-12 py-2.5 text-center text-base placeholder:text-gray-500 hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:bg-gray-100 disabled:hover:border-gray-200 peer-hover/down:border-primary peer-hover/up:border-primary peer-hover/down:disabled:border-gray-200 peer-hover/up:disabled:border-gray-200 [&::-webkit-inner-spin-button]:appearance-none',
            error &&
              'border-error-secondary hover:border-error focus-visible:border-error-secondary focus-visible:ring-error-secondary/20 disabled:border-gray-200 peer-hover/down:border-error peer-hover/up:border-error peer-hover/down:disabled:border-gray-200 peer-hover/up:disabled:border-gray-200',
          )}
          disabled={disabled}
          max={max}
          min={min}
          onBlur={(e) => {
            const valueAsNumber = e.target.valueAsNumber;

            if (Number.isNaN(valueAsNumber)) {
              updateValue(min);

              return;
            }

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
          ref={inputRef}
          step={step}
          type="number"
          value={currValue}
          {...props}
        />
      </div>
    );
  },
);

Counter.displayName = 'Counter';

export { Counter };
