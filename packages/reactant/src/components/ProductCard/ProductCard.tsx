import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cs } from '../../utils/cs';

export const ProductCard = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        className={cs(
          'group relative mx-auto flex max-w-[144px] flex-col md:max-w-[154px] lg:max-w-[292px]',
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  },
);

export const ProductCardImage = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        className={cs('h-[180px] pb-3 group-hover:opacity-75 lg:h-[365px]', className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  },
);

export const ProductCardBadge = forwardRef<ElementRef<'span'>, ComponentPropsWithRef<'span'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <span
        className={cs(
          'absolute left-0 top-4 bg-black py-1 px-4 text-white group-hover:opacity-75',
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </span>
    );
  },
);

export const ProductCardInfo = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div className={cs('flex flex-1 flex-col gap-1 lg:gap-2', className)} ref={ref} {...props}>
        {children}
      </div>
    );
  },
);

export const ProductCardInfoBrandName = forwardRef<ElementRef<'p'>, ComponentPropsWithRef<'p'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <p className={cs('text-base text-gray-500', className)} {...props} ref={ref}>
        {children}
      </p>
    );
  },
);

export const ProductCardInfoProductName = forwardRef<ElementRef<'h3'>, ComponentPropsWithRef<'h3'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <h3 className={cs('text-h5', className)} ref={ref} {...props}>
        {children}
      </h3>
    );
  },
);

export const ProductCardInfoPrice = forwardRef<ElementRef<'h3'>, ComponentPropsWithRef<'h3'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <p className={cs('text-base', className)} ref={ref} {...props}>
        {children}
      </p>
    );
  },
);
