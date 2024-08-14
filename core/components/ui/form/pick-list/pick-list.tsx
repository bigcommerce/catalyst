import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { ComponentPropsWithRef, ElementRef, forwardRef, useId } from 'react';

import { BcImage } from '~/components/bc-image';
import { cn } from '~/lib/utils';

import { Label } from '../label';

interface Image {
  altText: string;
  url: string;
}

interface Item {
  label: string;
  image?: Image;
  onMouseEnter: () => void;
  value: string;
}

interface Props extends ComponentPropsWithRef<typeof RadioGroupPrimitive.Root> {
  error?: boolean;
  items: Item[];
}

const PickList = forwardRef<ElementRef<typeof RadioGroupPrimitive.Root>, Props>(
  ({ children, error = false, items, className, ...props }, ref) => {
    const id = useId();

    return (
      <RadioGroupPrimitive.Root
        className={cn('grid auto-rows-fr divide-y divide-solid divide-gray-200 border', className)}
        ref={ref}
        {...props}
      >
        {items.map((item) => {
          const { image, label, value, onMouseEnter, ...itemProps } = item;

          return (
            <div
              className="flex items-center p-4"
              key={`${id}-${value}`}
              onMouseEnter={onMouseEnter}
            >
              {image && (
                <BcImage
                  alt={image.altText}
                  className="me-6"
                  height={48}
                  src={image.url}
                  width={48}
                />
              )}
              <RadioGroupPrimitive.Item
                {...itemProps}
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 hover:border-secondary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:hover:border-secondary disabled:pointer-events-none disabled:bg-gray-100 radix-state-checked:border-primary radix-state-checked:bg-primary radix-state-checked:hover:border-secondary radix-state-checked:hover:bg-secondary radix-state-checked:disabled:border-gray-400 radix-state-checked:disabled:bg-gray-400',
                  error &&
                    'border-error-secondary hover:border-error focus-visible:border-error-secondary focus-visible:ring-error-secondary/20 focus-visible:hover:border-error disabled:border-gray-200 radix-state-checked:border-error-secondary radix-state-checked:bg-error-secondary radix-state-checked:hover:border-error radix-state-checked:hover:bg-error',
                )}
                id={`${id}-${value}`}
                value={value}
              >
                <RadioGroupPrimitive.Indicator className="h-2 w-2 rounded-full bg-white" />
              </RadioGroupPrimitive.Item>
              <Label className="w-full cursor-pointer ps-4" htmlFor={`${id}-${value}`}>
                {label}
              </Label>
            </div>
          );
        })}
      </RadioGroupPrimitive.Root>
    );
  },
);

PickList.displayName = 'PickList';

export { PickList };
