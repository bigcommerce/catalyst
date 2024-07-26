import * as SheetPrimitive from '@radix-ui/react-dialog';
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { ChevronDown, Menu, X } from 'lucide-react';
import { ComponentPropsWithoutRef, ReactNode } from 'react';

import { Link } from '~/components/link';
import { cn } from '~/lib/utils';

import { Button } from '../button';

interface Children {
  name: string;
  path: string;
  children?: Children[];
}

interface Props extends ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root> {
  items: Array<{ name: string; path: string; children?: Children[] }>;
  logo: ReactNode;
}

const Header = ({ children, className, items, logo }: Props) => (
  <div className={cn('relative', className)}>
    <header className="flex h-[92px] items-center justify-between gap-1 overflow-y-visible bg-white px-4 2xl:container sm:px-10 lg:gap-8 lg:px-12 2xl:mx-auto 2xl:px-0">
      <Link className="overflow-hidden text-ellipsis py-3" href="/">
        {logo}
      </Link>

      <NavigationMenuPrimitive.Root className="hidden lg:block">
        <NavigationMenuPrimitive.List className="flex items-center gap-2 lg:gap-4">
          {items.map((item) =>
            item.children && item.children.length > 0 ? (
              <NavigationMenuPrimitive.Item key={item.path}>
                <NavigationMenuPrimitive.Trigger className="group/button flex items-center font-semibold hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20">
                  <Link className="p-3 font-semibold" href={item.path}>
                    {item.name}
                  </Link>
                  <ChevronDown
                    aria-hidden="true"
                    className="cursor-pointer transition duration-200 group-data-[state=open]/button:-rotate-180"
                  />
                </NavigationMenuPrimitive.Trigger>
                <NavigationMenuPrimitive.Content className="flex gap-20 2xl:container data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 sm:px-10 lg:px-12 2xl:mx-auto 2xl:px-0">
                  {item.children.map((child) => (
                    <ul className="flex flex-col" key={child.path}>
                      <li>
                        <NavigationMenuPrimitive.Link asChild>
                          <Link className="block p-3 font-semibold" href={child.path}>
                            {child.name}
                          </Link>
                        </NavigationMenuPrimitive.Link>
                      </li>
                      {child.children &&
                        child.children.length > 0 &&
                        child.children.map((child2) => (
                          <li key={child2.path}>
                            <NavigationMenuPrimitive.Link asChild>
                              <Link className="block p-3" href={child2.path}>
                                {child2.name}
                              </Link>
                            </NavigationMenuPrimitive.Link>
                          </li>
                        ))}
                    </ul>
                  ))}
                </NavigationMenuPrimitive.Content>
              </NavigationMenuPrimitive.Item>
            ) : (
              <NavigationMenuPrimitive.Item key={item.path}>
                <NavigationMenuPrimitive.Link asChild>
                  <Link className="p-3 font-semibold" href={item.path}>
                    {item.name}
                  </Link>
                </NavigationMenuPrimitive.Link>
              </NavigationMenuPrimitive.Item>
            ),
          )}
        </NavigationMenuPrimitive.List>

        <NavigationMenuPrimitive.Viewport className="absolute start-0 top-full z-50 w-full bg-white pb-12 pt-6 shadow-xl duration-200 animate-in slide-in-from-top-5" />
      </NavigationMenuPrimitive.Root>

      <div className="flex items-center gap-2 lg:gap-4">
        <nav className="flex gap-2 lg:gap-4">{children}</nav>

        <SheetPrimitive.Root>
          <SheetPrimitive.Trigger asChild>
            <Button
              aria-controls="nav-menu"
              aria-label="Toggle navigation"
              className="group bg-transparent p-3 text-black hover:bg-transparent hover:text-primary lg:hidden"
              variant="subtle"
            >
              <Menu />
            </Button>
          </SheetPrimitive.Trigger>
          <SheetPrimitive.Portal>
            <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <SheetPrimitive.Content className="fixed inset-y-0 left-0 z-50 h-full w-3/4 border-r bg-white p-6 pt-0 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm">
              <div className="flex h-[92px] items-center justify-between">
                <div className="overflow-hidden text-ellipsis py-3">{logo}</div>
                <SheetPrimitive.DialogClose>
                  <div className="p-3">
                    <X className="h-6 w-6" />
                  </div>
                </SheetPrimitive.DialogClose>
              </div>
              <NavigationMenuPrimitive.Root orientation="vertical">
                <NavigationMenuPrimitive.List className="flex flex-col gap-2 pb-6 lg:gap-4">
                  {items.map((item) =>
                    item.children && item.children.length > 0 ? (
                      <NavigationMenuPrimitive.Item key={item.path}>
                        <NavigationMenuPrimitive.Trigger className="group/button flex w-full items-center justify-between p-3 ps-0 font-semibold hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20">
                          <Link className="font-semibold" href={item.path}>
                            {item.name}
                          </Link>
                          <ChevronDown
                            aria-hidden="true"
                            className="cursor-pointer transition duration-200 group-data-[state=open]/button:-rotate-180"
                          />
                        </NavigationMenuPrimitive.Trigger>
                        <NavigationMenuPrimitive.Content className="flex flex-col gap-4 py-2 ps-2 duration-200 animate-in slide-in-from-top-2">
                          {item.children.map((child) => (
                            <ul className="flex flex-col" key={child.path}>
                              <li>
                                <NavigationMenuPrimitive.Link asChild>
                                  <Link
                                    className="block w-full p-3 ps-0 font-semibold"
                                    href={child.path}
                                  >
                                    {child.name}
                                  </Link>
                                </NavigationMenuPrimitive.Link>
                              </li>
                              {child.children &&
                                child.children.length > 0 &&
                                child.children.map((child2) => (
                                  <li key={child2.path}>
                                    <NavigationMenuPrimitive.Link asChild>
                                      <Link className="block w-full p-3 ps-0" href={child2.path}>
                                        {child2.name}
                                      </Link>
                                    </NavigationMenuPrimitive.Link>
                                  </li>
                                ))}
                            </ul>
                          ))}
                        </NavigationMenuPrimitive.Content>
                      </NavigationMenuPrimitive.Item>
                    ) : (
                      <NavigationMenuPrimitive.Item key={item.path}>
                        <NavigationMenuPrimitive.Link asChild>
                          <Link className="block w-full p-3 ps-0 font-semibold" href={item.path}>
                            {item.name}
                          </Link>
                        </NavigationMenuPrimitive.Link>
                      </NavigationMenuPrimitive.Item>
                    ),
                  )}
                </NavigationMenuPrimitive.List>
              </NavigationMenuPrimitive.Root>
            </SheetPrimitive.Content>
          </SheetPrimitive.Portal>
        </SheetPrimitive.Root>
      </div>
    </header>
  </div>
);

Header.displayName = 'Header';

export { Header };
