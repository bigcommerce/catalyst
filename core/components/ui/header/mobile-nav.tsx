'use client';

import * as SheetPrimitive from '@radix-ui/react-dialog';
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { ChevronRight, Menu, Plus, Minus, X, Weight } from 'lucide-react';
import { ReactNode, useState } from 'react';

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
  homeLogoMobile?: string | Image;
  account: string;
}

export const MobileNav = ({ links, logo, homeLogoMobile }: Props) => {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showMainMenu, setShowMainMenu] = useState(true);
  const [expandedSubMenus, setExpandedSubMenus] = useState<Record<string, boolean>>({});

  const handleCategoryClick = (href: string) => {
    setSelectedCategory(href);
    setShowMainMenu(false);
  };

  const handleBackToMain = () => {
    setSelectedCategory(null);
    setShowMainMenu(true);
  };

  const toggleSubMenu = (groupHref: string) => {
    setExpandedSubMenus((prev) => ({
      ...prev,
      [groupHref]: !prev[groupHref],
    }));
  };

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
        <SheetPrimitive.Content className="fixed inset-y-0 left-0 z-50 flex h-full w-full flex-col border-r bg-white shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left">
          <div className="flex-none p-6 pb-0">
            <SheetPrimitive.Title asChild>
              <h2 className="sr-only">Navigation menu</h2>
            </SheetPrimitive.Title>
            <div className="flex h-[92px] items-center justify-between">
              <div className="mobile-logo-open-state overflow-hidden text-ellipsis py-3">
                {typeof logo === 'object' ? (
                  <BcImage
                    alt={logo.altText}
                    className="w-[45%] truncate text-2xl font-black"
                    height={32}
                    priority
                    src={homeLogoMobile}
                    width={155}
                  />
                ) : (
                  <span className="w-[45%] truncate text-2xl font-black">{homeLogoMobile}</span>
                )}
              </div>
              <SheetPrimitive.Close>
                <div className="p-3">
                  <X className="h-7 w-7" />
                </div>
              </SheetPrimitive.Close>
            </div>
          </div>

          <div className="scrollbar-none flex-1 overflow-y-auto px-6">
            <NavigationMenuPrimitive.Root
              orientation="vertical"
              className="border-b border-[#CCCBCB]"
            >
              <NavigationMenuPrimitive.List className="flex flex-col gap-0 lg:gap-4">
                <div className="flex justify-between">
                {!showMainMenu && (
  <>
    <button
      onClick={handleBackToMain}
      className="relative -left-2 mb-5 flex items-center text-left font-sans text-sm font-normal leading-6 tracking-[0.25px] text-[#008BB7]"
    >
      <ChevronRight className="rotate-180 text-black" />
      Main Menu
    </button>
    
    <CustomLink
      href={selectedCategory || ''}
      onClick={() => {
        setOpen(false); // Close the sheet/mobile menu
        setSelectedCategory(null); // Reset selected category
        setShowMainMenu(true); // Show main menu for next time
      }}
      className="mb-5 flex items-center text-left font-sans text-sm font-normal leading-6 tracking-[0.25px] text-[#008BB7]"
    >
      SHOP ALL
    </CustomLink>
  </>
)}
                </div>

                {showMainMenu ? (
                  <>
                    {links.map((link) => (
                      <NavigationMenuPrimitive.Item
                        key={link.href}
                        className="max-w-full border-t border-[#CCCBCB] pb-[0.5em] pt-[1em]"
                      >
                        <div
                          className="group/button flex w-full items-center justify-between p-3 pl-0 font-normal hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
                          onClick={() => handleCategoryClick(link.href)}
                        >
                          <span className="text-base font-normal leading-6 tracking-[0.25px] text-black hover:text-primary">
                            {link.label}
                          </span>
                          {link.groups && link.groups.length > 0 && (
                            <ChevronRight className="cursor-pointer" />
                          )}
                        </div>
                      </NavigationMenuPrimitive.Item>
                    ))}

                    <nav
                      className="static-menu-mobile relative right-[1em] ml-[1em] flex flex-col items-center gap-5 text-[16px] font-normal text-[#008bb7]"
                      id="static-menu"
                    >
                      <CustomLink
                        href="/new"
                        className="font-semiboldd w-[100%] border-b border-[#CCCBCB] pb-[1.5em] text-[#008BB7] hover:text-primary"
                      >
                        New
                      </CustomLink>
                      <CustomLink
                        href="/sale"
                        className="font-semiboldd w-[100%] border-b border-[#CCCBCB] pb-[1.5em] text-[#008BB7] hover:text-primary"
                      >
                        Sale
                      </CustomLink>
                      <CustomLink
                        href="/blog"
                        className="font-semiboldd w-[100%] border-b border-[#CCCBCB] pb-[1.5em] text-[#008BB7] hover:text-primary"
                      >
                        Blog
                      </CustomLink>
                      <CustomLink
                        href="/blog"
                        className="font-semiboldd w-[100%] border-b border-[#CCCBCB] pb-[1.5em] text-[#008BB7] hover:text-primary"
                      >
                        Our Brands
                      </CustomLink>
                    </nav>

                    <section className="support-account-mobile mt-[20px]">
                      <div className="support-div">
                        <div className="mb-[14px] text-left text-base font-normal leading-8 tracking-[0.15px] text-[#006380]">
                          Support
                        </div>

                        <CustomLink
                          href="/Order Status"
                          className="mb-[16px] text-[14px] font-normal leading-6 tracking-[0.25px] text-[#000000]"
                        >
                          Order Status
                        </CustomLink>
                        <CustomLink
                          href="/Return-Replacement"
                          className="mb-[16px] text-[14px] font-normal leading-6 tracking-[0.25px] text-[#000000]"
                        >
                          Return / Replacement
                        </CustomLink>
                        <CustomLink
                          href="/visit"
                          className="mb-[16px] text-[14px] font-normal leading-6 tracking-[0.25px] text-[#000000]"
                        >
                          Visit Our Help Center
                        </CustomLink>
                        <CustomLink
                          href="/order"
                          className="mb-[16px] text-[14px] font-normal leading-6 tracking-[0.25px] text-[#000000]"
                        >
                          Order Assistance
                        </CustomLink>
                      </div>

                      <div className="mb-[16px] text-left text-base font-normal leading-8 tracking-[0.15px] text-[#008BB7] underline decoration-[#008BB7] underline-offset-2">
                        Contact Us
                      </div>

                      <div className="Account-div mb-[14px]">
                        <div className="mb-[16px] text-left text-base font-normal leading-8 tracking-[0.15px] text-[#006380]">
                          Account
                        </div>

                        <CustomLink
                          href="/Order Status"
                          className="mb-[16px] text-[14px] font-normal leading-6 tracking-[0.25px] text-[#000000]"
                        >
                          My Account
                        </CustomLink>
                        <CustomLink
                          href="/Favorites"
                          className="mb-[16px] text-[14px] font-normal leading-6 tracking-[0.25px] text-[#000000]"
                        >
                          Favorites
                        </CustomLink>
                        <CustomLink
                          href="/visit"
                          className="mb-[16px] text-[14px] font-normal leading-6 tracking-[0.25px] text-[#000000]"
                        >
                          Purchase History
                        </CustomLink>
                        <CustomLink
                          href="/order"
                          className="mb-[16px] text-[14px] font-normal leading-6 tracking-[0.25px] text-[#000000]"
                        >
                          Financing
                        </CustomLink>
                      </div>

                      <div className="mb-[16px] text-left text-base font-normal leading-8 tracking-[0.15px] text-[#008BB7] underline decoration-[#008BB7] underline-offset-2">
                        Log In / Signup
                      </div>
                    </section>
                  </>
                ) : (
                  selectedCategory && (
                    <div className="animate-in slide-in-from-right-2">
                      {links
                        .find((link) => link.href === selectedCategory)
                        ?.groups?.map((group) => (
                          <ul
                            className="flex flex-col border-t border-[#CCCBCB] pb-2"
                            key={group.href}
                          >
                            <li className="w-[100%] pb-1 pt-1">
                              <div className="flex items-center justify-between">
                                <CustomLink
                                  className="block flex-1 p-3 pb-1 ps-0 font-normal text-[#353535]"
                                  href={group.href}
                                  onClick={() => setOpen(false)}
                                >
                                  {group.label}
                                </CustomLink>
                                {group.links && group.links.length > 0 && (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      toggleSubMenu(group.href);
                                    }}
                                    className="p-2"
                                  >
                                    {expandedSubMenus[group.href] ? (
                                      <Minus
                                        className="h-5 w-5 font-bold"
                                        style={{ fill: 'black' }}
                                      />
                                    ) : (
                                      <Plus
                                        className="h-5 w-5 font-bold"
                                        style={{ fill: 'black' }}
                                      />
                                    )}
                                  </button>
                                )}
                              </div>
                            </li>

                            {expandedSubMenus[group.href] && (
                              <>
                                {group.links?.map((nestedLink) => (
                                  <li key={nestedLink.href}>
                                    <CustomLink
                                      className="block w-full pb-2 pl-[2em] text-[#353535]"
                                      href={nestedLink.href}
                                      onClick={() => setOpen(false)}
                                    >
                                      {nestedLink.label}
                                    </CustomLink>
                                  </li>
                                ))}
                                <li>
                                  <CustomLink
                                    className="block w-full pb-2 pl-[2em] text-[#008BB7]"
                                    href={group.href}
                                    onClick={() => setOpen(false)}
                                  >
                                    Shop All
                                  </CustomLink>
                                </li>
                              </>
                            )}
                          </ul>
                        ))}
                    </div>
                  )
                )}
              </NavigationMenuPrimitive.List>
            </NavigationMenuPrimitive.Root>
          </div>
        </SheetPrimitive.Content>
      </SheetPrimitive.Portal>
    </SheetPrimitive.Root>
  );
};