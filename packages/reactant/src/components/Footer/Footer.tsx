import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cs } from '../../utils/cs';

export const Footer = forwardRef<ElementRef<'footer'>, ComponentPropsWithRef<'footer'>>(
  ({ children, className, ...props }, ref) => (
    <footer
      className={cs(
        'grid grid-cols-1 gap-10 border-t border-gray-200 py-10 sm:gap-8 sm:py-12 md:grid-cols-8',
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </footer>
  ),
);

export const FooterSiteMap = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'>>(
  ({ children, className, ...props }, ref) => (
    <div
      className={cs('grid grid-cols-1 gap-8 sm:grid-cols-4 md:col-span-5', className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  ),
);

export const FooterSiteMapCategory = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'>>(
  ({ children, className, ...props }, ref) => (
    <div className={cs(className)} ref={ref} {...props}>
      {children}
    </div>
  ),
);

export const FooterSiteMapCategoryTitle = forwardRef<
  HTMLHeadingElement,
  ComponentPropsWithRef<'h3'>
>(({ children, className, ...props }, ref) => (
  <h3 className={cs('mb-4 font-bold', className)} ref={ref} {...props}>
    {children}
  </h3>
));

export const FooterSiteMapCategoryList = forwardRef<ElementRef<'ul'>, ComponentPropsWithRef<'ul'>>(
  ({ children, className, ...props }, ref) => (
    <ul className={cs('space-y-4', className)} ref={ref} {...props}>
      {children}
    </ul>
  ),
);

export const FooterSiteMapCategoryItem = forwardRef<ElementRef<'li'>, ComponentPropsWithRef<'li'>>(
  ({ children, className, ...props }, ref) => (
    <li className={cs(className)} ref={ref} {...props}>
      {children}
    </li>
  ),
);

export const FooterContactInformation = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'>>(
  ({ children, className, ...props }, ref) => (
    <div
      className={cs('flex flex-col gap-4 md:order-first md:col-span-3', className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  ),
);

export const FooterContactInformationAddress = forwardRef<
  ElementRef<'address'>,
  ComponentPropsWithRef<'address'>
>(({ children, className, ...props }, ref) => (
  <address className={cs('not-italic', className)} ref={ref} {...props}>
    {children}
  </address>
));

export const FooterContactInformationPhoneNumber = forwardRef<
  ElementRef<'div'>,
  ComponentPropsWithRef<'div'>
>(({ children, className, ...props }, ref) => (
  <div className={cs(className)} ref={ref} {...props}>
    {children}
  </div>
));

export const FooterContactInformationSocials = forwardRef<
  ElementRef<'div'>,
  ComponentPropsWithRef<'div'>
>(({ children, className, ...props }, ref) => (
  <div className={cs('flex flex-row flex-wrap gap-6', className)} ref={ref} {...props}>
    {children}
  </div>
));

export const FooterAddendum = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'>>(
  ({ children, className, ...props }, ref) => (
    <div
      className={cs(
        'order-last col-span-full flex flex-col gap-10 border-t border-gray-200 py-8 sm:flex-row sm:py-6',
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  ),
);

export const FooterAddendumCopyright = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'>>(
  ({ children, className, ...props }, ref) => (
    <div className={cs('flex-auto text-gray-500 sm:order-first', className)} ref={ref} {...props}>
      {children}
    </div>
  ),
);

export const FooterAddendumPaymentOptions = forwardRef<
  ElementRef<'div'>,
  ComponentPropsWithRef<'div'>
>(({ children, className, ...props }, ref) => (
  <div
    className={cs('flex flex-auto flex-row gap-6 sm:justify-end', className)}
    ref={ref}
    {...props}
  >
    {children}
  </div>
));
