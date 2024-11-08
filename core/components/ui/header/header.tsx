import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { ChevronDown } from 'lucide-react';
import { ComponentPropsWithoutRef, ReactNode } from 'react';

import { BcImage } from '~/components/bc-image';
import { Link as CustomLink } from '~/components/link';
import { cn } from '~/lib/utils';

import { type Locale, LocaleSwitcher } from './locale-switcher';
import { MobileNav } from './mobile-nav';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import { imageManagerImageUrl } from '~/lib/store-assets';
import { imageIconList } from '~/app/[locale]/(default)/(auth)/fragments';

interface Link {
  label: string;
  href: string;
}

interface Group {
  label: string;
  href: string;
  links?: Link[];
}

interface Image {
  src: string;
  altText: string;
}

interface Links {
  label: string;
  href: string;
  groups?: Group[];
}

interface Props extends ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root> {
  account?: ReactNode;
  activeLocale?: string;
  locales: Locale[];
  cart?: ReactNode;
  links: Links[];
  locale?: ReactNode;
  logo?: string | Image;
  search?: ReactNode;
}

const Header = ({
  account,
  activeLocale,
  cart,
  className,
  links,
  locales,
  logo,
  search,
}: Props) => (
  <div className={cn('relative', className)}>
    <header className="main-header flex h-[92px] !max-w-[100%] items-center justify-between gap-1 overflow-y-visible bg-white p-[0px_4em] !px-[40px] 2xl:container sm:px-10 lg:gap-8 lg:px-12 2xl:mx-auto 2xl:px-0">
      <div className="flex items-center space-x-4">
        {/* First Logo */}
        <CustomLink className="home-logo-one overflow-hidden text-ellipsis py-3" href="/">
          {typeof logo === 'object' ? (
            <div className="hidden items-center space-x-2 lg:flex">
              <BcImage
                alt={logo.altText}
                className="max-h-16 object-contain"
                height={32}
                priority
                src={logo.src}
                width={155}
              />
            </div>
          ) : (
            <span className="truncate text-2xl font-black">{logo}</span>
          )}
        </CustomLink>

        <CustomLink className="home-logo-two overflow-hidden text-ellipsis pt-3 md:pl-5" href="/">
          {typeof logo === 'object' ? (
            <div className="second-home-logo block lg:hidden">
              <BcImage
                alt="homeLogo"
                className="max-h-16 object-contain"
                height={30}
                priority
                src={imageIconList.homeLogo}
                width={30}
              />
            </div>
          ) : (
            <span className="truncate text-2xl font-black">{imageIconList.homeLogo}</span>
          )}
        </CustomLink>
      </div>

      <div className="header-search-bar flex items-center gap-2 lg:gap-4">
        {search}
        <nav className="header-nav-support flex gap-2 lg:gap-4">{account}</nav>
        <nav className="header-cart flex gap-2 lg:gap-9">{cart}</nav>
        {activeLocale && locales.length > 0 ? (
          <LocaleSwitcher activeLocale={activeLocale} locales={locales} />
        ) : null}

        <MobileNav links={links} logo={logo} account={''} />
      </div>
    </header>

    <div className="header-bottom mx-auto flex max-w-full items-center justify-between border-b border-t border-[#cccbcb] bg-white px-4 pb-4 pt-4 lg:mt-[30px] lg:px-10 xl:mt-0">
      <NavigationMenuPrimitive.Root id="nav-menu-root" className="hidden lg:block">
        <NavigationMenuPrimitive.List
          id="nav-menu-list"
          className="flex items-center gap-2 text-[16px] !font-normal lg:gap-4"
        >
          {links.map((link) =>
            link.groups && link.groups.length > 0 ? (
              <NavigationMenuPrimitive.Item id={`nav-menu-item-${link.href}`} key={link.href}>
                <NavigationMenuPrimitive.Trigger
                  id={`nav-menu-trigger-${link.href}`}
                  className="group/button font-semiboldd flex items-center hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                >
                  <CustomLink
                    id={`nav-menu-link-${link.href}`}
                    className="p-3 font-semibold"
                    href={link.href}
                  >
                    {link.label}
                  </CustomLink>
                  <ChevronDown
                    id={`nav-menu-chevron-${link.href}`}
                    aria-hidden="true"
                    className="cursor-pointer transition duration-200 group-data-[state=open]/button:-rotate-180"
                  />
                </NavigationMenuPrimitive.Trigger>

                <NavigationMenuPrimitive.Content
                  id={`nav-menu-content-${link.href}`}
                  className="grid w-full grid-cols-2 gap-10 !px-[40px] 2xl:container data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 sm:px-10 lg:px-12 2xl:mx-auto 2xl:px-0"
                >
                  <div className="flex flex-col">
                    {link.groups.map((group) => (
                      <ul
                        id={`nav-menu-group-${group.href}`}
                        className="flex flex-col"
                        key={group.href}
                      >
                        <li id={`nav-menu-group-item-${group.href}`}>
                          <NavigationMenuPrimitive.Link asChild>
                            <CustomLink
                              id={`nav-menu-group-link-${group.href}`}
                              className="font-semiboldd block p-3"
                              href={group.href}
                            >
                              {group.label}
                            </CustomLink>
                          </NavigationMenuPrimitive.Link>
                        </li>
                        {group.links &&
                          group.links.length > 0 &&
                          group.links.map((nestedLink) => (
                            <li
                              id={`nav-menu-nested-item-${nestedLink.href}`}
                              key={nestedLink.href}
                            >
                              <NavigationMenuPrimitive.Link asChild>
                                <CustomLink
                                  id={`nav-menu-nested-link-${nestedLink.href}`}
                                  className="block p-3"
                                  href={nestedLink.href}
                                >
                                  {nestedLink.label}
                                </CustomLink>
                              </NavigationMenuPrimitive.Link>
                            </li>
                          ))}
                      </ul>
                    ))}
                  </div>
                </NavigationMenuPrimitive.Content>
              </NavigationMenuPrimitive.Item>
            ) : (
              <NavigationMenuPrimitive.Item id={`nav-menu-item-${link.href}`} key={link.href}>
                <NavigationMenuPrimitive.Link asChild>
                  <CustomLink
                    id={`nav-menu-link-${link.href}`}
                    className="p-3 font-semibold"
                    href={link.href}
                  >
                    {link.label}
                  </CustomLink>
                </NavigationMenuPrimitive.Link>
              </NavigationMenuPrimitive.Item>
            ),
          )}
        </NavigationMenuPrimitive.List>

        <NavigationMenuPrimitive.Viewport
          id="nav-menu-viewport"
          className="absolute start-0 top-full z-50 w-full bg-white pb-12 pt-6 shadow-xl duration-200 animate-in slide-in-from-top-5"
        />
      </NavigationMenuPrimitive.Root>

      <nav
        className="static-menu-class relative right-[1em] hidden items-center gap-10 text-[16px] font-normal text-[#008bb7] lg:flex lg:gap-5"
        id="static-menu"
      >
        <CustomLink href="/new" className="font-semiboldd hover:text-primary">
          New
        </CustomLink>
        <CustomLink href="/sale" className="font-semiboldd hover:text-primary">
          Sale
        </CustomLink>
        <CustomLink href="/blog" className="font-semiboldd hover:text-primary">
          Blog
        </CustomLink>
        <CustomLink href="/brands" className="font-semiboldd hover:text-primary">
          Our Brands
        </CustomLink>
      </nav>
    </div>
  </div>
);

Header.displayName = 'Header';

export { Header, type Links };