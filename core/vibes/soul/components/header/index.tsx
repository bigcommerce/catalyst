'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { clsx } from 'clsx';
import { ArrowRight, ChevronDown, Search, SearchIcon, ShoppingBag, User } from 'lucide-react';
import Image from 'next/image';
import { forwardRef, Ref, useEffect, useRef, useState } from 'react';
import ReactHeadroom from 'react-headroom';

import { Link } from '~/components/link';
import { usePathname } from '~/i18n/routing';

import { HamburgerMenuButton } from './hamburguer-menu-button';

interface Image {
  src?: string;
  altText: string;
}

export interface Links {
  label: string;
  href: string;
  groups?: Array<{
    label?: string;
    href?: string;
    links: Array<{
      label: string;
      href: string;
    }>;
  }>;
}

interface Props {
  cartHref: string;
  cartCount?: number;
  accountHref: string;
  links: Links[];
  // searchAction: (query: string) => Promise<SerializableProduct[]>
  logo?: string | Image;
  activeLocale?: string;
  locales?: Array<{ id: string; region: string; language: string }>;
}

export const Header = forwardRef(function Header(
  { cartHref, cartCount, accountHref, links, logo, activeLocale, locales, ...rest }: Props,
  ref: Ref<HTMLDivElement>,
) {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();
  const container = useRef<HTMLUListElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>(activeLocale);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const menuTriggerRef = useRef<HTMLAnchorElement | null>(null);
  const firstCategoryLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (selectedCategory === null) {
      setNavOpen(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', navOpen);
  }, [navOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        event.target instanceof Node &&
        !searchRef.current.contains(event.target)
      ) {
        setSearchOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSearchOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchRef]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Set the dropdown menu height based on the announcement bar presence/height
  useEffect(() => {
    const announcementBar = document.querySelector('#announcement-bar');
    const navHeight = 72;

    if (announcementBar) {
      const announcementBarHeight = announcementBar.clientHeight;

      if (window.scrollY > announcementBarHeight) {
        setHeaderHeight(navHeight);
      } else {
        setHeaderHeight(announcementBarHeight + navHeight);
      }
    } else {
      setHeaderHeight(navHeight);
    }
  }, [navOpen]);

  useEffect(() => {
    // TODO: trap focus in category menu when it's open
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setNavOpen(false);

        // Return focus to the menu item that opened the category menu
        if (menuTriggerRef.current) {
          menuTriggerRef.current.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuRef]);

  return (
    <ReactHeadroom
      {...rest}
      className="sticky top-0 z-30 !h-0 w-full @container"
      onUnpin={() => setSearchOpen(false)}
      style={{
        WebkitTransition: 'transform .5s ease-in-out',
        MozTransition: 'transform .5s ease-in-out',
        OTransition: 'transform .5s ease-in-out',
        transition: 'transform .5s ease-in-out',
      }}
      upTolerance={0}
    >
      <div
        className="relative mx-auto w-full max-w-screen-2xl text-foreground @4xl:mx-[max(20px,auto)] @4xl:mt-5"
        onMouseLeave={() => setNavOpen(false)}
        ref={ref}
      >
        <nav className="relative grid h-[60px] grid-cols-[1fr,2fr,1fr] items-center justify-between bg-background shadow-[2px_4px_24px_#00000010] @4xl:mx-5 @4xl:rounded-3xl md:grid-cols-[1fr,1fr,1fr]">
          {/* Top Level Nav Links */}
          <ul className="relative flex items-stretch pl-2.5" ref={container}>
            {links.map((item, i) => (
              <li key={i}>
                <Link
                  className="relative mx-0.5 my-2.5 hidden items-center whitespace-nowrap rounded-xl p-2.5 text-sm font-medium ring-primary transition-colors duration-200 hover:bg-contrast-100 focus-visible:outline-0 focus-visible:ring-2 @4xl:inline-flex"
                  href={item.href}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      setSelectedCategory(i);
                      setNavOpen(true);
                      menuTriggerRef.current = event.currentTarget;

                      setTimeout(() => {
                        if (firstCategoryLinkRef.current) {
                          firstCategoryLinkRef.current.focus();
                        }
                      }, 0);
                    }
                  }}
                  onMouseOver={() => {
                    setSelectedCategory(i);
                    setNavOpen(true);
                    setSearchOpen(false);
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Logo */}
          <Link
            className="relative mx-auto my-2 flex h-10 w-full max-w-56 items-center justify-center rounded-xl ring-primary focus-visible:outline-0 focus-visible:ring-2"
            href="/"
          >
            {typeof logo === 'object' && logo.src != null && logo.src !== '' ? (
              <Image
                alt={logo.altText}
                className="object-contain"
                fill
                sizes="400px"
                src={logo.src}
              />
            ) : (
              typeof logo === 'string' && (
                <span className="font-heading text-lg font-semibold leading-none text-foreground @xl:text-2xl">
                  {logo}
                </span>
              )
            )}
          </Link>

          <div className="ml-auto mr-1 flex items-center gap-0 transition-colors duration-300 @sm:mr-0 @4xl:mr-2.5">
            {/* Mobile Buttons */}
            <div className="absolute left-1 flex items-center @4xl:relative @4xl:left-0">
              {/* Hamburger Menu Button */}
              <HamburgerMenuButton
                navOpen={navOpen}
                searchOpen={searchOpen}
                setNavOpen={setNavOpen}
              />

              <button
                aria-label="Search"
                className="rounded-lg p-1.5 ring-primary transition-colors focus-visible:outline-0 focus-visible:ring-2 @4xl:hover:bg-contrast-100"
                onClick={() => {
                  setNavOpen(false);
                  setSearchOpen(!searchOpen);
                }}
              >
                <Search className="w-5" strokeWidth={1} />
              </button>
            </div>
            <Link
              aria-label="Profile"
              className="rounded-lg p-1.5 ring-primary focus-visible:outline-0 focus-visible:ring-2 @4xl:hover:bg-contrast-100"
              href={accountHref}
            >
              <User className={clsx('w-5', searchOpen && 'stroke-contrast-300')} strokeWidth={1} />
            </Link>
            <Link
              aria-label="Cart"
              className="relative rounded-lg p-1.5 ring-primary focus-visible:outline-0 focus-visible:ring-2 @4xl:hover:bg-contrast-100"
              href={cartHref}
            >
              <ShoppingBag
                className={clsx('w-5', searchOpen && 'stroke-contrast-300')}
                strokeWidth={1}
              />
              {cartCount != null && cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-xs text-background">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Locale / Language Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={clsx(
                  'hidden items-center gap-1 rounded-lg bg-white p-2 text-xs uppercase hover:bg-contrast-100',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary @sm:flex',
                  searchOpen ? 'text-contrast-300' : 'text-foreground',
                )}
              >
                {selectedLanguage}
                <ChevronDown
                  className={clsx('w-4', searchOpen && 'stroke-contrast-300')}
                  strokeWidth={1.5}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-50 mt-4 max-h-80 w-20 overflow-y-scroll rounded-xl bg-background p-2 shadow-[2px_4px_24px_#00000010] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 @4xl:-ml-14 @4xl:w-32 @4xl:rounded-3xl @4xl:p-4">
                {locales?.map(({ id, language }) => (
                  <DropdownMenuItem
                    className={clsx(
                      'cursor-default rounded-xl px-3 py-2 text-sm font-medium uppercase text-contrast-400 outline-none transition-colors',
                      'hover:text-foreground focus:bg-contrast-100 @4xl:text-base',
                      {
                        'text-foreground': selectedLanguage === language,
                      },
                    )}
                    key={id}
                    onSelect={() => setSelectedLanguage(language)}
                  >
                    {language}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>

        {/* Search Dropdown */}
        <div
          className={clsx(
            'absolute inset-x-0 mx-1.5 mt-1.5 flex items-center gap-3 overflow-y-auto rounded-3xl px-3 py-4 shadow-[2px_4px_24px_#00000010] transition-all duration-300 ease-in-out @xl:px-5 @4xl:mx-5',
            searchOpen
              ? 'scale-100 bg-background opacity-100'
              : 'pointer-events-none scale-[0.99] select-none bg-transparent opacity-0',
          )}
          ref={searchRef}
        >
          <SearchIcon className="hidden w-5 shrink-0 text-contrast-500 @xl:block" strokeWidth={1} />
          <input
            className="flex-grow bg-transparent pl-2 text-lg font-medium outline-0 @xl:pl-0"
            placeholder="Search Products"
            ref={searchInputRef}
            type="text"
          />

          <span className="hidden shrink-0 gap-1.5 whitespace-nowrap text-xs text-contrast-500 @xl:flex">
            Powered by
            <svg
              aria-label="Algolia logo"
              className="w-14 fill-contrast-500"
              viewBox="0 0 2196.2 500"
            >
              <title>Algolia</title>
              <path d="M1070.38,275.3V5.91c0-3.63-3.24-6.39-6.82-5.83l-50.46,7.94c-2.87,.45-4.99,2.93-4.99,5.84l.17,273.22c0,12.92,0,92.7,95.97,95.49,3.33,.1,6.09-2.58,6.09-5.91v-40.78c0-2.96-2.19-5.51-5.12-5.84-34.85-4.01-34.85-47.57-34.85-54.72Z" />
              <rect height="277.9" rx="5.9" ry="5.9" width="62.58" x="1845.88" y="104.73" />
              <path d="M1851.78,71.38h50.77c3.26,0,5.9-2.64,5.9-5.9V5.9c0-3.62-3.24-6.39-6.82-5.83l-50.77,7.95c-2.87,.45-4.99,2.92-4.99,5.83v51.62c0,3.26,2.64,5.9,5.9,5.9Z" />
              <path d="M1764.03,275.3V5.91c0-3.63-3.24-6.39-6.82-5.83l-50.46,7.94c-2.87,.45-4.99,2.93-4.99,5.84l.17,273.22c0,12.92,0,92.7,95.97,95.49,3.33,.1,6.09-2.58,6.09-5.91v-40.78c0-2.96-2.19-5.51-5.12-5.84-34.85-4.01-34.85-47.57-34.85-54.72Z" />
              <path d="M1631.95,142.72c-11.14-12.25-24.83-21.65-40.78-28.31-15.92-6.53-33.26-9.85-52.07-9.85-18.78,0-36.15,3.17-51.92,9.85-15.59,6.66-29.29,16.05-40.76,28.31-11.47,12.23-20.38,26.87-26.76,44.03-6.38,17.17-9.24,37.37-9.24,58.36,0,20.99,3.19,36.87,9.55,54.21,6.38,17.32,15.14,32.11,26.45,44.36,11.29,12.23,24.83,21.62,40.6,28.46,15.77,6.83,40.12,10.33,52.4,10.48,12.25,0,36.78-3.82,52.7-10.48,15.92-6.68,29.46-16.23,40.78-28.46,11.29-12.25,20.05-27.04,26.25-44.36,6.22-17.34,9.24-33.22,9.24-54.21,0-20.99-3.34-41.19-10.03-58.36-6.38-17.17-15.14-31.8-26.43-44.03Zm-44.43,163.75c-11.47,15.75-27.56,23.7-48.09,23.7-20.55,0-36.63-7.8-48.1-23.7-11.47-15.75-17.21-34.01-17.21-61.2,0-26.89,5.59-49.14,17.06-64.87,11.45-15.75,27.54-23.52,48.07-23.52,20.55,0,36.63,7.78,48.09,23.52,11.47,15.57,17.36,37.98,17.36,64.87,0,27.19-5.72,45.3-17.19,61.2Z" />
              <path d="M894.42,104.73h-49.33c-48.36,0-90.91,25.48-115.75,64.1-14.52,22.58-22.99,49.63-22.99,78.73,0,44.89,20.13,84.92,51.59,111.1,2.93,2.6,6.05,4.98,9.31,7.14,12.86,8.49,28.11,13.47,44.52,13.47,1.23,0,2.46-.03,3.68-.09,.36-.02,.71-.05,1.07-.07,.87-.05,1.75-.11,2.62-.2,.34-.03,.68-.08,1.02-.12,.91-.1,1.82-.21,2.73-.34,.21-.03,.42-.07,.63-.1,32.89-5.07,61.56-30.82,70.9-62.81v57.83c0,3.26,2.64,5.9,5.9,5.9h50.42c3.26,0,5.9-2.64,5.9-5.9V110.63c0-3.26-2.64-5.9-5.9-5.9h-56.32Zm0,206.92c-12.2,10.16-27.97,13.98-44.84,15.12-.16,.01-.33,.03-.49,.04-1.12,.07-2.24,.1-3.36,.1-42.24,0-77.12-35.89-77.12-79.37,0-10.25,1.96-20.01,5.42-28.98,11.22-29.12,38.77-49.74,71.06-49.74h49.33v142.83Z" />
              <path d="M2133.97,104.73h-49.33c-48.36,0-90.91,25.48-115.75,64.1-14.52,22.58-22.99,49.63-22.99,78.73,0,44.89,20.13,84.92,51.59,111.1,2.93,2.6,6.05,4.98,9.31,7.14,12.86,8.49,28.11,13.47,44.52,13.47,1.23,0,2.46-.03,3.68-.09,.36-.02,.71-.05,1.07-.07,.87-.05,1.75-.11,2.62-.2,.34-.03,.68-.08,1.02-.12,.91-.1,1.82-.21,2.73-.34,.21-.03,.42-.07,.63-.1,32.89-5.07,61.56-30.82,70.9-62.81v57.83c0,3.26,2.64,5.9,5.9,5.9h50.42c3.26,0,5.9-2.64,5.9-5.9V110.63c0-3.26-2.64-5.9-5.9-5.9h-56.32Zm0,206.92c-12.2,10.16-27.97,13.98-44.84,15.12-.16,.01-.33,.03-.49,.04-1.12,.07-2.24,.1-3.36,.1-42.24,0-77.12-35.89-77.12-79.37,0-10.25,1.96-20.01,5.42-28.98,11.22-29.12,38.77-49.74,71.06-49.74h49.33v142.83Z" />
              <path d="M1314.05,104.73h-49.33c-48.36,0-90.91,25.48-115.75,64.1-11.79,18.34-19.6,39.64-22.11,62.59-.58,5.3-.88,10.68-.88,16.14s.31,11.15,.93,16.59c4.28,38.09,23.14,71.61,50.66,94.52,2.93,2.6,6.05,4.98,9.31,7.14,12.86,8.49,28.11,13.47,44.52,13.47h0c17.99,0,34.61-5.93,48.16-15.97,16.29-11.58,28.88-28.54,34.48-47.75v50.26h-.11v11.08c0,21.84-5.71,38.27-17.34,49.36-11.61,11.08-31.04,16.63-58.25,16.63-11.12,0-28.79-.59-46.6-2.41-2.83-.29-5.46,1.5-6.27,4.22l-12.78,43.11c-1.02,3.46,1.27,7.02,4.83,7.53,21.52,3.08,42.52,4.68,54.65,4.68,48.91,0,85.16-10.75,108.89-32.21,21.48-19.41,33.15-48.89,35.2-88.52V110.63c0-3.26-2.64-5.9-5.9-5.9h-56.32Zm0,64.1s.65,139.13,0,143.36c-12.08,9.77-27.11,13.59-43.49,14.7-.16,.01-.33,.03-.49,.04-1.12,.07-2.24,.1-3.36,.1-1.32,0-2.63-.03-3.94-.1-40.41-2.11-74.52-37.26-74.52-79.38,0-10.25,1.96-20.01,5.42-28.98,11.22-29.12,38.77-49.74,71.06-49.74h49.33Z" />
              <path d="M249.83,0C113.3,0,2,110.09,.03,246.16c-2,138.19,110.12,252.7,248.33,253.5,42.68,.25,83.79-10.19,120.3-30.03,3.56-1.93,4.11-6.83,1.08-9.51l-23.38-20.72c-4.75-4.21-11.51-5.4-17.36-2.92-25.48,10.84-53.17,16.38-81.71,16.03-111.68-1.37-201.91-94.29-200.13-205.96,1.76-110.26,92-199.41,202.67-199.41h202.69V407.41l-115-102.18c-3.72-3.31-9.42-2.66-12.42,1.31-18.46,24.44-48.53,39.64-81.93,37.34-46.33-3.2-83.87-40.5-87.34-86.81-4.15-55.24,39.63-101.52,94-101.52,49.18,0,89.68,37.85,93.91,85.95,.38,4.28,2.31,8.27,5.52,11.12l29.95,26.55c3.4,3.01,8.79,1.17,9.63-3.3,2.16-11.55,2.92-23.58,2.07-35.92-4.82-70.34-61.8-126.93-132.17-131.26-80.68-4.97-148.13,58.14-150.27,137.25-2.09,77.1,61.08,143.56,138.19,145.26,32.19,.71,62.03-9.41,86.14-26.95l150.26,133.2c6.44,5.71,16.61,1.14,16.61-7.47V9.48C499.66,4.25,495.42,0,490.18,0H249.83Z" />
            </svg>
          </span>
          {/* Search Submit Button */}
          <button
            // formAction={searchAction}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-foreground text-background ring-primary focus:outline-none focus:ring-[1px]"
            type="submit"
          >
            <ArrowRight aria-label="Submit" size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Menu Dropdown */}
        <div
          className={clsx(
            'mx-1.5 mt-1.5 overflow-y-auto rounded-3xl shadow-[2px_4px_24px_#00000010] transition-all duration-300 ease-in-out @4xl:mx-5 @4xl:max-h-96',
            navOpen
              ? 'scale-100 bg-background opacity-100 @4xl:h-full'
              : 'pointer-events-none h-0 scale-[0.99] select-none bg-transparent opacity-0',
          )}
          ref={menuRef}
          style={{ maxHeight: `calc(100dvh - ${headerHeight}px)` }}
        >
          <div className="flex flex-col divide-y divide-contrast-100 @4xl:hidden">
            {/* Mobile Dropdown Links */}
            {links.map((item, i) => (
              <ul className="flex flex-col gap-1 p-3 @4xl:gap-2 @4xl:p-5" key={i}>
                {Boolean(item.label) && (
                  <li>
                    {item.href ? (
                      <Link
                        className="block rounded-lg px-3 py-2 font-semibold ring-primary transition-colors hover:bg-contrast-100 focus-visible:outline-0 focus-visible:ring-2 @4xl:py-4"
                        href={item.href}
                        tabIndex={navOpen ? 0 : -1}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className="block rounded-lg px-3 py-2 font-semibold ring-primary transition-colors hover:bg-contrast-100 focus-visible:outline-0 focus-visible:ring-2 @4xl:py-4">
                        {item.label}
                      </span>
                    )}
                  </li>
                )}
                {item.groups
                  ?.flatMap((group) => group.links)
                  .map((link, j) => (
                    <li key={j}>
                      <Link
                        className="block rounded-lg px-3 py-2 font-medium text-contrast-500 ring-primary transition-colors hover:bg-contrast-100 hover:text-foreground focus-visible:outline-0 focus-visible:ring-2 @4xl:py-4"
                        href={link.href}
                        tabIndex={navOpen ? 0 : -1}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            ))}
          </div>
          <div className="hidden w-full divide-x divide-contrast-100 @4xl:grid @4xl:grid-cols-4">
            {/* Desktop Dropdown Links */}
            {selectedCategory !== null &&
              links[selectedCategory]?.groups?.map((group, columnIndex) => (
                <ul className="flex flex-col gap-1 p-5" key={columnIndex}>
                  {/* Second Level Links */}
                  {group.label != null && group.label !== '' && (
                    <li>
                      {group.href != null && group.href !== '' ? (
                        <Link
                          className="block rounded-lg px-3 py-2 font-medium ring-primary transition-colors hover:bg-contrast-100 focus-visible:outline-0 focus-visible:ring-2"
                          href={group.href}
                          ref={columnIndex === 0 ? firstCategoryLinkRef : undefined}
                          tabIndex={navOpen ? 0 : -1}
                        >
                          {group.label}
                        </Link>
                      ) : (
                        <span
                          className="block rounded-lg px-3 py-2 font-medium ring-primary transition-colors hover:bg-contrast-100 focus-visible:outline-0 focus-visible:ring-2"
                          ref={columnIndex === 0 ? firstCategoryLinkRef : undefined}
                        >
                          {group.label}
                        </span>
                      )}
                    </li>
                  )}
                  {group.links.map((link, idx) => (
                    // Third Level Links
                    <li key={idx}>
                      <Link
                        className="block rounded-lg px-3 py-2 font-medium text-contrast-500 ring-primary transition-colors hover:bg-contrast-100 hover:text-foreground focus-visible:outline-0 focus-visible:ring-2"
                        href={link.href}
                        tabIndex={navOpen ? 0 : -1}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ))}
          </div>
        </div>
      </div>
    </ReactHeadroom>
  );
});
