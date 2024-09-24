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
import { z } from 'zod';

import { Link } from '~/components/link';
import { LocaleType, usePathname, useRouter } from '~/i18n/routing';

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
  logo?: string | Image;
  activeLocale?: string;
  locales?: Array<{ id: string; region: string; language: string }>;
  searchHref: string;
}

export const Header = forwardRef(function Header(
  {
    cartHref,
    cartCount,
    accountHref,
    links,
    logo,
    activeLocale,
    locales,
    searchHref,
    ...rest
  }: Props,
  ref: Ref<HTMLDivElement>,
) {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();
  const container = useRef<HTMLUListElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLFormElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const menuTriggerRef = useRef<HTMLAnchorElement | null>(null);
  const firstCategoryLinkRef = useRef<HTMLAnchorElement>(null);

  const router = useRouter();

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
                {activeLocale}
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
                        'text-foreground': activeLocale === language,
                      },
                    )}
                    key={id}
                    onSelect={() => {
                      // setSelectedLanguage(language);
                      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                      router.replace('/', { locale: id as LocaleType });
                    }}
                  >
                    {language}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>

        {/* Search Dropdown */}
        <form
          action={(formData: FormData) => {
            const searchTerm = z.string().parse(formData.get('searchTerm'));

            if (searchTerm) {
              router.push(`${searchHref}?term=${searchTerm}`);
            }
          }}
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
            name="searchTerm"
            placeholder="Search Products"
            ref={searchInputRef}
            type="text"
          />
          {/* Search Submit Button */}
          <button
            // formAction={searchAction}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-foreground text-background ring-primary focus:outline-none focus:ring-[1px]"
            type="submit"
          >
            <ArrowRight aria-label="Submit" size={20} strokeWidth={1.5} />
          </button>
        </form>

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
