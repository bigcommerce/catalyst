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
    { className, children, error = false, icon, type = 'text', storeHash, passwordHide, ...props },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className={cn('relative', className)}>
        {' '}
        <input
          className={cn(
            'peer w-full rounded-sm border-2 border-gray-200 px-4 py-2.5 text-base placeholder:text-gray-500 hover:border-[#008bb7] focus-visible:border-2 focus-visible:border-[#008bb7] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20 disabled:bg-gray-100 disabled:hover:border-gray-200',
            (error || isPassword) && 'pe-12',
            error &&
              'border-error-secondary disabled:border-gray-20 hover:border-[#A71F23] focus-visible:border-2 focus-visible:border-[#A71F23]',
          )}
          ref={ref}
          type={effectiveType}
          {...props}
        />{' '}
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
            {' '}
            {icon ??
              (error ? (
                <AlertCircle className="text-[#A71F23]" />
              ) : isPassword ? (
                showPassword ? (
                  <>
                    {' '}
                    <Eye
                      size={20}
                      className="password-on h-[25px] w-[25px] fill-black [&>circle]:fill-black"
                    />{' '}
                    <style jsx>{`
                      :global(.password-on circle) {
                        outline: 3px solid white;
                        border-radius: 50px;
                        r: 1.5;
                        cy: 11.5;
                      }
                    `}</style>{' '}
                  </>
                ) : (
                  <Eye
                    size={20}
                    className="password-off h-[25px] w-[25px] object-contain [&>circle]:fill-black"
                  />
                )
              ) : null)}{' '}
          </span>
        )}{' '}
      </div>
    );
  },
);
Input.displayName = 'Input';
export { Input };
