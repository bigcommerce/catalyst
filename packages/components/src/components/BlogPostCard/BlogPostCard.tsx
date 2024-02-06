import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cn } from '~/lib/utils';

interface BlogPostCardProps extends ComponentPropsWithRef<'li'> {
  asChild?: boolean;
}

const BlogPostCard = forwardRef<ElementRef<'li'>, BlogPostCardProps>(
  ({ asChild = false, children, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'li';

    return (
      <Comp className={cn('group relative list-none flex-col', className)} ref={ref} {...props}>
        {children}
      </Comp>
    );
  },
);

BlogPostCard.displayName = 'BlogPostCard';

const BlogPostBanner = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        className={cn('mb-3 flex h-44 justify-between bg-blue-primary/10 p-4 lg:h-56', className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  },
);

BlogPostBanner.displayName = 'BlogPostBanner';

const BlogPostImage = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div className={cn('mb-2 flex h-44 lg:h-56', className)} ref={ref} {...props}>
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

const BlogPostTitle = forwardRef<ElementRef<'h3'>, TitleProps>(
  ({ asChild = false, children, className, variant, ...props }, ref) => {
    const Comp = asChild ? Slot : 'h3';

    return (
      <Comp className={cn(titleVariants({ variant, className }))} ref={ref} {...props}>
        {children}
      </Comp>
    );
  },
);

BlogPostTitle.displayName = 'BlogPostTitle';

const BlogPostContent = forwardRef<ElementRef<'p'>, ComponentPropsWithRef<'p'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <p className={cn('mb-2 text-base', className)} {...props} ref={ref}>
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

const BlogPostDate = forwardRef<ElementRef<'small'>, DateProps>(
  ({ children, className, variant, ...props }, ref) => {
    return (
      <small className={cn(dateVariants({ variant, className }))} {...props} ref={ref}>
        {children}
      </small>
    );
  },
);

BlogPostDate.displayName = 'BlogPostDate';

const BlogPostAuthor = forwardRef<ElementRef<'small'>, ComponentPropsWithRef<'small'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <small className={cn('text-base text-gray-500', className)} {...props} ref={ref}>
        {children}
      </small>
    );
  },
);

BlogPostAuthor.displayName = 'BlogPostAuthor';

export {
  BlogPostCard,
  BlogPostBanner,
  BlogPostImage,
  BlogPostTitle,
  BlogPostContent,
  BlogPostDate,
  BlogPostAuthor,
};
