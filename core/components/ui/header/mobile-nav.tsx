'use client';

import * as SheetPrimitive from '@radix-ui/react-dialog';
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useState } from 'react';

import { BcImage } from '~/components/bc-image';
import { Link as CustomLink } from '~/components/link';

import { Button } from '../button';

import { Links } from './header';

interface Image {
  altText: string;
  src: string;
}

interface Props {
  links: Links[];
  logo?: string | Image;
}

export const MobileNav = ({ links, logo }: Props) => {
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
        <SheetPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-50 h-full w-3/4 border-r bg-white p-6 pt-0 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm"
        >
          <SheetPrimitive.Title asChild>
            <h2 className="sr-only">Navigation menu</h2>
          </SheetPrimitive.Title>
          <div className="flex h-[92px] items-center justify-between">
            <div className="overflow-hidden text-ellipsis py-3">
              {typeof logo === 'object' ? (
                <BcImage
                  alt={logo.altText}
                  className="max-h-16 object-contain"
                  height={32}
                  priority
                  src={logo.src}
                  width={155}
                />
              ) : (
                <span className="truncate text-2xl font-black">{logo}</span>
              )}
            </div>
            <SheetPrimitive.DialogClose>
              <div className="p-3">
                <X className="h-6 w-6" />
              </div>
            </SheetPrimitive.DialogClose>
          </div>
          <NavigationMenuPrimitive.Root orientation="vertical">
            <NavigationMenuPrimitive.List className="flex flex-col gap-2 pb-6 lg:gap-4">
              {links.map((link) =>
                link.groups && link.groups.length > 0 ? (
                  <NavigationMenuPrimitive.Item key={link.href}>
                    <NavigationMenuPrimitive.Trigger className="group/button flex w-full items-center justify-between p-3 ps-0 font-semibold hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20">
                      <CustomLink
                        className="font-semibold"
                        href={link.href}
                        onClick={() => setOpen(false)}
                      >
                        {link.label}
                      </CustomLink>
                      <ChevronDown
                        aria-hidden="true"
                        className="cursor-pointer transition duration-200 group-data-[state=open]/button:-rotate-180"
                      />
                    </NavigationMenuPrimitive.Trigger>
                    <NavigationMenuPrimitive.Content className="flex flex-col gap-4 py-2 ps-2 duration-200 animate-in slide-in-from-top-2">
                      {link.groups.map((group) => (
                        <ul className="flex flex-col" key={group.href}>
                          <li>
                            <NavigationMenuPrimitive.Link asChild>
                              <CustomLink
                                className="block w-full p-3 ps-0 font-semibold"
                                href={group.href}
                                onClick={() => setOpen(false)}
                              >
                                {group.label}
                              </CustomLink>
                            </NavigationMenuPrimitive.Link>
                          </li>
                          {group.links &&
                            group.links.length > 0 &&
                            group.links.map((nestedLink) => (
                              <li key={nestedLink.href}>
                                <NavigationMenuPrimitive.Link asChild>
                                  <CustomLink
                                    className="block w-full p-3 ps-0"
                                    href={nestedLink.href}
                                    onClick={() => setOpen(false)}
                                  >
                                    {nestedLink.label}
                                  </CustomLink>
                                </NavigationMenuPrimitive.Link>
                              </li>
                            ))}
                        </ul>
                      ))}
                    </NavigationMenuPrimitive.Content>
                  </NavigationMenuPrimitive.Item>
                ) : (
                  <NavigationMenuPrimitive.Item key={link.href}>
                    <NavigationMenuPrimitive.Link asChild>
                      <CustomLink
                        className="block w-full p-3 ps-0 font-semibold"
                        href={link.href}
                        onClick={() => setOpen(false)}
                      >
                        {link.label}
                      </CustomLink>
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
