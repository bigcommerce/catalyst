import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { ComponentPropsWithRef, ElementRef, forwardRef, ReactNode, useState } from 'react';
import { cn } from '~/lib/utils';

interface Props extends ComponentPropsWithRef<'input'> {
  error?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  storeHash?: string;
  passwordHide?: string;
}

const Input = forwardRef<ElementRef<'input'>, Props>(
  (
    {
      className,
      children,
      error = false,
      icon,
      type = 'text',
      storeHash,
      passwordHide,
      onChange,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [actualValue, setActualValue] = useState('');
    const isPassword = type === 'password';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      let updatedValue = actualValue;

      // If deleting characters
      if (newValue.length < actualValue.length) {
        updatedValue = actualValue.slice(0, -1);
      }
      // If text is pasted or multiple characters added
      else if (newValue.length > actualValue.length + 1) {
        // Strip any asterisks from pasted text
        const cleanValue = newValue.replace(/\*/g, '');
        updatedValue = cleanValue;
      }
      // If single character is added
      else if (newValue.length > actualValue.length) {
        // Get the last character that was added
        const lastChar = newValue[newValue.length - 1];
        updatedValue = actualValue + lastChar;
      }

      setActualValue(updatedValue);

      if (onChange) {
        onChange({
          ...e,
          target: {
            ...e.target,
            value: updatedValue,
          },
        } as React.ChangeEvent<HTMLInputElement>);
      }
    };

    return (
      <div className={cn('relative', className)}>
        <style>{`
          .password-on circle {
            outline: 3px solid white;
            border-radius: 50px;
            r: 1.5;
            cy: 11.5;
          }
        `}</style>

        <input
          className={cn(
            'peer w-full border-2 border-gray-200 px-4 rounded-sm py-2.5 text-base placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20 disabled:bg-gray-100 disabled:hover:border-gray-200',
            (error || isPassword) && 'pe-12',
            error &&
              'border-error-secondary hover:border-error focus-visible:border-error-secondary focus-visible:ring-error-secondary/20 disabled:border-gray-200',
            'tracking-wide',
          )}
          ref={ref}
          type="text"
          {...props}
          value={isPassword && !showPassword ? '*'.repeat(actualValue.length) : actualValue}
          onChange={handleChange}
        />

        {Boolean(error || icon || isPassword) && (
          <span
            className={cn(
              'eye-icon-password absolute end-4 top-0 flex h-full items-center',
              error && 'text-error-secondary peer-disabled:text-gray-200',
              isPassword && !error && 'text-black hover:text-gray-800',
              isPassword && 'pointer-events-auto cursor-pointer',
              !isPassword && 'pointer-events-none',
            )}
            onClick={isPassword ? () => setShowPassword(!showPassword) : undefined}
            role={isPassword ? 'button' : undefined}
            tabIndex={isPassword ? 0 : undefined}
            aria-label={isPassword ? (showPassword ? 'Hide password' : 'Show password') : undefined}
          >
            {icon ??
              (error ? (
                <AlertCircle />
              ) : isPassword ? (
                showPassword ? (
                  <Eye
                    size={20}
                    className="password-on h-[25px] w-[25px] fill-black [&>circle]:fill-black"
                  />
                ) : (
                  <Eye
                    size={20}
                    className="password-off h-[25px] w-[25px] object-contain [&>circle]:fill-black"
                  />
                )
              ) : null)}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };