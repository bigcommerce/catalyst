import { AlertCircle, Eye } from 'lucide-react';
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

interface Props extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue'> {
  error?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  storeHash?: string;
  passwordHide?: string;
  value?: string;
  defaultValue?: string;
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
      value: propValue,
      defaultValue,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [actualValue, setActualValue] = useState(propValue || defaultValue || '');
    const isPassword = type === 'password';
    const inputRef = useRef<HTMLInputElement>(null);
    const [cursorPosition, setCursorPosition] = useState<number | null>(null);
    const [selectionStart, setSelectionStart] = useState<number | null>(null);
    const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
    const lastKeyPressRef = useRef<string | null>(null);

    // Update actualValue when propValue changes
    useEffect(() => {
      if (propValue !== undefined) {
        setActualValue(propValue);
      }
    }, [propValue]);

    useEffect(() => {
      if (cursorPosition !== null && inputRef.current && !selectionStart && !selectionEnd) {
        inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, [cursorPosition, actualValue, selectionStart, selectionEnd]);

    const handleSelect = (e: React.SyntheticEvent<HTMLInputElement>) => {
      const input = e.target as HTMLInputElement;
      setSelectionStart(input.selectionStart);
      setSelectionEnd(input.selectionEnd);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target;
      const newValue = input.value;
      const currentPosition = input.selectionStart || 0;
      const hasSelection =
        selectionStart !== null && selectionEnd !== null && selectionStart !== selectionEnd;

      if (isPassword) {
        // Handle complete deletion or selection deletion
        if (newValue.length === 0 || hasSelection) {
          if (hasSelection) {
            const newActualValue =
              actualValue.slice(0, selectionStart!) + actualValue.slice(selectionEnd!);
            if (propValue === undefined) setActualValue(newActualValue);
            setCursorPosition(selectionStart);
          } else {
            if (propValue === undefined) setActualValue('');
            setCursorPosition(0);
          }
          // Reset selection after deletion
          setSelectionStart(null);
          setSelectionEnd(null);
        }
        // Handle single character deletion
        else if (newValue.length < actualValue.length) {
          if (lastKeyPressRef.current === 'Backspace') {
            // For backspace, remove character before cursor
            const newActualValue =
              actualValue.slice(0, currentPosition) + actualValue.slice(currentPosition + 1);
            if (propValue === undefined) setActualValue(newActualValue);
            setCursorPosition(currentPosition);
          } else if (lastKeyPressRef.current === 'Delete') {
            // For delete key, remove character at cursor
            const newActualValue =
              actualValue.slice(0, currentPosition) + actualValue.slice(currentPosition + 1);
            if (propValue === undefined) setActualValue(newActualValue);
            setCursorPosition(currentPosition);
          }
        }
        // Handle insertion
        else {
          const insertedChar = newValue.charAt(currentPosition - 1);
          if (insertedChar !== '*') {
            const newActualValue =
              actualValue.slice(0, currentPosition - 1) +
              insertedChar +
              actualValue.slice(currentPosition - 1);
            if (propValue === undefined) setActualValue(newActualValue);
            setCursorPosition(currentPosition);
          }
        }
      } else {
        if (propValue === undefined) setActualValue(newValue);
      }

      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: isPassword ? actualValue : newValue,
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
              'border-error-secondary focus-visible:border-error-secondary focus-visible:ring-error-secondary/20 hover:border-error disabled:border-gray-200',
            'tracking-wide',
          )}
          type="text"
          {...props}
          value={isPassword && !showPassword ? '*'.repeat(actualValue.length) : actualValue}
          onChange={handleChange}
          onSelect={handleSelect}
          onKeyDown={(e) => {
            if (isPassword) {
              lastKeyPressRef.current = e.key;
              const input = e.currentTarget;
              setCursorPosition(input.selectionStart);
              setSelectionStart(input.selectionStart);
              setSelectionEnd(input.selectionEnd);
            }
          }}
          onClick={(e) => {
            if (isPassword) {
              const input = e.currentTarget;
              setCursorPosition(input.selectionStart);
              setSelectionStart(input.selectionStart);
              setSelectionEnd(input.selectionEnd);
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
