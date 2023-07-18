import { Check } from 'lucide-react';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cs } from '../../utils/cs';

// interface LabelProps extends ComponentPropsWithRef<'label'>

// export const Label = forwardRef<ElementRef<'label'>, LabelProps>();

interface CheckboxProps extends ComponentPropsWithRef<'input'> {
  isChecked?: boolean;
  isDisabled?: boolean;
}

export const Checkbox = forwardRef<ElementRef<'input'>, CheckboxProps>(
  ({ children, className, isChecked, isDisabled = false, ...props }, ref) => {
    return (
      <div className="inline-flex items-center">
        <input
          checked={isChecked}
          className="peer/checkbox-1 absolute h-6 w-6 opacity-0 hover:cursor-pointer disabled:pointer-events-none"
          disabled={isDisabled}
          id="default-checkbox"
          ref={ref}
          type="checkbox"
          {...props}
        />
        <div
          className="peer-focus/checkbox-1:ring-primary-blue/20', { flex h-6 w-6 flex-shrink-0 items-center justify-center border-2 border-gray-200 peer-checked/checkbox-1:border-blue-primary peer-checked/checkbox-1:bg-blue-primary peer-hover/checkbox-1:border-blue-primary peer-focus/checkbox-1:outline-none peer-focus/checkbox-1:ring-4 peer-disabled/checkbox-1:bg-gray-100
  peer-checked/checkbox-1:[&>svg]:block"
        >
          <Check absoluteStrokeWidth className="hidden stroke-white" size={13} />
        </div>
        {/* <label
          className="pl-3 text-base font-normal text-black hover:cursor-pointer"
          htmlFor="default-checkbox"
        >
          Default checkbox
        </label> */}
      </div>
    );
  },
);
