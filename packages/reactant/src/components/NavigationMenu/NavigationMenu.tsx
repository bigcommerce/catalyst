import { Slot } from '@radix-ui/react-slot';
import {
  ComponentPropsWithRef,
  createContext,
  ElementRef,
  forwardRef,
  useContext,
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
        <nav aria-label="Main" className={cs(className)} ref={ref} {...props}>
          {children}
        </nav>
      </ExpandedContext.Provider>
    );
  },
);

export const NavigationMenuList = forwardRef<ElementRef<'ul'>, ComponentPropsWithRef<'ul'>>(
  ({ children, className, ...props }, ref) => (
    <ul className={cs('flex items-center gap-5', className)} ref={ref} {...props}>
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
    const { isExpanded } = useContext(ExpandedContext);

    return (
      <div
        className={cs(
          'sm:hidden',
          className,
          !isExpanded && 'hidden sm:hidden md:hidden lg:hidden',
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
