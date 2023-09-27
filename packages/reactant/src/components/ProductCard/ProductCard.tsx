import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cs } from '../../utils/cs';

export const ProductCard = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        className={cs('group relative flex flex-col overflow-visible', className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  },
);

ProductCard.displayName = 'ProductCard';

export const ProductCardImage = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div className={cs('relative flex justify-center pb-3', className)} ref={ref} {...props}>
        {children}
      </div>
    );
  },
);

ProductCardImage.displayName = 'ProductCardImage';

export const ProductCardBadge = forwardRef<ElementRef<'span'>, ComponentPropsWithRef<'span'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <span
        className={cs('absolute start-0 top-4 bg-black px-4 py-1 text-white', className)}
        ref={ref}
        {...props}
      >
        {children}
      </span>
    );
  },
);

ProductCardBadge.displayName = 'ProductCardBadge';

export const ProductCardInfo = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div className={cs('flex flex-1 flex-col gap-1', className)} ref={ref} {...props}>
        {children}
      </div>
    );
  },
);

ProductCardInfo.displayName = 'ProductCardInfo';

export const ProductCardInfoBrandName = forwardRef<ElementRef<'p'>, ComponentPropsWithRef<'p'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <p className={cs('text-base text-gray-500', className)} {...props} ref={ref}>
        {children}
      </p>
    );
  },
);

ProductCardInfoBrandName.displayName = 'ProductCardInfoBrandName';

export const ProductCardInfoProductName = forwardRef<ElementRef<'h3'>, ComponentPropsWithRef<'h3'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <h3 className={cs('text-h5', className)} ref={ref} {...props}>
        {children}
      </h3>
    );
  },
);
ProductCardInfoProductName.displayName = 'ProductCardInfoProductName';

export const ProductCardInfoPrice = forwardRef<ElementRef<'h3'>, ComponentPropsWithRef<'h3'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <p className={cs('pt-2 text-base', className)} ref={ref} {...props}>
        {children}
      </p>
    );
  },
);

ProductCardInfoPrice.displayName = 'ProductCardInfoPrice';
