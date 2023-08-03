import {
  ComponentPropsWithRef,
  createContext,
  ElementRef,
  forwardRef,
  useContext,
  useId,
} from 'react';

import { cs } from '../../utils/cs';
import { Label } from '../Label';

const SwatchAccessibilityContext = createContext<{ id: string | undefined }>({ id: undefined });

export const SwatchGroup = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        className={cs('flex flex-wrap items-center gap-3 pt-3 pb-2', className)}
        ref={ref}
        role="radiogroup"
        {...props}
      >
        {children}
      </div>
    );
  },
);

export const SwatchGroupLabel = ({
  className,
  children,
  ...props
}: ComponentPropsWithRef<'label'>) => {
  return (
    <Label
      className={cs('my-1 inline-flex h-6 basis-full items-center gap-2 font-semibold', className)}
      {...props}
    >
      {children}
    </Label>
  );
};

export const SwatchInput = forwardRef<ElementRef<'input'>, ComponentPropsWithRef<'input'>>(
  ({ className, id, name, ...props }, ref) => {
    const { id: swatchId } = useContext(SwatchAccessibilityContext);

    return (
      <input
        className={cs('peer sr-only top-px left-px', className)}
        id={id?.toString() ?? swatchId}
        name={name || id || swatchId}
        ref={ref}
        type="radio"
        {...props}
      />
    );
  },
);

export const SwatchLabel = ({
  className,
  children,
  id,
  ...props
}: ComponentPropsWithRef<'label'>) => {
  const { id: swatchId } = useContext(SwatchAccessibilityContext);

  return (
    <Label
      className={cs(
        'peer/preview peer-focus:ring-primary-blue/20 inline-flex cursor-pointer justify-evenly border-2 border-gray-200 p-1 text-[0px] hover:border-blue-primary peer-checked:border-blue-primary peer-focus:ring-4 peer-disabled:cursor-default peer-disabled:border-gray-100',
        className,
      )}
      htmlFor={id ?? swatchId}
      {...props}
    >
      {children}
    </Label>
  );
};

interface SwatchVariantProps extends ComponentPropsWithRef<'span'> {
  variantColor?: string;
  variant?: 'default' | 'none';
}

const swatchVariants = {
  none: 'inline-block relative border border-gray-200 border-solid overflow-hidden',
};

export const SwatchVariant = forwardRef<ElementRef<'span'>, SwatchVariantProps>(
  ({ children, className, variant = 'default', variantColor, ...props }, ref) => {
    return variant === 'default' ? (
      <span
        className={cs('h-9 w-9 bg-gray-100', className)}
        ref={ref}
        {...props}
        style={{ backgroundColor: variantColor, backgroundImage: `url(${variantColor ?? ''})` }}
      />
    ) : (
      <span className={cs('h-9 w-9', swatchVariants.none, className)} ref={ref} {...props}>
        <span className="border-red absolute -left-px -top-[2px] inline-block w-[51px] origin-top-left rotate-45 border-t-2 border-solid" />
      </span>
    );
  },
);

interface SwatchPreviewProps extends ComponentPropsWithRef<'div'> {
  variantColor: string;
}

export const SwatchPreview = forwardRef<ElementRef<'div'>, SwatchPreviewProps>(
  ({ className, variantColor, ...props }, ref) => {
    return (
      <div
        className={cs(
          'absolute top-14 left-0 hidden items-stretch justify-evenly border-2 border-solid border-gray-200 py-[7px] px-[6px] peer-hover/preview:flex',
          className,
        )}
        ref={ref}
        {...props}
      >
        <span
          className={cs('inline-flex h-[126px] w-[126px] bg-gray-100')}
          style={{ backgroundColor: variantColor, backgroundImage: `url(${variantColor})` }}
        />
      </div>
    );
  },
);

export const Swatch = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'>>(
  ({ children, className, ...props }, ref) => {
    const id = useId();

    return (
      <SwatchAccessibilityContext.Provider value={{ id }}>
        <div className={cs('relative', className)} ref={ref} {...props}>
          {children}
        </div>
      </SwatchAccessibilityContext.Provider>
    );
  },
);
