'use client';

import * as SheetPrimitive from '@radix-ui/react-dialog';
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { ChevronDown, Menu, X } from 'lucide-react';
import { ReactNode, useState } from 'react';

import { Link } from '~/components/link';

import { Button } from '../button';

interface Children {
  name: string;
  path: string;
  children?: Children[];
}

interface Props {
  items: Array<{ name: string; path: string; children?: Children[] }>;
  logo: ReactNode;
}

export const MobileNav = ({ items, logo }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <SheetPrimitive.Root onOpenChange={setOpen} open={open}>
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
                      <Link
                        className="font-semibold"
                        href={item.path}
                        onClick={() => setOpen(false)}
                      >
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
                                onClick={() => setOpen(false)}
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
                                  <Link
                                    className="block w-full p-3 ps-0"
                                    href={child2.path}
                                    onClick={() => setOpen(false)}
                                  >
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
                      <Link
                        className="block w-full p-3 ps-0 font-semibold"
                        href={item.path}
                        onClick={() => setOpen(false)}
                      >
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
  );
};
