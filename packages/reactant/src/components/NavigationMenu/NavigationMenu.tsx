import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import FocusTrap from 'focus-trap-react';
import { Menu, X } from 'lucide-react';
import {
  ComponentPropsWithRef,
  createContext,
  ElementRef,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { cs } from '../../utils/cs';

const ExpandedContext = createContext<{
  isExpanded: boolean;
  setIsExpanded: (newIsExpanded: boolean) => void;
}>({
  isExpanded: false,
  setIsExpanded: () => undefined,
});

export const NavigationMenu = forwardRef<
  ElementRef<typeof NavigationMenuPrimitive.Root>,
  ComponentPropsWithRef<'div'>
>(({ children, className, ...props }, ref) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [value, setValue] = useState('');

  const toggleExpanded = useCallback((newIsExpanded: boolean) => {
    // Reset the state of menu items
    // Prevents the navigation items from remaining open in viewport when closing collapsed menu
    setValue('');

    setIsExpanded(newIsExpanded);
  }, []);

  return (
    <ExpandedContext.Provider value={{ isExpanded, setIsExpanded: toggleExpanded }}>
      <NavigationMenuPrimitive.Root
        className={cs(isExpanded && 'h-screen overflow-y-auto')}
        onValueChange={(newValue) => setValue(newValue)}
        ref={ref}
        value={value}
      >
        <FocusTrap active={isExpanded}>
          <div className="relative">
            <div
              className={cs(
                'group flex min-h-[92px] items-center justify-between gap-6 bg-white px-6 2xl:container sm:px-10 lg:gap-8 lg:px-12 2xl:mx-auto 2xl:px-0',
                className,
              )}
              {...props}
            >
              {children}
            </div>
            {!isExpanded && (
              <NavigationMenuPrimitive.Viewport
                className={cs(
                  'absolute start-0 top-full z-50 w-full bg-white pb-12 pt-6 shadow-xl',
                )}
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
  <NavigationMenuPrimitive.List
    className={cs('flex items-center lg:gap-4', className)}
    ref={ref}
    {...props}
  >
    {children}
  </NavigationMenuPrimitive.List>
));

export const NavigationMenuItem = forwardRef<
  ElementRef<typeof NavigationMenuPrimitive.Item>,
  ComponentPropsWithRef<typeof NavigationMenuPrimitive.Item>
>(({ children, className, ...props }, ref) => {
  const id = useId();

  return (
    <NavigationMenuPrimitive.Item className={cs(className)} ref={ref} value={id} {...props}>
      {children}
    </NavigationMenuPrimitive.Item>
  );
});

export const NavigationMenuTrigger = forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    className={cs(
      'group/button focus:ring-primary-blue/20 flex w-full items-center justify-between gap-1 p-3 font-semibold hover:text-blue-primary focus:outline-none focus:ring-4',
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
  const { setIsExpanded } = useContext(ExpandedContext);

  return (
    <NavigationMenuPrimitive.Link
      className={cs(
        'focus:ring-primary-blue/20 flex justify-between p-3 font-semibold hover:text-blue-primary focus:outline-none focus:ring-4',
        className,
      )}
      onClick={() => setIsExpanded(false)}
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
          'in-collapsed-nav group absolute start-0 top-full z-50 w-full bg-white px-6 pb-6 2xl:container sm:px-10 lg:px-12 2xl:mx-auto 2xl:px-0',
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
