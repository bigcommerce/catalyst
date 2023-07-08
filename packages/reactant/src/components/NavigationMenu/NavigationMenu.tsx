import { Slot } from '@radix-ui/react-slot';
import {
  ComponentPropsWithRef,
  createContext,
  ElementRef,
  forwardRef,
  useContext,
  useEffect,
  useState,
} from 'react';

import { cs } from '../../utils/cs';

const ExpandedContext = createContext<{
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  isExpanded: false,
  setIsExpanded: () => undefined,
});

export const NavigationMenu = forwardRef<ElementRef<'nav'>, ComponentPropsWithRef<'nav'>>(
  ({ children, className, ...props }, ref) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <ExpandedContext.Provider value={{ isExpanded, setIsExpanded }}>
        <nav
          aria-label="Main"
          className={cs(
            'relative flex min-h-[92px] items-center justify-between gap-5 sm:flex-row',
            className,
          )}
          ref={ref}
          {...props}
        >
          {children}
        </nav>
      </ExpandedContext.Provider>
    );
  },
);

export const NavigationMenuList = forwardRef<ElementRef<'ul'>, ComponentPropsWithRef<'ul'>>(
  ({ children, className, ...props }, ref) => (
    <ul
      className={cs(
        'hidden items-center gap-5 sm:flex',
        'group-[.is-expanded]:block group-[.is-expanded]:border-t group-[.is-expanded]:border-gray-200 group-[.is-expanded]:py-6',
        'group-[.is-expanded]:first-of-type:border-t-0 group-[.is-expanded]:first-of-type:pt-0',
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </ul>
  ),
);

export const NavigationMenuItem = forwardRef<ElementRef<'li'>, ComponentPropsWithRef<'li'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <li className={className} ref={ref} {...props}>
        {children}
      </li>
    );
  },
);

interface NavigationMenuLinkProps extends ComponentPropsWithRef<'a'> {
  asChild?: boolean;
}

export const NavigationMenuLink = forwardRef<ElementRef<'a'>, NavigationMenuLinkProps>(
  ({ asChild = false, children, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'a';

    return (
      <Comp
        className={cs(
          'focus:ring-primary-blue/20 flex justify-between py-3 font-semibold hover:text-blue-primary focus:outline-none focus:ring-4 sm:py-0',
          'group-[.is-expanded]:py-3',
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);

export const NavigationMenuMobileTrigger = forwardRef<
  ElementRef<'button'>,
  ComponentPropsWithRef<'button'>
>(({ children, className, onClick, ...props }, ref) => {
  const { isExpanded, setIsExpanded } = useContext(ExpandedContext);

  return (
    <button
      aria-controls="nav-menu"
      aria-expanded={isExpanded}
      className={cs('hover:text-blue-primary sm:hidden', className)}
      onClick={(e) => {
        onClick?.(e);
        setIsExpanded(!isExpanded);
      }}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

export const NavigationMenuMobile = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'>>(
  ({ children, className, ...props }, ref) => {
    const { isExpanded, setIsExpanded } = useContext(ExpandedContext);

    useEffect(() => {
      const handleResize = () => {
        setIsExpanded(false);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, [setIsExpanded]);

    return (
      <div
        className={cs(
          'group absolute top-full left-0 z-50 w-full bg-white sm:hidden',
          isExpanded && 'is-expanded',
          className,
          !isExpanded && '!hidden',
        )}
        id="nav-menu"
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  },
);
