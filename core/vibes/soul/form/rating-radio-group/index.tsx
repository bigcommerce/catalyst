import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { clsx } from 'clsx';
import * as React from 'react';

import { FieldError } from '@/vibes/soul/form/field-error';
import { Label } from '@/vibes/soul/form/label';
import { Star } from '@/vibes/soul/primitives/rating';

/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 *  :root {
 *   --rating-radio-group-focus: hsl(var(--primary));
 *   --rating-radio-group-light-star-empty: hsl(var(--contrast-200));
 *   --rating-radio-group-light-star-filled: hsl(var(--foreground));
 *   --rating-radio-group-light-star-hover: hsl(var(--contrast-300));
 *   --rating-radio-group-dark-star-empty: hsl(var(--contrast-400));
 *   --rating-radio-group-dark-star-filled: hsl(var(--background));
 *   --rating-radio-group-dark-star-hover: hsl(var(--contrast-300));
 *  }
 * ```
 */
export const RatingRadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> & {
    label: string;
    max?: number;
    errors?: string[];
    onOptionMouseEnter?: (value: string) => void;
    onOptionMouseLeave?: () => void;
    colorScheme?: 'light' | 'dark';
  }
>(
  (
    {
      label,
      max = 5,
      errors,
      className,
      onOptionMouseEnter,
      onOptionMouseLeave,
      colorScheme = 'light',
      ...rest
    },
    ref,
  ) => {
    const groupId = React.useId();
    const [previewValue, setPreviewValue] = React.useState<string | null>(null);
    const isMouseDownRef = React.useRef(false);

    const currentValue = rest.value?.toString() ?? '0';
    const displayRating = parseInt(previewValue ?? currentValue, 10) || 0;

    const handleMouseLeave = () => {
      setPreviewValue(null);
      onOptionMouseLeave?.();
    };

    const handleMouseDown = () => {
      isMouseDownRef.current = true;
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
    };

    const handleBlur = () => {
      if (!isMouseDownRef.current) {
        setPreviewValue(null);
      }
    };

    return (
      <div className={clsx('rating-radio-group space-y-2', className)}>
        <Label colorScheme={colorScheme} id={groupId}>
          {label}
        </Label>

        <RadioGroupPrimitive.Root
          {...rest}
          aria-labelledby={groupId}
          className="flex items-center gap-1"
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          ref={ref}
        >
          <div className="flex items-center gap-1">
            {Array.from({ length: max }, (_, i) => {
              const ratingValue = i + 1;
              const filled = displayRating >= ratingValue;
              const valueStr = ratingValue.toString();
              const itemId = `${groupId}-${ratingValue}`;

              return (
                <div className="relative" key={ratingValue}>
                  <RadioGroupPrimitive.Item
                    className={clsx(
                      'peer sr-only',
                      'data-disabled:pointer-events-none data-disabled:opacity-50 transition-colors focus-visible:outline-0 focus-visible:ring-2',
                      {
                        light:
                          'focus-visible:ring-[var(--rating-radio-group-focus,hsl(var(--primary)))]',
                        dark: 'focus-visible:ring-[var(--rating-radio-group-focus,hsl(var(--primary)))]',
                      }[colorScheme],
                    )}
                    id={itemId}
                    onBlur={handleBlur}
                    value={valueStr}
                  />
                  <label
                    aria-label={`${ratingValue} ${ratingValue === 1 ? 'star' : 'stars'}`}
                    className="flex shrink-0 cursor-pointer rounded-full transition-colors focus-visible:outline-0 focus-visible:ring-2 peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--rating-radio-group-focus,hsl(var(--primary)))]"
                    htmlFor={itemId}
                    onMouseEnter={() => {
                      setPreviewValue(valueStr);
                      onOptionMouseEnter?.(valueStr);
                    }}
                  >
                    <Star type={filled ? 'full' : 'empty'} />
                  </label>
                </div>
              );
            })}
          </div>
        </RadioGroupPrimitive.Root>
        {errors?.map((error) => (
          <FieldError key={error}>{error}</FieldError>
        ))}
      </div>
    );
  },
);

RatingRadioGroup.displayName = 'RatingRadioGroup';
