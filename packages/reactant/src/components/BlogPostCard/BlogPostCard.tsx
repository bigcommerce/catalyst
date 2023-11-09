import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cs } from '../../utils/cs';

interface BlogPostCardProps extends ComponentPropsWithRef<'li'> {
  asChild?: boolean;
}

export const BlogPostCard = forwardRef<ElementRef<'li'>, BlogPostCardProps>(
  ({ asChild = false, children, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'li';

    return (
      <Comp className={cs('group relative list-none flex-col', className)} ref={ref} {...props}>
        {children}
      </Comp>
    );
  },
);

BlogPostCard.displayName = 'BlogPostCard';

export const BlogPostBanner = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        className={cs('mb-3 flex h-44 justify-between bg-blue-primary/10 p-4 lg:h-56', className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  },
);

BlogPostBanner.displayName = 'BlogPostBanner';

export const BlogPostImage = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div className={cs('mb-2 flex h-44 lg:h-56', className)} ref={ref} {...props}>
        {children}
      </div>
    );
  },
);

BlogPostImage.displayName = 'BlogPostImage';

interface TitleProps extends ComponentPropsWithRef<'h3'> {
  asChild?: boolean;
  variant?: 'inBanner';
}

const titleVariants = cva('mb-2 text-h5', {
  variants: {
    variant: {
      inBanner: 'mb-0 flex-none basis-1/2 self-start text-h4',
    },
  },
});

export const BlogPostTitle = forwardRef<ElementRef<'h3'>, TitleProps>(
  ({ asChild = false, children, className, variant, ...props }, ref) => {
    const Comp = asChild ? Slot : 'h3';

    return (
      <Comp className={cs(titleVariants({ variant, className }))} ref={ref} {...props}>
        {children}
      </Comp>
    );
  },
);

BlogPostTitle.displayName = 'BlogPostTitle';

export const BlogPostContent = forwardRef<ElementRef<'p'>, ComponentPropsWithRef<'p'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <p className={cs('mb-2 text-base', className)} {...props} ref={ref}>
        {children}
      </p>
    );
  },
);

BlogPostContent.displayName = 'BlogPostContent';

interface DateProps extends ComponentPropsWithRef<'small'> {
  variant?: 'inBanner';
}

const dateVariants = cva('mb-2 text-base text-gray-500', {
  variants: {
    variant: {
      inBanner: 'mb-0 flex-none self-end text-h5',
    },
  },
});

export const BlogPostDate = forwardRef<ElementRef<'small'>, DateProps>(
  ({ children, className, variant, ...props }, ref) => {
    return (
      <small className={cs(dateVariants({ variant, className }))} {...props} ref={ref}>
        {children}
      </small>
    );
  },
);

BlogPostDate.displayName = 'BlogPostDate';

export const BlogPostAuthor = forwardRef<ElementRef<'small'>, ComponentPropsWithRef<'small'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <small className={cs('text-base text-gray-500', className)} {...props} ref={ref}>
        {children}
      </small>
    );
  },
);

BlogPostAuthor.displayName = 'BlogPostAuthor';
