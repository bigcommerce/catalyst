import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import {
  ComponentPropsWithRef,
  ElementRef,
  forwardRef,
  ReactNode,
  useState,
  useRef,
  useEffect,
} from 'react';
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
    const inputRef = useRef<HTMLInputElement>(null);
    const [cursorPosition, setCursorPosition] = useState<number | null>(null);

    useEffect(() => {
      if (cursorPosition !== null && inputRef.current) {
        inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, [cursorPosition, actualValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target;
      const newValue = input.value;
      const currentPosition = input.selectionStart || 0;

      if (isPassword) {
        // Handle deletion
        if (newValue.length < actualValue.length) {
          const deletePosition = currentPosition;
          const newActualValue =
            actualValue.slice(0, deletePosition - 1) + actualValue.slice(deletePosition);
          setActualValue(newActualValue);
          setCursorPosition(deletePosition - 1);
        }
        // Handle insertion
        else {
          const insertedChar = newValue.charAt(currentPosition - 1);
          if (insertedChar !== '*') {
            const newActualValue =
              actualValue.slice(0, currentPosition - 1) +
              insertedChar +
              actualValue.slice(currentPosition - 1);
            setActualValue(newActualValue);
            setCursorPosition(currentPosition);
          }
        }
      } else {
        setActualValue(newValue);
      }

      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: isPassword
              ? newValue.length < actualValue.length
                ? actualValue.slice(0, -1)
                : actualValue + newValue.charAt(newValue.length - 1)
              : newValue,
          },
        };
        onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
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
          ref={(node) => {
            // Handle both refs
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
            inputRef.current = node;
          }}
          className={cn(
            'peer w-full border-2 border-gray-200 px-4 py-2.5 text-base placeholder:text-gray-500 hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:bg-gray-100 disabled:hover:border-gray-200',
            (error || isPassword) && 'pe-12',
            error &&
              'border-error-secondary hover:border-error focus-visible:border-error-secondary focus-visible:ring-error-secondary/20 disabled:border-gray-200',
            'tracking-wide',
          )}
          type="text"
          {...props}
          value={isPassword && !showPassword ? '*'.repeat(actualValue.length) : actualValue}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (isPassword) {
              const currentPosition = inputRef.current?.selectionStart || 0;
              setCursorPosition(currentPosition);
            }
          }}
          onClick={(e) => {
            if (isPassword) {
              const currentPosition = inputRef.current?.selectionStart || 0;
              setCursorPosition(currentPosition);
            }
          }}
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
