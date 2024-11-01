'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { clsx } from 'clsx';
import debounce from 'lodash.debounce';
import { ArrowRight, ChevronDown, Search, SearchIcon, ShoppingBag, User } from 'lucide-react';
import { forwardRef, Ref, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactHeadroom from 'react-headroom';

import { BcImage } from '~/components/bc-image';
import { Link } from '~/components/link';
import { usePathname, useRouter } from '~/i18n/routing';

import { Button } from '../button';
import { Spinner } from '../spinner';

import { HamburgerMenuButton } from './hamburger-menu-button';
import { type SearchResult, SearchResults } from './search-results';

interface Image {
  src?: string;
  alt: string;
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
  accountHref: string;
  activeLocale?: string;
  cartCount?: number;
  cartHref: string;
  links: Links[];
  locales?: Array<{ id: string; region: string; language: string }>;
  logo?: string | Image;
  searchHref: string;
  searchParamName?: string;
  searchAction?: (term: string) => Promise<SearchResult[]>;
  searchCtaLabel?: string;
  emptySearchTitleLabel?: string;
  emptySearchSubtitleLabel?: string;
  className?: string;
}

export const Navigation = forwardRef(function Navigation(
  {
    cartHref,
    cartCount,
    accountHref,
    links,
    logo,
    activeLocale,
    locales,
    searchHref,
    searchParamName = 'term',
    searchAction,
    searchCtaLabel,
    emptySearchTitleLabel,
    emptySearchSubtitleLabel,
    className,
    ...rest
  }: Props,
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
  const [navigationHeight, setNavigationHeight] = useState<number>(0);
  const menuTriggerRef = useRef<HTMLAnchorElement | null>(null);
  const firstCategoryLinkRef = useRef<HTMLAnchorElement>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [term, setTerm] = useState('');
  const [searchPending, setSearchPending] = useState(false);

  useEffect(() => {
    setNavOpen(false);
    setSearchOpen(false);
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
        setNavigationHeight(navHeight);
      } else {
        setNavigationHeight(announcementBarHeight + navHeight);
      }
    } else {
      setNavigationHeight(navHeight);
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

  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const searchTerm = searchInputRef.current?.value.trim() ?? '';

    if (searchTerm.length > 0) {
      router.push(`${searchHref}?${searchParamName}=${encodeURIComponent(searchTerm)}`);
    }
  };

  const debouncedOnSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        if (searchAction) {
          const results = await searchAction(query);

          setSearchResults(results);
        }
      }, 1000),
    [searchAction],
  );

  const fetchSearchResults = useCallback(
    async (query: string) => {
      await debouncedOnSearch(query);
    },
    [debouncedOnSearch],
  );

  useEffect(() => {
    if (term.length < 3 || !searchAction) {
      setSearchResults(null);
    } else {
      setSearchPending(true);

      void fetchSearchResults(term);
    }
  }, [term, fetchSearchResults, searchAction]);

  useEffect(() => {
    setSearchPending(false);
  }, [searchResults]);

  const handleTermChange = (e: React.FormEvent<HTMLInputElement>) => {
    setTerm(e.currentTarget.value);
  };

  return (
    <ReactHeadroom
      {...rest}
      className="sticky top-0 z-30 !h-0 w-full @container"
      onUnpin={() => setSearchOpen(false)}
      upTolerance={0}
    >
      <div
        className={clsx(
          'text-foreground relative mx-auto w-full max-w-screen-2xl @4xl:mx-[max(20px,auto)] @4xl:mt-5',
        )}
        onMouseLeave={() => setNavOpen(false)}
        ref={ref}
      >
        <nav
          className={clsx(
            className,
            'bg-background relative grid h-[60px] grid-cols-[1fr,2fr,1fr] items-center justify-between shadow-[2px_4px_24px_#00000010] @4xl:mx-5 @4xl:rounded-2xl md:grid-cols-[1fr,1fr,1fr]',
          )}
        >
          {/* Top Level Nav Links */}
          <ul className="relative flex items-stretch pl-2.5" ref={container}>
            {links.map((item, i) => (
              <li key={i}>
                <Link
                  className="hover:bg-contrast-100 relative mx-0.5 my-2.5 hidden items-center whitespace-nowrap rounded-xl p-2.5 text-sm font-medium ring-primary transition-colors duration-200 focus-visible:outline-0 focus-visible:ring-2 @4xl:inline-flex"
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
              <BcImage
                alt={logo.alt}
                className="object-contain"
                fill
                sizes="400px"
                src={logo.src}
              />
            ) : (
              typeof logo === 'string' && (
                <span className="font-heading text-foreground text-lg font-semibold leading-none @xl:text-2xl">
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
                className="@4xl:hover:bg-contrast-100 rounded-lg p-1.5 ring-primary transition-colors focus-visible:outline-0 focus-visible:ring-2"
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
              className="@4xl:hover:bg-contrast-100 rounded-lg p-1.5 ring-primary focus-visible:outline-0 focus-visible:ring-2"
              href={accountHref}
            >
              <User className={clsx('w-5', searchOpen && 'stroke-contrast-300')} strokeWidth={1} />
            </Link>
            <Link
              aria-label="Cart"
              className="@4xl:hover:bg-contrast-100 relative rounded-lg p-1.5 ring-primary focus-visible:outline-0 focus-visible:ring-2"
              href={cartHref}
            >
              <ShoppingBag
                className={clsx('w-5', searchOpen && 'stroke-contrast-300')}
                strokeWidth={1}
              />
              {cartCount != null && cartCount > 0 && (
                <span className="bg-foreground text-background absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Locale / Language Dropdown */}
            {locales && locales.length > 1 ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={clsx(
                    'hover:bg-contrast-100 hidden items-center gap-1 rounded-lg p-2 text-xs',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary @sm:flex',
                    searchOpen ? 'text-contrast-300' : 'text-foreground',
                  )}
                >
                  {selectedLanguage}
                  <ChevronDown
                    className={clsx('w-4', searchOpen && 'stroke-contrast-300')}
                    strokeWidth={1.5}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-background z-50 mt-4 max-h-80 w-20 overflow-y-scroll rounded-xl p-2 shadow-[2px_4px_24px_#00000010] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 @4xl:-ml-14 @4xl:w-32 @4xl:rounded-2xl @4xl:p-2">
                  {locales.map(({ id, language }) => (
                    <DropdownMenuItem
                      className={clsx(
                        'text-contrast-400 cursor-default rounded-lg px-2.5 py-2 text-sm font-medium outline-none transition-colors',
                        'hover:text-foreground focus:bg-contrast-100',
                        { 'text-foreground': selectedLanguage === language },
                      )}
                      key={id}
                      onSelect={() => {
                        setSelectedLanguage(language);

                        // router.replace('/', { locale: id as LocaleType })
                      }}
                    >
                      {language}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </nav>

        {/* Search Dropdown */}
        <div
          className={clsx(
            'absolute inset-x-0 mx-1.5 mt-1.5 overflow-y-auto rounded-2xl shadow-[2px_4px_24px_#00000010] transition-all duration-300 ease-in-out @4xl:mx-5',
            searchOpen
              ? 'bg-background scale-100 opacity-100'
              : 'pointer-events-none scale-[0.99] select-none bg-transparent opacity-0',
          )}
          ref={searchRef}
        >
          <form className="flex items-center gap-3 px-3 py-4 @xl:px-5" onSubmit={handleSearch}>
            <SearchIcon
              className="text-contrast-500 hidden w-5 shrink-0 @xl:block"
              strokeWidth={1}
            />
            <input
              className="flex-grow bg-transparent pl-2 text-lg font-medium outline-0 focus-visible:outline-none @xl:pl-0"
              name="searchTerm"
              onChange={handleTermChange}
              placeholder="Search Products"
              ref={searchInputRef}
              type="text"
            />
            <Button size="icon" type="submit" variant="secondary">
              {searchPending ? (
                <Spinner size="xs" />
              ) : (
                <ArrowRight aria-label="Submit" size={20} strokeWidth={1.5} />
              )}
            </Button>
          </form>

          {/* Search Results */}
          {searchResults && term.length > 2 && !searchPending ? (
            <SearchResults
              emptySearchSubtitleLabel={emptySearchSubtitleLabel}
              emptySearchTitleLabel={emptySearchTitleLabel}
              searchCtaLabel={searchCtaLabel}
              searchHref={searchHref}
              searchResults={searchResults}
              term={term}
            />
          ) : null}
        </div>

        {/* Menu Dropdown */}
        <div
          className={clsx(
            'mx-1.5 mt-1.5 overflow-y-auto rounded-3xl shadow-[2px_4px_24px_#00000010] transition-all duration-300 ease-in-out @4xl:mx-5 @4xl:max-h-96',
            navOpen
              ? 'bg-background scale-100 opacity-100 @4xl:h-full'
              : 'pointer-events-none h-0 scale-[0.99] select-none bg-transparent opacity-0',
          )}
          ref={menuRef}
          style={{ maxHeight: `calc(100dvh - ${navigationHeight}px)` }}
        >
          <div className="divide-contrast-100 flex flex-col divide-y @4xl:hidden">
            {/* Mobile Dropdown Links */}
            {links.map((item, i) => (
              <ul className="flex flex-col gap-1 p-3 @4xl:gap-2 @4xl:p-5" key={i}>
                {item.label !== '' && (
                  <li>
                    {item.href !== '' ? (
                      <Link
                        className="hover:bg-contrast-100 block rounded-lg px-3 py-2 font-semibold ring-primary transition-colors focus-visible:outline-0 focus-visible:ring-2 @4xl:py-4"
                        href={item.href}
                        tabIndex={navOpen ? 0 : -1}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className="hover:bg-contrast-100 block rounded-lg px-3 py-2 font-semibold ring-primary transition-colors focus-visible:outline-0 focus-visible:ring-2 @4xl:py-4">
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
                        className="text-contrast-500 hover:bg-contrast-100 hover:text-foreground block rounded-lg px-3 py-2 font-medium ring-primary transition-colors focus-visible:outline-0 focus-visible:ring-2 @4xl:py-4"
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
          <div className="divide-contrast-100 hidden w-full divide-x @4xl:grid @4xl:grid-cols-4">
            {/* Desktop Dropdown Links */}
            {selectedCategory !== null &&
              links[selectedCategory]?.groups?.map((group, columnIndex) => (
                <ul className="flex flex-col gap-1 p-5" key={columnIndex}>
                  {/* Second Level Links */}
                  {group.label != null && group.label !== '' && (
                    <li>
                      {group.href != null && group.href !== '' ? (
                        <Link
                          className="hover:bg-contrast-100 block rounded-lg px-3 py-2 font-medium ring-primary transition-colors focus-visible:outline-0 focus-visible:ring-2"
                          href={group.href}
                          ref={columnIndex === 0 ? firstCategoryLinkRef : undefined}
                          tabIndex={navOpen ? 0 : -1}
                        >
                          {group.label}
                        </Link>
                      ) : (
                        <span
                          className="hover:bg-contrast-100 block rounded-lg px-3 py-2 font-medium ring-primary transition-colors focus-visible:outline-0 focus-visible:ring-2"
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
                        className="text-contrast-500 hover:bg-contrast-100 hover:text-foreground block rounded-lg px-3 py-2 font-medium ring-primary transition-colors focus-visible:outline-0 focus-visible:ring-2"
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
