import { cva } from 'class-variance-authority';
import { AlertCircle, Check } from 'lucide-react';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cs } from '../../utils/cs';

const inputVariants = cva(
  'peer focus:ring-primary-blue/20 w-full border-2 border-gray-200 py-2.5 px-4 text-base placeholder:text-gray-500 focus:border-blue-primary focus:outline-none focus:ring-4 hover:border-blue-primary focus:outline-none disabled:bg-gray-100 disabled:hover:border-gray-200',
  {
    variants: {
      state: {
        success:
          'pr-12 border-green-100 focus:border-green-100 focus:ring-green-100/20 disabled:border-gray-200 hover:border-green-200',
        error:
          'pr-12 border-red-100 focus:border-red-100 focus:ring-red-100/20 disabled:border-gray-200 hover:border-red-200',
      },
    },
  },
);

export interface InputProps extends ComponentPropsWithRef<'input'> {
  state?: 'success' | 'error';
}

export const Input = forwardRef<ElementRef<'div'>, InputProps>(
  ({ className, state, children, type = 'text', ...props }, ref) => (
    <div className={cs('relative')} ref={ref}>
      <input className={cs(inputVariants({ state, className }))} type={type} {...props} />
      <span
        aria-hidden="true"
        className={cs(
          'pointer-events-none absolute top-0 right-4 flex h-full items-center peer-disabled:text-gray-200',
          state === 'success' && 'text-green-100',
          state === 'error' && 'text-red-100',
        )}
      >
        {state === 'success' && <Check />}
        {state === 'error' && <AlertCircle />}
      </span>
    </div>
  ),
);
