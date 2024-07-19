import { X } from 'lucide-react';
import { ComponentPropsWithoutRef } from 'react';

import { cn } from '~/lib/utils';

interface Props extends ComponentPropsWithoutRef<'div'> {
  tagContent: string;
  tagAction?: () => void;
}

const Tag = ({ className, tagContent, tagAction, ...props }: Props) => {
  return (
    <div
      className={cn(
        'inline-flex h-[40px] flex-row items-center whitespace-nowrap bg-gray-100',
        className,
      )}
      {...props}
    >
      <span className="pe-2 ps-4 font-semibold only:px-4">{tagContent}</span>
      {tagAction && (
        <button
          className="box-content inline-flex h-8 w-8 items-center justify-center p-1 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-primary/20"
          onClick={tagAction}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export { Tag };
