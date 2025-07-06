'use client';

import { SubmissionResult, useForm } from '@conform-to/react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Popover from '@radix-ui/react-popover';
import { clsx } from 'clsx';
import debounce from 'lodash.debounce';
import {
  ArrowRight,
  ChevronDown,
  Search,
  SearchIcon,
  ShoppingBag,
  ShoppingBasket,
  User,
  PhoneCall,
  ChevronDownIcon,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import React, {
  forwardRef,
  Ref,
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';
import { useFormStatus } from 'react-dom';

import { FormStatus } from '@/vibes/soul/form/form-status';
import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Button } from '@/vibes/soul/primitives/button';
import { Logo } from '@/vibes/soul/primitives/logo';
import { Price } from '@/vibes/soul/primitives/price-label';
import { ProductCard } from '@/vibes/soul/primitives/product-card';
import { Link } from '~/components/link';
import { usePathname, useRouter } from '~/i18n/routing';
import { button } from '~/lib/makeswift/components/site-theme/components/button';

interface Link {
  label: string;
  href: string;
  image?: string; // Add image property for category icon
  groups?: Array<{
    label?: string;
    href?: string;
    links: Array<{
      label: string;
      href: string;
    }>;
  }>;
}

interface Locale {
  id: string;
  label: string;
}

interface Currency {
  id: string;
  label: string;
}

type Action<State, Payload> = (
  state: Awaited<State>,
  payload: Awaited<Payload>,
) => State | Promise<State>;

export type SearchResult =
  | {
      type: 'products';
      title: string;
      products: Array<{
        id: string;
        title: string;
        href: string;
        price?: Price;
        image?: { src: string; alt: string };
      }>;
    }
  | {
      type: 'links';
      title: string;
      links: Array<{ label: string; href: string }>;
    };

type CurrencyAction = Action<SubmissionResult | null, FormData>;
type SearchAction<S extends SearchResult> = Action<
  {
    searchResults: S[] | null;
    lastResult: SubmissionResult | null;
    emptyStateTitle?: string;
    emptyStateSubtitle?: string;
  },
  FormData
>;

interface Props<S extends SearchResult> {
  className?: string;
  isFloating?: boolean;
  accountHref: string;
  cartCount?: Streamable<number | null>;
  cartHref: string;
  links: Streamable<Link[]>;
  categoryLinks: Link[];
  linksPosition?: 'center' | 'left' | 'right';
  locales?: Locale[];
  phoneNumber?: string;
  centerRightBlock?: boolean;
  activeLocaleId?: string;
  currencies?: Currency[];
  activeCurrencyId?: string;
  currencyAction?: CurrencyAction;
  logo?: Streamable<string | { src: string; alt: string } | null>;
  logoWidth?: number;
  logoHeight?: number;
  logoHref?: string;
  logoLabel?: string;
  mobileLogo?: Streamable<string | { src: string; alt: string } | null>;
  mobileLogoWidth?: number;
  mobileLogoHeight?: number;
  searchHref: string;
  searchParamName?: string;
  searchAction?: SearchAction<S>;
  searchCtaLabel?: string;
  searchInputPlaceholder?: string;
  cartLabel?: string;
  accountLabel?: string;
  openSearchPopupLabel?: string;
  searchLabel?: string;
  mobileMenuTriggerLabel?: string;
}

const MobileMenuButton = forwardRef<
  React.ComponentRef<'button'>,
  { open: boolean } & React.ComponentPropsWithoutRef<'button'>
>(({ open, className, ...rest }, ref) => {
  return (
    <button
      {...rest}
      className={clsx(
        'group relative rounded-lg p-2 outline-0 ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors focus-visible:ring-2',
        className,
      )}
      ref={ref}
    >
      <div className="flex h-4 w-4 origin-center transform flex-col justify-between overflow-hidden transition-all duration-300">
        <div
          className={clsx(
            'h-px origin-left transform bg-[var(--nav-mobile-button-icon,hsl(var(--foreground)))] transition-all duration-300',
            open ? 'translate-x-10' : 'w-7',
          )}
        />
        <div
          className={clsx(
            'h-px transform rounded bg-[var(--nav-mobile-button-icon,hsl(var(--foreground)))] transition-all delay-75 duration-300',
            open ? 'translate-x-10' : 'w-7',
          )}
        />
        <div
          className={clsx(
            'h-px origin-left transform bg-[var(--nav-mobile-button-icon,hsl(var(--foreground)))] transition-all delay-150 duration-300',
            open ? 'translate-x-10' : 'w-7',
          )}
        />

        <div
          className={clsx(
            'absolute top-2 flex transform items-center justify-between bg-[var(--nav-mobile-button-icon,hsl(var(--foreground)))] transition-all duration-500',
            open ? 'w-12 translate-x-0' : 'w-0 -translate-x-10',
          )}
        >
          <div
            className={clsx(
              'absolute h-px w-4 transform bg-[var(--nav-mobile-button-icon,hsl(var(--foreground)))] transition-all delay-300 duration-500',
              open ? 'rotate-45' : 'rotate-0',
            )}
          />
          <div
            className={clsx(
              'absolute h-px w-4 transform bg-[var(--nav-mobile-button-icon,hsl(var(--foreground)))] transition-all delay-300 duration-500',
              open ? '-rotate-45' : 'rotate-0',
            )}
          />
        </div>
      </div>
    </button>
  );
});

MobileMenuButton.displayName = 'MobileMenuButton';

const navGroupClassName =
  'block rounded-lg bg-[var(--nav-group-background,transparent)] px-3 py-2 font-[family-name:var(--nav-group-font-family,var(--font-family-body))] font-medium text-[var(--nav-group-text,hsl(var(--foreground)))] ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors hover:bg-[var(--nav-group-background-hover,hsl(var(--contrast-100)))] hover:text-[var(--nav-group-text-hover,hsl(var(--foreground)))] focus-visible:outline-0 focus-visible:ring-2';
const navButtonClassName =
  'relative rounded-lg bg-[var(--nav-button-background,transparent)] p-1.5 text-[var(--nav-button-icon,hsl(var(--foreground)))] ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors focus-visible:outline-0 focus-visible:ring-2 @4xl:hover:bg-[var(--nav-button-background-hover,hsl(var(--contrast-100)))] @4xl:hover:text-[var(--nav-button-icon-hover,hsl(var(--foreground)))]';
const navCustomButtonClassName =
  'relative rounded-lg bg-[var(--nav-button-background,transparent)] p-1.5 text-[var(--nav-button-icon,hsl(var(--foreground)))] ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors focus-visible:outline-0 focus-visible:ring-2';

/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --nav-focus: hsl(var(--primary));
 *   --nav-background: hsl(var(--background));
 *   --nav-floating-border: hsl(var(--foreground) / 10%);
 *   --nav-link-text: hsl(var(--foreground));
 *   --nav-link-text-hover: hsl(var(--foreground));
 *   --nav-link-background: transparent;
 *   --nav-link-background-hover: hsl(var(--contrast-100));
 *   --nav-link-font-family: var(--font-family-body);
 *   --nav-group-text: hsl(var(--foreground));
 *   --nav-group-text-hover: hsl(var(--foreground));
 *   --nav-group-background: transparent;
 *   --nav-group-background-hover: hsl(var(--contrast-100));
 *   --nav-group-font-family: var(--font-family-body);
 *   --nav-sub-link-text: hsl(var(--contrast-500));
 *   --nav-sub-link-text-hover: hsl(var(--foreground));
 *   --nav-sub-link-background: transparent;
 *   --nav-sub-link-background-hover: hsl(var(--contrast-100));
 *   --nav-sub-link-font-family: var(--font-family-body);
 *   --nav-button-icon: hsl(var(--foreground));
 *   --nav-button-icon-hover: hsl(var(--foreground));
 *   --nav-button-background: hsl(var(--background));
 *   --nav-button-background-hover: hsl(var(--contrast-100));
 *   --nav-menu-background: hsl(var(--background));
 *   --nav-menu-border: hsl(var(--foreground) / 5%);
 *   --nav-mobile-background: hsl(var(--background));
 *   --nav-mobile-divider: hsl(var(--contrast-100));
 *   --nav-mobile-button-icon: hsl(var(--foreground));
 *   --nav-mobile-link-text: hsl(var(--foreground));
 *   --nav-mobile-link-text-hover: hsl(var(--foreground));
 *   --nav-mobile-link-background: transparent;
 *   --nav-mobile-link-background-hover: hsl(var(--contrast-100));
 *   --nav-mobile-link-font-family: var(--font-family-body);
 *   --nav-mobile-sub-link-text: hsl(var(--contrast-500));
 *   --nav-mobile-sub-link-text-hover: hsl(var(--foreground));
 *   --nav-mobile-sub-link-background: transparent;
 *   --nav-mobile-sub-link-background-hover: hsl(var(--contrast-100));
 *   --nav-mobile-sub-link-font-family: var(--font-family-body);
 *   --nav-search-background: hsl(var(--background));
 *   --nav-search-border: hsl(var(--foreground) / 5%);
 *   --nav-search-divider: hsl(var(--foreground) / 5%);
 *   --nav-search-icon: hsl(var(--contrast-500));
 *   --nav-search-empty-title: hsl(var(--foreground));
 *   --nav-search-empty-subtitle: hsl(var(--contrast-500));
 *   --nav-search-result-title: hsl(var(--foreground));
 *   --nav-search-result-title-font-family: var(--font-family-mono);
 *   --nav-search-result-link-text: hsl(var(--foreground));
 *   --nav-search-result-link-text-hover: hsl(var(--foreground));
 *   --nav-search-result-link-background: hsl(var(--background));
 *   --nav-search-result-link-background-hover: hsl(var(--contrast-100));
 *   --nav-search-result-link-font-family: var(--font-family-body);
 *   --nav-cart-count-text: hsl(var(--background));
 *   --nav-cart-count-background: hsl(var(--foreground));
 *   --nav-locale-background: hsl(var(--background));
 *   --nav-locale-link-text: hsl(var(--contrast-400));
 *   --nav-locale-link-text-hover: hsl(var(--foreground));
 *   --nav-locale-link-text-selected: hsl(var(--foreground));
 *   --nav-locale-link-background: transparent;
 *   --nav-locale-link-background-hover: hsl(var(--contrast-100));
 *   --nav-locale-link-font-family: var(--font-family-body);
 * }
 * ```
 */

const DEFAULT_CATEGORY_IMAGE_URL =
  'https://betterineraction.nyc3.cdn.digitaloceanspaces.com/category-placeholder.svg';

export const Navigation = forwardRef(function Navigation<S extends SearchResult>(
  {
    className,
    isFloating = false,
    cartHref,
    cartCount: streamableCartCount,
    accountHref,
    links: streamableLinks,
    categoryLinks,
    logo: streamableLogo,
    logoHref = '/',
    logoLabel = 'Home',
    logoWidth = 200,
    logoHeight = 80,
    mobileLogo: streamableMobileLogo,
    mobileLogoWidth = 100,
    mobileLogoHeight = 40,
    linksPosition = 'center',
    activeLocaleId,
    locales,
    currencies,
    phoneNumber,
    centerRightBlock,
    activeCurrencyId,
    currencyAction,
    searchHref,
    searchParamName = 'query',
    searchAction,
    searchCtaLabel,
    searchInputPlaceholder,
    cartLabel = 'Cart',
    accountLabel = 'Profile',
    openSearchPopupLabel = 'Open search popup',
    searchLabel = 'Search',
    mobileMenuTriggerLabel = 'Toggle navigation',
  }: Props<S>,
  ref: Ref<HTMLDivElement>,
) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAllProductsOpen, setIsAllProductsOpen] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleScroll() {
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <NavigationMenu.Root
      className={clsx('relative mx-auto w-full max-w-screen-2xl @container', className)}
      delayDuration={0}
      onValueChange={() => setIsSearchOpen(false)}
      ref={ref}
    >
      <div
        className={clsx(
          'flex items-center justify-between gap-1 bg-[var(--nav-background,hsl(var(--background)))] py-2 pl-3 pr-2 transition-shadow @4xl:rounded-2xl @4xl:px-2 @4xl:pl-6 @4xl:pr-2.5',
          isFloating
            ? 'shadow-xl ring-1 ring-[var(--nav-floating-border,hsl(var(--foreground)/10%))]'
            : 'shadow-none ring-0',
        )}
      >
        {/* Mobile Menu */}
        <Popover.Root onOpenChange={setIsMobileMenuOpen} open={isMobileMenuOpen}>
          <Popover.Anchor className="absolute left-0 right-0 top-full" />
          <Popover.Trigger asChild>
            <MobileMenuButton
              aria-label={mobileMenuTriggerLabel}
              className="mr-1 @4xl:hidden"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              open={isMobileMenuOpen}
            />
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content className="max-h-[calc(var(--radix-popover-content-available-height)-8px)] w-[var(--radix-popper-anchor-width)] @container data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
              <div className="max-h-[inherit] divide-y divide-[var(--nav-mobile-divider,hsl(var(--contrast-100)))] overflow-y-auto bg-[var(--nav-mobile-background,hsl(var(--background)))]">
                {/* Static Links on Mobile */}

                <ul className="flex flex-col p-2 @4xl:gap-2 @4xl:p-5">
                  <li>
                    <button
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 font-semibold text-[var(--nav-mobile-link-text,hsl(var(--foreground)))] focus:outline-none"
                      onClick={() => setIsAllProductsOpen((open) => !open)}
                      aria-expanded={isAllProductsOpen}
                    >
                      All Products
                      <ChevronDownIcon
                        className={clsx('transition-transform', isAllProductsOpen && 'rotate-180')}
                        size={20}
                        strokeWidth={3}
                      />
                    </button>
                    {isAllProductsOpen && (
                      <ul className="pl-4">
                        {categoryLinks.map((category, idx) =>
                          category.href ? (
                            <li key={idx}>
                              <Link
                                href={category.href}
                                className="block rounded-lg px-3 py-2 text-sm text-[var(--nav-mobile-sub-link-text,hsl(var(--contrast-500)))]"
                              >
                                {category.label}
                              </Link>
                            </li>
                          ) : (
                            <li
                              key={idx}
                              className="block rounded-lg px-3 py-2 text-sm text-[var(--nav-mobile-sub-link-text,hsl(var(--contrast-500)))]"
                            >
                              {category.label}
                            </li>
                          ),
                        )}
                      </ul>
                    )}
                  </li>
                </ul>

                {/**
                 * Dynamic Links on Mobile
                 */}
                <Stream
                  fallback={
                    <ul className="flex animate-pulse flex-col gap-4 p-5 @4xl:gap-2 @4xl:p-5">
                      <li>
                        <span className="block h-4 w-10 rounded-md bg-contrast-100" />
                      </li>
                      <li>
                        <span className="block h-4 w-14 rounded-md bg-contrast-100" />
                      </li>
                      <li>
                        <span className="block h-4 w-24 rounded-md bg-contrast-100" />
                      </li>
                      <li>
                        <span className="block h-4 w-16 rounded-md bg-contrast-100" />
                      </li>
                    </ul>
                  }
                  value={streamableLinks}
                >
                  {(links) =>
                    links.map((item, i) => (
                      <ul className="flex flex-col p-2 @4xl:gap-2 @4xl:p-5" key={i}>
                        {item.label !== '' && (
                          <li>
                            <Link
                              className="block rounded-lg bg-[var(--nav-mobile-link-background,transparent)] px-3 py-2 font-[family-name:var(--nav-mobile-link-font-family,var(--font-family-body))] font-semibold text-[var(--nav-mobile-link-text,hsl(var(--foreground)))] ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors hover:bg-[var(--nav-mobile-link-background-hover,hsl(var(--contrast-100)))] hover:text-[var(--nav-mobile-link-text-hover,hsl(var(--foreground)))] focus-visible:outline-0 focus-visible:ring-2 @4xl:py-4"
                              href={item.href}
                            >
                              {item.label}
                            </Link>
                          </li>
                        )}
                        {item.groups
                          ?.flatMap((group) => group.links)
                          .map((link, j) => (
                            <li key={j}>
                              <Link
                                className="block rounded-lg bg-[var(--nav-mobile-sub-link-background,transparent)] px-3 py-2 font-[family-name:var(--nav-mobile-sub-link-font-family,var(--font-family-body))] text-sm font-medium text-[var(--nav-mobile-sub-link-text,hsl(var(--contrast-500)))] ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors hover:bg-[var(--nav-mobile-sub-link-background-hover,hsl(var(--contrast-100)))] hover:text-[var(--nav-mobile-sub-link-text-hover,hsl(var(--foreground)))] focus-visible:outline-0 focus-visible:ring-2 @4xl:py-4"
                                href={link.href}
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                      </ul>
                    ))
                  }
                </Stream>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* Logo */}
        <div
          className={clsx(
            'flex items-center justify-start self-stretch',
            linksPosition === 'center' ? 'flex-1' : 'flex-1 @4xl:flex-none',
          )}
        >
          <Logo
            className={clsx(streamableMobileLogo != null ? 'hidden @4xl:flex' : 'flex')}
            height={logoHeight}
            href={logoHref}
            label={logoLabel}
            logo={streamableLogo}
            width={logoWidth}
          />
          {streamableMobileLogo != null && (
            <Logo
              className="flex @4xl:hidden"
              height={mobileLogoHeight}
              href={logoHref}
              label={logoLabel}
              logo={streamableMobileLogo}
              width={mobileLogoWidth}
            />
          )}
        </div>

        {/* Top Level Nav Links */}
        <div className={clsx('hidden @4xl:flex @4xl:flex-1 @4xl:flex-col @4xl:gap-1')}>
          <SearchFormNew
            // @ts-ignore
            searchAction={searchAction}
            searchCtaLabel={searchCtaLabel}
            searchHref={searchHref}
            searchInputPlaceholder={searchInputPlaceholder}
            searchParamName={searchParamName}
          />
          {/* make this full with on the parent div and not in the same lien as the previous dev */}
          <ul
            className={clsx(
              'w-full @4xl:flex @4xl:flex-1',
              {
                left: '@4xl:justify-start',
                center: '@4xl:justify-center',
                right: '@4xl:justify-end',
              }[linksPosition],
            )}
          >
            {/**
             * Custom Icon That Developer Create
             */}
            <NavigationMenu.Item value={'All Products'.toString()}>
              <NavigationMenu.Trigger asChild>
                <Link
                  className="hidden items-center whitespace-nowrap rounded-xl bg-[var(--nav-link-background,transparent)] p-2.5 font-[family-name:var(--nav-link-font-family,var(--font-family-body))] text-sm font-medium text-[var(--nav-link-text,hsl(var(--foreground)))] ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors duration-200 hover:bg-[#011F4B] hover:text-white focus-visible:bg-[#011F4B] focus-visible:text-white focus-visible:outline-0 focus-visible:ring-2 @4xl:inline-flex"
                  href={'/shop'}
                >
                  All Products <ChevronDownIcon className="inline" strokeWidth={3} size={20} />
                </Link>
              </NavigationMenu.Trigger>

              <NavigationMenu.Content className="rounded-2xl bg-[var(--nav-menu-background,hsl(var(--background)))] shadow-xl ring-1 ring-[var(--nav-menu-border,hsl(var(--foreground)/5%))]">
                <div className="m-auto grid w-full max-w-screen-lg grid-cols-2 gap-2 px-5 pb-8 pt-5">
                  {categoryLinks.map((category, idx) =>
                    category.href ? (
                      <Link
                        key={idx}
                        href={category.href}
                        className="flex w-full items-center gap-4 rounded-lg p-3 transition-colors hover:bg-[var(--nav-group-background-hover,hsl(var(--contrast-100)))]"
                        style={{ textDecoration: 'none' }}
                      >
                        <img
                          // @ts-ignore
                          src={category.image ? category.image.url : DEFAULT_CATEGORY_IMAGE_URL}
                          alt={category.label}
                          className="h-10 w-10 rounded border border-[var(--nav-menu-border,hsl(var(--foreground)/10%))] bg-white object-cover"
                        />
                        <span className="w-full text-left text-base font-medium text-[var(--nav-group-text,hsl(var(--foreground)))]">
                          {category.label}
                        </span>
                      </Link>
                    ) : (
                      <div key={idx} className="flex w-full items-center gap-4 rounded-lg p-3">
                        <img
                          // @ts-ignore
                          src={category.image ? category.image.url : DEFAULT_CATEGORY_IMAGE_URL}
                          alt={category.label}
                          className="h-10 w-10 rounded border border-[var(--nav-menu-border,hsl(var(--foreground)/10%))] bg-white object-cover"
                        />
                        <span className="w-full text-left text-base font-medium text-[var(--nav-group-text,hsl(var(--foreground)))]">
                          {category.label}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </NavigationMenu.Content>
            </NavigationMenu.Item>

            {/*
              Dynamic Links Coming From MakeSwift
            */}
            <Stream
              fallback={
                <ul className="flex animate-pulse flex-row p-2 @4xl:gap-2 @4xl:p-5">
                  <li>
                    <span className="block h-4 w-10 rounded-md bg-contrast-100" />
                  </li>
                  <li>
                    <span className="block h-4 w-14 rounded-md bg-contrast-100" />
                  </li>
                  <li>
                    <span className="block h-4 w-24 rounded-md bg-contrast-100" />
                  </li>
                  <li>
                    <span className="block h-4 w-16 rounded-md bg-contrast-100" />
                  </li>
                </ul>
              }
              value={streamableLinks}
            >
              {(links) =>
                links.map((item, i) => {
                  return (
                    <NavigationMenu.Item key={i} value={i.toString()}>
                      <NavigationMenu.Trigger asChild>
                        <Link
                          className="hidden items-center whitespace-nowrap rounded-xl bg-[var(--nav-link-background,transparent)] p-2.5 font-[family-name:var(--nav-link-font-family,var(--font-family-body))] text-sm font-medium text-[var(--nav-link-text,hsl(var(--foreground)))] ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors duration-200 hover:bg-[#011F4B] hover:text-white focus-visible:bg-[#011F4B] focus-visible:text-white focus-visible:outline-0 focus-visible:ring-2 @4xl:inline-flex"
                          href={item.href}
                        >
                          {item.label}
                        </Link>
                      </NavigationMenu.Trigger>
                      {item.groups != null && item.groups.length > 0 && (
                        <NavigationMenu.Content className="rounded-2xl bg-[var(--nav-menu-background,hsl(var(--background)))] shadow-xl ring-1 ring-[var(--nav-menu-border,hsl(var(--foreground)/5%))]">
                          <div className="m-auto grid w-full max-w-screen-lg grid-cols-5 justify-center gap-5 px-5 pb-8 pt-5">
                            {item.groups.map((group, columnIndex) => (
                              <ul className="flex flex-col" key={columnIndex}>
                                {/* Second Level Links */}
                                {group.label != null && group.label !== '' && (
                                  <li>
                                    <Link className={navGroupClassName} href={group.href as string}>
                                      {group.label}
                                    </Link>
                                  </li>
                                )}

                                {group.links.map((link, idx) => (
                                  // Third Level Links
                                  <li key={idx}>
                                    <Link
                                      className="block rounded-lg bg-[var(--nav-sub-link-background,transparent)] px-3 py-1.5 font-[family-name:var(--nav-sub-link-font-family,var(--font-family-body))] text-sm font-medium text-[var(--nav-sub-link-text,hsl(var(--contrast-500)))] ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors hover:bg-[var(--nav-sub-link-background-hover,hsl(var(--contrast-100)))] hover:text-[var(--nav-sub-link-text-hover,hsl(var(--foreground)))] focus-visible:outline-0 focus-visible:ring-2"
                                      href={link.href}
                                    >
                                      {link.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            ))}
                          </div>
                        </NavigationMenu.Content>
                      )}
                    </NavigationMenu.Item>
                  );
                })
              }
            </Stream>
          </ul>
        </div>

        {/* Icon Buttons */}
        <div
          className={clsx(
            'flex flex-col items-end justify-end gap-1 transition-colors duration-300',
            centerRightBlock ? 'flex-1' : 'flex-1 @4xl:flex-none',
          )}
        >
          <div className="flex items-center gap-2">
            {/* Sign In Button */}
            <Link aria-label={accountLabel} className={navCustomButtonClassName} href={accountHref}>
              <span>
                <User size={20} strokeWidth={1} className="inline" />
                Sign In
              </span>
            </Link>

            <span className="text-[#D2D2D2]">|</span>

            {/* Cart Icon */}
            <Link aria-label={cartLabel} className={navButtonClassName} href={cartHref}>
              <ShoppingBasket size={20} strokeWidth={1} />
              <Stream
                fallback={
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 animate-pulse items-center justify-center rounded-full bg-contrast-100 text-xs text-background" />
                }
                value={streamableCartCount}
              >
                {(cartCount) =>
                  cartCount != null &&
                  cartCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--nav-cart-count-background,hsl(var(--foreground)))] font-[family-name:var(--nav-cart-count-font-family,var(--font-family-body))] text-xs text-[var(--nav-cart-count-text,hsl(var(--background)))]">
                      {cartCount}
                    </span>
                  )
                }
              </Stream>
            </Link>
            {/* Locale / Language Dropdown */}
            {locales && locales.length > 1 ? (
              <LocaleSwitcher
                activeLocaleId={activeLocaleId}
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                locales={locales as [Locale, Locale, ...Locale[]]}
              />
            ) : null}
            {/* Currency Dropdown */}
            {currencies && currencies.length > 1 && currencyAction ? (
              <CurrencyForm
                action={currencyAction}
                activeCurrencyId={activeCurrencyId}
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                currencies={currencies as [Currency, ...Currency[]]}
              />
            ) : null}
          </div>
          <Link
            href={`tel:${phoneNumber}`}
            className="mt-1 flex items-center whitespace-nowrap text-lg font-bold text-[#011F4B] hover:underline"
            style={{ lineHeight: 1 }}
            aria-label={`Call ${phoneNumber}`}
          >
            <PhoneCall color="#011F4B" strokeWidth={2} className="mr-2 inline" size={24} />
            {phoneNumber}
          </Link>
        </div>
      </div>

      <div className="perspective-[2000px] absolute left-0 right-0 top-full z-50 flex w-full justify-center">
        <NavigationMenu.Viewport className="relative mt-2 w-full data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95" />
      </div>
    </NavigationMenu.Root>
  );
});

Navigation.displayName = 'Navigation';

/**
 * Old Look Icon for Search Form
 */
function SearchForm<S extends SearchResult>({
  searchAction,
  searchParamName = 'query',
  searchHref = '/search',
  searchInputPlaceholder = 'Search Products',
  searchCtaLabel = 'View more',
  submitLabel = 'Submit',
}: {
  searchAction: SearchAction<S>;
  searchParamName?: string;
  searchHref?: string;
  searchCtaLabel?: string;
  searchInputPlaceholder?: string;
  submitLabel?: string;
}) {
  const [query, setQuery] = useState('');
  const [isSearching, startSearching] = useTransition();
  const [{ searchResults, lastResult, emptyStateTitle, emptyStateSubtitle }, formAction] =
    useActionState(searchAction, {
      searchResults: null,
      lastResult: null,
    });
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isPending = isSearching || isDebouncing || isSubmitting;
  const debouncedOnChange = useMemo(() => {
    const debounced = debounce((q: string) => {
      setIsDebouncing(false);

      const formData = new FormData();

      formData.append(searchParamName, q);

      startSearching(() => {
        formAction(formData);
      });
    }, 300);

    return (q: string) => {
      setIsDebouncing(true);

      debounced(q);
    };
  }, [formAction, searchParamName]);

  const [form] = useForm({ lastResult });

  const handleSubmit = useCallback(() => {
    setIsSubmitting(true);
  }, []);

  return (
    <>
      <form
        action={searchHref}
        className="flex items-center gap-3 px-3 py-3 @4xl:px-5 @4xl:py-4"
        onSubmit={handleSubmit}
      >
        <SearchIcon
          className="hidden shrink-0 text-[var(--nav-search-icon,hsl(var(--contrast-500)))] @xl:block"
          size={20}
          strokeWidth={1}
        />
        <input
          className="flex-grow bg-transparent pl-2 text-lg font-medium outline-0 focus-visible:outline-none @xl:pl-0"
          name={searchParamName}
          onChange={(e) => {
            setQuery(e.currentTarget.value);
            debouncedOnChange(e.currentTarget.value);
          }}
          placeholder={searchInputPlaceholder}
          type="text"
          value={query}
        />
        <SubmitButton loading={isPending} submitLabel={submitLabel} />
      </form>

      <SearchResults
        emptySearchSubtitle={emptyStateSubtitle}
        emptySearchTitle={emptyStateTitle}
        errors={form.errors}
        query={query}
        searchCtaLabel={searchCtaLabel}
        searchParamName={searchParamName}
        searchResults={searchResults}
        stale={isPending}
      />
    </>
  );
}

/**
 * New Input Search
 */
function SearchFormNew<S extends SearchResult>({
  searchAction,
  searchParamName = 'query',
  searchHref = '/search',
  searchInputPlaceholder = 'Search Products',
  searchCtaLabel = 'View more',
  submitLabel = 'Submit',
}: {
  searchAction: SearchAction<S>;
  searchParamName?: string;
  searchHref?: string;
  searchCtaLabel?: string;
  searchInputPlaceholder?: string;
  submitLabel?: string;
}) {
  const [query, setQuery] = useState('');
  const [isSearching, startSearching] = useTransition();
  const [{ searchResults, lastResult, emptyStateTitle, emptyStateSubtitle }, formAction] =
    useActionState(searchAction, {
      searchResults: null,
      lastResult: null,
    });
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isPending = isSearching || isDebouncing || isSubmitting;
  const debouncedOnChange = useMemo(() => {
    const debounced = debounce((q: string) => {
      setIsDebouncing(false);

      const formData = new FormData();

      formData.append(searchParamName, q);

      startSearching(() => {
        formAction(formData);
      });
    }, 300);

    return (q: string) => {
      setIsDebouncing(true);

      debounced(q);
    };
  }, [formAction, searchParamName]);

  const [form] = useForm({ lastResult });

  const handleSubmit = useCallback(() => {
    setIsSubmitting(true);
  }, []);

  return (
    <>
      <form
        action={searchHref}
        className="border-1 flex items-center gap-3 rounded-md border px-3 py-3 @4xl:px-3 @4xl:py-3"
        onSubmit={handleSubmit}
      >
        <SearchIcon
          className="hidden shrink-0 text-[var(--nav-search-icon,hsl(var(--contrast-500)))] @xl:block"
          size={20}
          strokeWidth={1}
        />
        <input
          className="flex-grow bg-transparent pl-2 text-lg font-medium outline-0 focus-visible:outline-none @xl:pl-0"
          name={searchParamName}
          onChange={(e) => {
            setQuery(e.currentTarget.value);
            debouncedOnChange(e.currentTarget.value);
          }}
          placeholder={searchInputPlaceholder}
          type="text"
          value={query}
        />
      </form>

      <SearchResults
        emptySearchSubtitle={emptyStateSubtitle}
        emptySearchTitle={emptyStateTitle}
        errors={form.errors}
        query={query}
        searchCtaLabel={searchCtaLabel}
        searchParamName={searchParamName}
        searchResults={searchResults}
        stale={isPending}
      />
    </>
  );
}

function SubmitButton({ loading, submitLabel }: { loading: boolean; submitLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <Button
      loading={pending || loading}
      shape="circle"
      size="small"
      type="submit"
      variant="secondary"
    >
      <ArrowRight aria-label={submitLabel} size={20} strokeWidth={1.5} />
    </Button>
  );
}

function SearchResults({
  query,
  searchResults,
  stale,
  emptySearchTitle = `No results were found for '${query}'`,
  emptySearchSubtitle = 'Please try another search.',
  errors,
}: {
  query: string;
  searchParamName: string;
  searchCtaLabel?: string;
  emptySearchTitle?: string;
  emptySearchSubtitle?: string;
  searchResults: SearchResult[] | null;
  stale: boolean;
  errors?: string[];
}) {
  if (query === '') return null;

  if (errors != null && errors.length > 0) {
    if (stale) return null;

    return (
      <div className="flex flex-col border-t border-[var(--nav-search-divider,hsl(var(--contrast-100)))] p-6">
        {errors.map((error) => (
          <FormStatus key={error} type="error">
            {error}
          </FormStatus>
        ))}
      </div>
    );
  }

  if (searchResults == null || searchResults.length === 0) {
    if (stale) return null;

    return (
      <div className="flex flex-col border-t border-[var(--nav-search-divider,hsl(var(--contrast-100)))] p-6">
        <p className="text-2xl font-medium text-[var(--nav-search-empty-title,hsl(var(--foreground)))]">
          {emptySearchTitle}
        </p>
        <p className="text-[var(--nav-search-empty-subtitle,hsl(var(--contrast-500)))]">
          {emptySearchSubtitle}
        </p>
      </div>
    );
  }

  return (
    <div className="perspective-[2000px] absolute left-0 right-0 top-full z-50 flex w-full justify-center">
      <div
        className={clsx(
          'flex flex-1 flex-col overflow-y-auto border-t border-[var(--nav-search-divider,hsl(var(--contrast-100)))] bg-white @2xl:flex-row',
          stale && 'opacity-50',
        )}
      >
        {searchResults.map((result, index) => {
          switch (result.type) {
            case 'links': {
              return (
                <section
                  aria-label={result.title}
                  className="flex w-full flex-col gap-1 border-b border-[var(--nav-search-divider,hsl(var(--contrast-100)))] p-5 @2xl:max-w-80 @2xl:border-b-0 @2xl:border-r"
                  key={`result-${index}`}
                >
                  <h3 className="mb-4 font-[family-name:var(--nav-search-result-title-font-family,var(--font-family-mono))] text-sm uppercase text-[var(--nav-search-result-title,hsl(var(--foreground)))]">
                    {result.title}
                  </h3>
                  <ul role="listbox">
                    {result.links.map((link, i) => (
                      <li key={i}>
                        <Link
                          className="block rounded-lg bg-[var(--nav-search-result-link-background,transparent)] px-3 py-4 font-[family-name:var(--nav-search-result-link-font-family,var(--font-family-body))] font-semibold text-[var(--nav-search-result-link-text,hsl(var(--contrast-500)))] ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors hover:bg-[var(--nav-search-result-link-background-hover,hsl(var(--contrast-100)))] hover:text-[var(--nav-search-result-link-text-hover,hsl(var(--foreground)))] focus-visible:outline-0 focus-visible:ring-2"
                          href={link.href}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            }

            case 'products': {
              return (
                <section
                  aria-label={result.title}
                  className="flex w-full flex-col gap-5 p-5"
                  key={`result-${index}`}
                >
                  <h3 className="font-[family-name:var(--nav-search-result-title-font-family,var(--font-family-mono))] text-sm uppercase text-[var(--nav-search-result-title,hsl(var(--foreground)))]">
                    {result.title}
                  </h3>
                  <ul
                    className="grid w-full grid-cols-2 gap-5 @xl:grid-cols-4 @2xl:grid-cols-2 @4xl:grid-cols-4"
                    role="listbox"
                  >
                    {result.products.map((product) => (
                      <li key={product.id}>
                        <ProductCard
                          imageSizes="(min-width: 42rem) 25vw, 50vw"
                          product={{
                            id: product.id,
                            title: product.title,
                            href: product.href,
                            price: product.price,
                            image: product.image,
                            categories: [],
                            description: '',
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            }

            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}

const useSwitchLocale = () => {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();

  return useCallback(
    (locale: string) =>
      router.push(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        { pathname, params },
        { locale },
      ),
    [pathname, params, router],
  );
};

function LocaleSwitcher({
  locales,
  activeLocaleId,
}: {
  activeLocaleId?: string;
  locales: [Locale, ...Locale[]];
}) {
  const activeLocale = locales.find((locale) => locale.id === activeLocaleId);
  const [isPending, startTransition] = useTransition();
  const switchLocale = useSwitchLocale();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={clsx(
          'flex items-center gap-1 text-xs uppercase transition-opacity [&:disabled]:opacity-30',
          navButtonClassName,
        )}
        disabled={isPending}
      >
        {activeLocale?.id ?? locales[0].id}
        <ChevronDown size={16} strokeWidth={1.5} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="z-50 max-h-80 overflow-y-scroll rounded-xl bg-[var(--nav-locale-background,hsl(var(--background)))] p-2 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 @4xl:w-32 @4xl:rounded-2xl @4xl:p-2"
          sideOffset={16}
        >
          {locales.map(({ id, label }) => (
            <DropdownMenu.Item
              className={clsx(
                'cursor-default rounded-lg bg-[var(--nav-locale-link-background,transparent)] px-2.5 py-2 font-[family-name:var(--nav-locale-link-font-family,var(--font-family-body))] text-sm font-medium text-[var(--nav-locale-link-text,hsl(var(--contrast-400)))] outline-none ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors hover:bg-[var(--nav-locale-link-background-hover,hsl(var(--contrast-100)))] hover:text-[var(--nav-locale-link-text-hover,hsl(var(--foreground)))]',
                {
                  'text-[var(--nav-locale-link-text-selected,hsl(var(--foreground)))]':
                    id === activeLocaleId,
                },
              )}
              key={id}
              onSelect={() => startTransition(() => switchLocale(id))}
            >
              {label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function CurrencyForm({
  action,
  currencies,
  activeCurrencyId,
}: {
  activeCurrencyId?: string;
  action: CurrencyAction;
  currencies: [Currency, ...Currency[]];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastResult, formAction] = useActionState(action, null);
  const activeCurrency = currencies.find((currency) => currency.id === activeCurrencyId);

  useEffect(() => {
    // eslint-disable-next-line no-console
    if (lastResult?.error) console.log(lastResult.error);
  }, [lastResult?.error]);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={clsx(
          'flex items-center gap-1 text-xs uppercase transition-opacity [&:disabled]:opacity-30',
          navButtonClassName,
        )}
        disabled={isPending}
      >
        {activeCurrency?.label ?? currencies[0].label}
        <ChevronDown size={16} strokeWidth={1.5} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="z-50 max-h-80 overflow-y-scroll rounded-xl bg-[var(--nav-locale-background,hsl(var(--background)))] p-2 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 @4xl:w-32 @4xl:rounded-2xl @4xl:p-2"
          sideOffset={16}
        >
          {currencies.map((currency) => (
            <DropdownMenu.Item
              className={clsx(
                'cursor-default rounded-lg bg-[var(--nav-locale-link-background,transparent)] px-2.5 py-2 font-[family-name:var(--nav-locale-link-font-family,var(--font-family-body))] text-sm font-medium text-[var(--nav-locale-link-text,hsl(var(--contrast-400)))] outline-none ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors hover:bg-[var(--nav-locale-link-background-hover,hsl(var(--contrast-100)))] hover:text-[var(--nav-locale-link-text-hover,hsl(var(--foreground)))]',
                {
                  'text-[var(--nav-locale-link-text-selected,hsl(var(--foreground)))]':
                    currency.id === activeCurrencyId,
                },
              )}
              key={currency.id}
              onSelect={() => {
                // eslint-disable-next-line @typescript-eslint/require-await
                startTransition(async () => {
                  const formData = new FormData();

                  formData.append('id', currency.id);
                  formAction(formData);

                  // This is needed to refresh the Data Cache after the product has been added to the cart.
                  // The cart id is not picked up after the first time the cart is created/updated.
                  router.refresh();
                });
              }}
            >
              {currency.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
