import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { ComponentPropsWithRef, ElementRef, forwardRef, useId } from 'react';
import { cn } from '~/lib/utils';
import * as Tooltip from '@radix-ui/react-tooltip';

interface Swatch {
  color?: string;
  label: string;
  value: string;
}

interface Props extends ComponentPropsWithRef<typeof RadioGroupPrimitive.Root> {
  error?: boolean;
  swatches: Swatch[];
}

const Swatch = forwardRef<ElementRef<typeof RadioGroupPrimitive.Root>, Props>(
  ({ children, className, error = false, swatches, ...props }, ref) => {
    const id = useId();

    return (
      <RadioGroupPrimitive.Root
        className={cn('contents flex-wrap gap-2', className)}
        ref={ref}
        role="radiogroup"
        {...props}
      >
        {swatches.map((swatch) => {
          const { label, value, color, ...itemProps } = swatch;
          
          const [colorName,fabricCode]= label.split("|");
          const bgColor = color?.startsWith("#");
            
          return (
            <Tooltip.Provider key={`tooltip ${value}`}>
              <Tooltip.Root>
                <Tooltip.Trigger type="button">
                  <RadioGroupPrimitive.Item
                    key={`${id}-${value}`}
                    {...itemProps}
                    className={cn(
                      'group m-0 h-12 w-12 rounded-[50px] border border-gray-300 bg-white p-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:border-[#4EAECC]',
                      'data-[state=checked]:border-[2px] data-[state=checked]:border-[#4EAECC]',
                      'focus-within:border-[2px] focus-within:border-[#4EAECC] hover:border-[2px] hover:border-[#4EAECC]',
                      error &&
                        'border-error-secondary focus-visible:border-error-secondary data-[state=checked]:border-error-secondary hover:border-error focus-visible:ring-error/20 disabled:border-gray-200',
                    )}
                    //title={label}
                    value={value}
                  >
                    {color ? (
                      <span
                        className="swatch-span block h-full w-full rounded-[50px] group-focus-within:border-[3px] group-focus-within:border-[#B4DDE9] group-hover:border-[3px] group-hover:border-[#B4DDE9] group-disabled:bg-gray-200 group-disabled:opacity-30 group-data-[state=checked]:border-[3px] group-data-[state=checked]:border-[#B4DDE9]"
                        style={{
                          backgroundColor: color,
                          backgroundImage: `url(${color})`,
                        }}
                      />
                    ) : (
                      <span className="relative block h-9 w-9 overflow-hidden border-2 border-solid border-[#B4B4B5] group-disabled:border-gray-100">
                        <span className="border-error-secondary absolute -start-px -top-[2px] w-[51px] origin-top-left rotate-45 border-t-2 group-disabled:opacity-30" />
                      </span>
                    )}
                  </RadioGroupPrimitive.Item>
                </Tooltip.Trigger>
                <Tooltip.Content
                  side="top"
                  align="center"
                  sideOffset={5}
                  className="relative z-[99] rounded-md bg-white font-[#353535] text-[12px] font-normal shadow-[0_10px_20px_5px_rgba(0,0,0,0.25)]"
                >
                  <div className="flex h-[240px] w-[180px] flex-col gap-0 p-3">
                    <p className="m-0 p-0 text-sm text-gray-800">{colorName}</p>
                    <div
                      className="m-0 h-full w-full rounded-sm p-0"
                      // style={{ backgroundColor: color }}
                      style={{
                        backgroundColor: bgColor ? color : 'transparent', 
                        backgroundImage: !bgColor ? `url(${color})`:'none',
                        backgroundRepeat:'no-repeat',
                        backgroundSize:'100% 100%',
                        backgroundPosition:'center',
                      }}
                    ></div>
                    {fabricCode ? <div className="p-0 m-0 text-sm text-gray-800">{fabricCode}</div>:<div className='mt-5'></div>}
                  </div>
                  <Tooltip.Arrow className="transform fill-white" style={{ width: '20px', height: '20px' }} />
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          );
        })}
      </RadioGroupPrimitive.Root>
    );
  },
);

Swatch.displayName = 'Swatch';

export { Swatch };
