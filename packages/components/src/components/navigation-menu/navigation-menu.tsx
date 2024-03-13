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
  useRef,
  useState,
} from 'react';

import { cn } from '~/lib/utils';

const ExpandedContext = createContext<{
  isExpanded: boolean;
  setIsExpanded: (newIsExpanded: boolean) => void;
}>({
  isExpanded: false,
  setIsExpanded: () => undefined,
});

const NavigationMenu = forwardRef<
  ElementRef<typeof NavigationMenuPrimitive.Root>,
  ComponentPropsWithRef<typeof NavigationMenuPrimitive.Root>
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
        className={cn(isExpanded && 'h-screen overflow-y-auto')}
        onValueChange={(newValue) => setValue(newValue)}
        ref={ref}
        value={value}
        {...props}
      >
        <FocusTrap active={isExpanded}>
          <div className="relative">
            <div
              className={cn(
                'group flex min-h-[92px] items-center justify-between gap-6 bg-white px-6 2xl:container sm:px-10 lg:gap-8 lg:px-12 2xl:mx-auto 2xl:px-0',
                className,
              )}
            >
              {children}
            </div>
            {!isExpanded && (
              <NavigationMenuPrimitive.Viewport
                className={cn(
                  'absolute start-0 top-full z-50 w-full bg-white pb-12 pt-6 shadow-xl duration-200 animate-in slide-in-from-top-5',
                )}
              />
            )}
          </div>
        </FocusTrap>
      </NavigationMenuPrimitive.Root>
    </ExpandedContext.Provider>
  );
});

NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

const NavigationMenuList = forwardRef<
  ElementRef<typeof NavigationMenuPrimitive.List>,
  ComponentPropsWithRef<typeof NavigationMenuPrimitive.List>
>(({ children, className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    className={cn('flex items-center gap-2 lg:gap-4', className)}
    ref={ref}
    {...props}
  >
    {children}
  </NavigationMenuPrimitive.List>
));

NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

const NavigationMenuItem = NavigationMenuPrimitive.Item;

NavigationMenuItem.displayName = NavigationMenuPrimitive.Item.displayName;

const NavigationMenuTrigger = forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    className={cn(
      'group/button flex w-full items-center justify-between gap-1 p-3 font-semibold hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20',
      className,
    )}
    ref={ref}
    {...props}
  >
    {children}
  </NavigationMenuPrimitive.Trigger>
));

NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

const NavigationMenuContent = forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const { isExpanded } = useContext(ExpandedContext);

  return (
    <NavigationMenuPrimitive.Content
      className={cn(
        '2xl:container  2xl:mx-auto',
        !isExpanded &&
          'data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52',
        isExpanded && 'duration-200 animate-in slide-in-from-top-2',
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </NavigationMenuPrimitive.Content>
  );
});

NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

const NavigationMenuLink = forwardRef<
  ElementRef<typeof NavigationMenuPrimitive.Link>,
  ComponentPropsWithRef<typeof NavigationMenuPrimitive.Link>
>(({ children, className, ...props }, ref) => {
  const { setIsExpanded } = useContext(ExpandedContext);

  return (
    <NavigationMenuPrimitive.Link
      className={cn(
        'flex justify-between p-3 font-semibold hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20',
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

NavigationMenuLink.displayName = NavigationMenuPrimitive.Link.displayName;

const NavigationMenuToggle = forwardRef<ElementRef<'button'>, ComponentPropsWithRef<'button'>>(
  ({ children, className, onClick, ...props }, ref) => {
    const { isExpanded, setIsExpanded } = useContext(ExpandedContext);

    return (
      <button
        aria-controls="nav-menu"
        aria-expanded={isExpanded}
        aria-label="Toggle navigation"
        className={cn(
          'group p-3 hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20',
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
  },
);

NavigationMenuToggle.displayName = 'NavigationMenuToggle';

const NavigationMenuCollapsed = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'>>(
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
        className={cn(
          'in-collapsed-nav group absolute start-0 top-full z-50 w-full bg-white px-6 pb-6 duration-200 animate-in slide-in-from-top-5 2xl:container sm:px-10 lg:px-12 2xl:mx-auto 2xl:px-0',
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

NavigationMenuCollapsed.displayName = 'NavigationMenuCollapsed';

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuToggle,
  NavigationMenuCollapsed,
};
