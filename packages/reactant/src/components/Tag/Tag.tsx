import { X } from 'lucide-react';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cs } from '../../utils/cs';

export type TagProps = ComponentPropsWithRef<'div'>;

const Tag = forwardRef<ElementRef<'div'>, TagProps>(({ className, ...props }, ref) => {
  return (
    <div
      className={cs(
        'inline-flex h-[40px] flex-row items-center whitespace-nowrap bg-gray-100',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

Tag.displayName = 'Tag';

export type TagContentProps = ComponentPropsWithRef<'span'>;

const TagContent = forwardRef<ElementRef<'span'>, TagContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <span className={cs('pl-4 pr-2 font-semibold only:px-4', className)} ref={ref} {...props} />
    );
  },
);

TagContent.displayName = 'TagContent';

export type TagActionProps = ComponentPropsWithRef<'button'>;

const TagAction = forwardRef<ElementRef<'button'>, TagActionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        className={cs(
          'box-content inline-flex h-8 w-8 items-center justify-center p-1 hover:bg-blue-primary/10 focus:outline-none focus:ring-4 focus:ring-inset focus:ring-blue-primary/20',
        )}
        ref={ref}
        type="button"
        {...props}
      >
        {children || <X className="h-4 w-4" />}
      </button>
    );
  },
);

TagAction.displayName = 'TagAction';

export { Tag, TagContent, TagAction };
