import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import FocusTrap from 'focus-trap-react';
import { Menu, X } from 'lucide-react';
import {
  ComponentPropsWithRef,
  createContext,
  ElementRef,
  forwardRef,
  useContext,
  useEffect,
  useRef,
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

export const NavigationMenu = forwardRef<
  ElementRef<typeof NavigationMenuPrimitive.Root>,
  ComponentPropsWithRef<'div'>
>(({ children, className, ...props }, ref) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <ExpandedContext.Provider value={{ isExpanded, setIsExpanded }}>
      <NavigationMenuPrimitive.Root
        className={cs(isExpanded && 'h-screen overflow-y-auto')}
        ref={ref}
      >
        <FocusTrap active={isExpanded}>
          <div className="relative">
            <div
              className={cs(
                'group flex min-h-[92px] items-center justify-between bg-white px-6 sm:px-10 lg:px-12 2xl:container 2xl:mx-auto 2xl:px-0',
                className,
              )}
              {...props}
            >
              {children}
            </div>
            {!isExpanded && (
              <NavigationMenuPrimitive.Viewport
                className={cs('absolute top-full left-0 z-50 w-full bg-white pt-6 pb-12 shadow-xl')}
              />
            )}
          </div>
        </FocusTrap>
      </NavigationMenuPrimitive.Root>
    </ExpandedContext.Provider>
  );
});

export const NavigationMenuList = forwardRef<
  ElementRef<typeof NavigationMenuPrimitive.List>,
  ComponentPropsWithRef<typeof NavigationMenuPrimitive.List>
>(({ children, className, ...props }, ref) => (
  <NavigationMenuPrimitive.List className={cs('flex items-center', className)} ref={ref} {...props}>
    {children}
  </NavigationMenuPrimitive.List>
));

export const NavigationMenuItem = NavigationMenuPrimitive.Item;

const navigationMenuLinkStyles = cs(
  'focus:ring-primary-blue/20 flex justify-between p-3 font-semibold hover:text-blue-primary focus:outline-none focus:ring-4',
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

export const NavigationMenuContent = forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    className={cs('2xl:container 2xl:mx-auto', className)}
    ref={ref}
    {...props}
  >
    {children}
  </NavigationMenuPrimitive.Content>
));

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
      aria-label="Toggle navigation"
      className={cs(
        'focus:ring-primary-blue/20 group p-3 hover:text-blue-primary focus:outline-none focus:ring-4',
        className,
      )}
      onClick={(e) => {
        onClick?.(e);
        setIsExpanded(!isExpanded);
      }}
      ref={ref}
      {...props}
    >
      {children ?? (isExpanded ? <X /> : <Menu />)}
    </button>
  );
});

export const NavigationMenuCollapsed = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'>>(
  ({ children, className, ...props }, ref) => {
    const { isExpanded, setIsExpanded } = useContext(ExpandedContext);
    const initialBodyOverflowYRef = useRef('');

    // Disable scroll on body when nav is open
    useEffect(() => {
      if (isExpanded) {
        initialBodyOverflowYRef.current = document.body.style.overflowY || '';
        document.body.style.overflowY = 'hidden';

        return () => {
          document.body.style.overflowY = initialBodyOverflowYRef.current;
        };
      }
    }, [isExpanded]);

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
          'in-collapsed-nav group absolute top-full left-0 z-50 w-full bg-white px-3 pb-6 sm:px-7 lg:px-9 2xl:container 2xl:mx-auto 2xl:px-0',
          className,
          !isExpanded && 'hidden',
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
