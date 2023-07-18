import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
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

const expandedMenuStyles = cs('is-expanded group absolute top-full left-0 z-50 w-full bg-white');

export const NavigationMenu = forwardRef<
  ElementRef<typeof NavigationMenuPrimitive.Root>,
  ComponentPropsWithRef<typeof NavigationMenuPrimitive.Root>
>(({ children, className, ...props }, ref) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <ExpandedContext.Provider value={{ isExpanded, setIsExpanded }}>
      <NavigationMenuPrimitive.Root
        className={cs(
          'group relative flex min-h-[92px] items-center justify-between gap-6 bg-white lg:gap-8',
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
        {!isExpanded && (
          <NavigationMenuPrimitive.Viewport className={cs(expandedMenuStyles, 'pt-3')} />
        )}
      </NavigationMenuPrimitive.Root>
    </ExpandedContext.Provider>
  );
});

export const NavigationMenuList = forwardRef<
  ElementRef<typeof NavigationMenuPrimitive.List>,
  ComponentPropsWithRef<typeof NavigationMenuPrimitive.List>
>(({ children, className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    className={cs('flex items-center gap-4 lg:gap-8', className)}
    ref={ref}
    {...props}
  >
    {children}
  </NavigationMenuPrimitive.List>
));

export const NavigationMenuItem = NavigationMenuPrimitive.Item;

const navigationMenuLinkStyles = cs(
  'focus:ring-primary-blue/20 flex justify-between font-semibold hover:text-blue-primary focus:outline-none focus:ring-4 group-[.is-expanded]:py-3',
);

export const NavigationMenuTrigger = forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    className={cs(
      navigationMenuLinkStyles,
      'group/button flex w-full items-center justify-between',
      className,
    )}
    ref={ref}
    {...props}
  >
    {children}
  </NavigationMenuPrimitive.Trigger>
));

export const NavigationMenuContent = NavigationMenuPrimitive.Content;

export const NavigationMenuLink = forwardRef<
  ElementRef<typeof NavigationMenuPrimitive.Link>,
  ComponentPropsWithRef<typeof NavigationMenuPrimitive.Link>
>(({ children, className, ...props }, ref) => {
  return (
    <NavigationMenuPrimitive.Link
      className={cs(navigationMenuLinkStyles, className)}
      ref={ref}
      {...props}
    >
      {children}
    </NavigationMenuPrimitive.Link>
  );
});

export const NavigationMenuToggle = forwardRef<
  ElementRef<'button'>,
  ComponentPropsWithRef<'button'>
>(({ children, className, onClick, ...props }, ref) => {
  const { isExpanded, setIsExpanded } = useContext(ExpandedContext);

  return (
    <button
      aria-controls="nav-menu"
      aria-expanded={isExpanded}
      className={cs('hover:text-blue-primary', className)}
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

export const NavigationMenuCollapsed = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'>>(
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
        className={cs(expandedMenuStyles, className, !isExpanded && 'hidden')}
        id="nav-menu"
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  },
);
