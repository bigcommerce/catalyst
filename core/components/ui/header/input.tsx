'use client';

import { Search, Loader2 as Spinner, X } from 'lucide-react';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { Button } from '../button';

interface Props extends ComponentPropsWithRef<'input'> {
  pending?: boolean;
  showButton?: boolean;
  onClickClear?: () => void;
  showClear?: boolean;
}

export const Input = forwardRef<ElementRef<'input'>, Props>(
  ({ className, pending, showClear, onClickClear, ...props }, ref) => (
    <div className="relative">
      <input
        className="peer w-full appearance-none border-2 border-gray-200 px-12 py-3 text-base placeholder:text-gray-500 hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:bg-gray-100 disabled:hover:border-gray-200"
        ref={ref}
        type="text"
        {...props}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute start-3 top-0 flex h-full items-center peer-hover:text-primary peer-focus-visible:text-primary peer-disabled:text-gray-200"
      >
        <Search />
      </span>
      {showClear && !pending && (
        <Button
          aria-label="Clear search"
          className="absolute end-1.5 top-1/2 w-auto -translate-y-1/2 border-0 bg-transparent p-1.5 text-black hover:bg-transparent hover:text-primary focus-visible:text-primary peer-hover:text-primary peer-focus-visible:text-primary"
          onClick={onClickClear}
          type="button"
        >
          <X />
        </Button>
      )}
      {pending && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute end-3 top-0 flex h-full items-center text-primary peer-disabled:text-gray-200"
        >
          <Spinner aria-hidden="true" className="animate-spin" />
          <span className="sr-only">Processing...</span>
        </span>
      )}
    </div>
  ),
);
