'use client';

import { SubmissionResult, useForm } from '@conform-to/react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Popover from '@radix-ui/react-popover';
import { clsx } from 'clsx';
import debounce from 'lodash.debounce';
import { ArrowRight, ChevronDown, Search, SearchIcon, ShoppingBag, User } from 'lucide-react';
import React, {
  forwardRef,
  Ref,
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useFormStatus } from 'react-dom';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Button } from '@/vibes/soul/primitives/button';
import { Image } from '~/components/image';
import { Link } from '~/components/link';
import { usePathname } from '~/i18n/routing';

import { FormStatus } from '../../form/form-status';
import { Price } from '../price-label';
import { ProductCard } from '../product-card';

interface Link {
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

interface Locale {
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

type LocaleAction = Action<SubmissionResult | null, FormData>;
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
  locales?: Locale[];
  activeLocaleId?: string;
  localeAction?: LocaleAction;
  logo?: Streamable<string | { src: string; alt: string } | null>;
  logoHref?: string;
  logoLabel?: string;
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

const HamburgerMenuButton = forwardRef<
  React.ComponentRef<'button'>,
  { open: boolean } & React.ComponentPropsWithoutRef<'button'>
>(({ open, className, ...rest }, ref) => {
  return (
    <button
      {...rest}
      className={clsx(
        'group relative rounded-lg p-2 outline-0 ring-primary transition-colors focus-visible:ring-2',
        className,
      )}
      ref={ref}
    >
      <div className="flex h-4 w-4 origin-center transform flex-col justify-between overflow-hidden transition-all duration-300">
        <div
          className={clsx(
            'h-px origin-left transform bg-foreground transition-all duration-300',
            open ? 'translate-x-10' : 'w-7',
          )}
        />
        <div
          className={clsx(
            'h-px transform rounded bg-foreground transition-all delay-75 duration-300',
            open ? 'translate-x-10' : 'w-7',
          )}
        />
        <div
          className={clsx(
            'h-px origin-left transform bg-foreground transition-all delay-150 duration-300',
            open ? 'translate-x-10' : 'w-7',
          )}
        />

        <div
          className={clsx(
            'absolute top-2 flex transform items-center justify-between bg-foreground transition-all duration-500',
            open ? 'w-12 translate-x-0' : 'w-0 -translate-x-10',
          )}
        >
          <div
            className={clsx(
              'absolute h-px w-4 transform bg-foreground transition-all delay-300 duration-500',
              open ? 'rotate-45' : 'rotate-0',
            )}
          />
          <div
            className={clsx(
              'absolute h-px w-4 transform bg-foreground transition-all delay-300 duration-500',
              open ? '-rotate-45' : 'rotate-0',
            )}
          />
        </div>
      </div>
    </button>
  );
});

HamburgerMenuButton.displayName = 'HamburgerMenuButton';

export const Navigation = forwardRef(function Navigation<S extends SearchResult>(
  {
    className,
    isFloating = false,
    cartHref,
    cartCount: streamableCartCount,
    accountHref,
    links: streamableLinks,
    logo: streamableLogo,
    logoHref = '/',
    logoLabel = 'Home',
    activeLocaleId,
    localeAction,
    locales,
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

  const pathname = usePathname();
  const container = useRef<HTMLUListElement>(null);

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
      className={clsx(
        'relative mx-auto w-full max-w-screen-2xl text-foreground @container',
        className,
      )}
      delayDuration={0}
      onValueChange={() => setIsSearchOpen(false)}
      ref={ref}
    >
      <div
        className={clsx(
          'flex h-14 items-center justify-between bg-background pl-3 pr-2 transition-shadow @4xl:rounded-2xl @4xl:px-2 @4xl:pl-6 @4xl:pr-2.5',
          isFloating ? 'shadow-xl ring-1 ring-foreground/10' : 'shadow-none ring-0',
        )}
      >
        {/* Logo */}
        <Popover.Root onOpenChange={setIsMobileMenuOpen} open={isMobileMenuOpen}>
          <Popover.Anchor className="absolute left-0 right-0 top-full" />
          <Popover.Trigger asChild>
            <HamburgerMenuButton
              aria-label={mobileMenuTriggerLabel}
              className="mr-3 @4xl:hidden"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              open={isMobileMenuOpen}
            />
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content className="max-h-[calc(var(--radix-popover-content-available-height)-8px)] w-[var(--radix-popper-anchor-width)] @container data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
              <div className="max-h-[inherit] divide-y divide-contrast-100 overflow-y-auto bg-background">
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
                            {item.href !== '' ? (
                              <Link
                                className="block rounded-lg px-3 py-2 font-semibold ring-primary transition-colors hover:bg-contrast-100 focus-visible:outline-0 focus-visible:ring-2 @4xl:py-4"
                                href={item.href}
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
                                className="block rounded-lg px-3 py-2 text-sm font-medium text-contrast-500 ring-primary transition-colors hover:bg-contrast-100 hover:text-foreground focus-visible:outline-0 focus-visible:ring-2 @4xl:py-4"
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
        <div className="flex flex-1 items-center self-stretch py-2">
          <Link
            aria-label={logoLabel}
            className="relative flex size-full max-w-[80%] items-center outline-0 ring-primary ring-offset-4 focus-visible:ring-2 @4xl:max-w-[50%]"
            href={logoHref}
          >
            <Stream
              fallback={<div className="h-6 w-16 animate-pulse rounded-md bg-contrast-100" />}
              value={streamableLogo}
            >
              {(logo) =>
                typeof logo === 'object' && logo !== null && logo.src !== '' ? (
                  <Image
                    alt={logo.alt}
                    className="object-contain object-left"
                    fill
                    sizes="25vw"
                    src={logo.src}
                  />
                ) : (
                  typeof logo === 'string' && (
                    <span className="font-heading text-lg font-semibold leading-none text-foreground @xl:text-2xl">
                      {logo}
                    </span>
                  )
                )
              }
            </Stream>
          </Link>
        </div>

        {/* Top Level Nav Links */}
        <ul className="hidden @4xl:flex" ref={container}>
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
              links.map((item, i) => (
                <NavigationMenu.Item key={i} value={i.toString()}>
                  <NavigationMenu.Trigger asChild>
                    <Link
                      className="mx-0.5 my-2.5 hidden items-center whitespace-nowrap rounded-xl p-2.5 text-sm font-medium ring-primary transition-colors duration-200 hover:bg-contrast-100 focus-visible:outline-0 focus-visible:ring-2 @4xl:inline-flex"
                      href={item.href}
                    >
                      {item.label}
                    </Link>
                  </NavigationMenu.Trigger>
                  {item.groups != null && item.groups.length > 0 && (
                    <NavigationMenu.Content className="max-h-96 overflow-y-auto rounded-2xl bg-background shadow-xl shadow-foreground/5 ring-1 ring-foreground/5">
                      <div className="grid w-full grid-cols-4 divide-x divide-contrast-100">
                        {item.groups.map((group, columnIndex) => (
                          <ul className="flex flex-col gap-1 p-5" key={columnIndex}>
                            {/* Second Level Links */}
                            {group.label != null && group.label !== '' && (
                              <li>
                                {group.href != null && group.href !== '' ? (
                                  <Link
                                    className="block rounded-lg px-3 py-2 font-medium ring-primary transition-colors hover:bg-contrast-100 focus-visible:outline-0 focus-visible:ring-2"
                                    href={group.href}
                                  >
                                    {group.label}
                                  </Link>
                                ) : (
                                  <span className="block rounded-lg px-3 py-2 font-medium ring-primary transition-colors hover:bg-contrast-100 focus-visible:outline-0 focus-visible:ring-2">
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
              ))
            }
          </Stream>
        </ul>

        <div className="flex flex-1 items-center justify-end transition-colors duration-300">
          {searchAction ? (
            <Popover.Root onOpenChange={setIsSearchOpen} open={isSearchOpen}>
              <Popover.Anchor className="absolute left-0 right-0 top-full" />
              <Popover.Trigger asChild>
                <button
                  aria-label={openSearchPopupLabel}
                  className="rounded-lg p-1.5 ring-primary transition-colors focus-visible:outline-0 focus-visible:ring-2 @4xl:hover:bg-contrast-100"
                  onPointerEnter={(e) => e.preventDefault()}
                  onPointerLeave={(e) => e.preventDefault()}
                  onPointerMove={(e) => e.preventDefault()}
                >
                  <Search size={20} strokeWidth={1} />
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content className="max-h-[calc(var(--radix-popover-content-available-height)-16px)] w-[var(--radix-popper-anchor-width)] py-2 @container data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
                  <div className="flex max-h-[inherit] flex-col rounded-2xl bg-background shadow-xl shadow-foreground/5 ring-1 ring-foreground/5 transition-all duration-200 ease-in-out @4xl:inset-x-0">
                    <SearchForm
                      searchAction={searchAction}
                      searchCtaLabel={searchCtaLabel}
                      searchHref={searchHref}
                      searchInputPlaceholder={searchInputPlaceholder}
                      searchParamName={searchParamName}
                    />
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          ) : (
            <Link
              aria-label={searchLabel}
              className="rounded-lg p-1.5 ring-primary transition-colors focus-visible:outline-0 focus-visible:ring-2 @4xl:hover:bg-contrast-100"
              href={searchHref}
            >
              <Search size={20} strokeWidth={1} />
            </Link>
          )}

          <Link
            aria-label={accountLabel}
            className="rounded-lg p-1.5 ring-primary focus-visible:outline-0 focus-visible:ring-2 @4xl:hover:bg-contrast-100"
            href={accountHref}
          >
            <User size={20} strokeWidth={1} />
          </Link>
          <Link
            aria-label={cartLabel}
            className="relative rounded-lg p-1.5 ring-primary focus-visible:outline-0 focus-visible:ring-2 @4xl:hover:bg-contrast-100"
            href={cartHref}
          >
            <ShoppingBag size={20} strokeWidth={1} />
            <Stream
              fallback={
                <span className="absolute -right-1 -top-1 flex h-4 w-4 animate-pulse items-center justify-center rounded-full bg-contrast-100 text-xs text-background" />
              }
              value={streamableCartCount}
            >
              {(cartCount) =>
                cartCount != null &&
                cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-xs text-background">
                    {cartCount}
                  </span>
                )
              }
            </Stream>
          </Link>

          {/* Locale / Language Dropdown */}
          {locales && locales.length > 1 && localeAction ? (
            <LocaleForm
              action={localeAction}
              activeLocaleId={activeLocaleId}
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              locales={locales as [Locale, Locale, ...Locale[]]}
            />
          ) : null}
        </div>
      </div>

      <div className="perspective-[2000px] absolute left-0 right-0 top-full z-50 flex w-full justify-center">
        <NavigationMenu.Viewport className="relative mt-2 w-full data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95" />
      </div>
    </NavigationMenu.Root>
  );
});

Navigation.displayName = 'Navigation';

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
          className="hidden shrink-0 text-contrast-500 @xl:block"
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
      <div className="flex flex-col border-t border-contrast-100 p-6">
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
      <div className="flex flex-col border-t border-contrast-100 p-6">
        <p className="text-2xl font-medium text-foreground">{emptySearchTitle}</p>
        <p className="text-contrast-500">{emptySearchSubtitle}</p>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'flex flex-1 flex-col overflow-y-auto border-t border-contrast-100 @2xl:flex-row',
        stale && 'opacity-50',
      )}
    >
      {searchResults.map((result, index) => {
        switch (result.type) {
          case 'links': {
            return (
              <section
                aria-label={result.title}
                className="flex w-full flex-col gap-1 border-b border-contrast-100 p-5 @2xl:max-w-80 @2xl:border-b-0 @2xl:border-r"
                key={`result-${index}`}
              >
                <h3 className="mb-4 font-mono text-sm uppercase">{result.title}</h3>
                <ul role="listbox">
                  {result.links.map((link, i) => (
                    <li key={i}>
                      <Link
                        className="block rounded-lg px-3 py-4 font-semibold text-contrast-500 ring-primary transition-colors hover:bg-contrast-100 hover:text-foreground focus-visible:outline-0 focus-visible:ring-2"
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
                <h3 className="font-mono text-sm uppercase">{result.title}</h3>
                <ul
                  className="grid w-fit grid-cols-2 gap-5 @xl:grid-cols-4 @2xl:grid-cols-2 @4xl:grid-cols-4"
                  role="listbox"
                >
                  {result.products.map((product) => (
                    <li key={product.id}>
                      <ProductCard
                        key={product.id}
                        product={{
                          id: product.id,
                          title: product.title,
                          href: product.href,
                          price: product.price,
                          image: product.image,
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
  );
}

function LocaleForm({
  action,
  locales,
  activeLocaleId,
}: {
  activeLocaleId?: string;
  action: LocaleAction;
  locales: [Locale, ...Locale[]];
}) {
  const [lastResult, formAction] = useActionState(action, null);
  const activeLocale = locales.find((locale) => locale.id === activeLocaleId);

  useEffect(() => {
    if (lastResult?.error) console.log(lastResult.error);
  }, [lastResult?.error]);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={clsx(
          'items-center gap-1 rounded-lg p-2 text-xs hover:bg-contrast-100',
          'flex uppercase focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        )}
      >
        {activeLocale?.id ?? locales[0].id}
        <ChevronDown size={16} strokeWidth={1.5} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="z-50 max-h-80 overflow-y-scroll rounded-xl bg-background p-2 shadow-xl shadow-foreground/10 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 @4xl:w-32 @4xl:rounded-2xl @4xl:p-2"
          sideOffset={16}
        >
          {locales.map(({ id, label }) => (
            <DropdownMenu.Item
              className={clsx(
                'cursor-default rounded-lg px-2.5 py-2 text-sm font-medium text-contrast-400 outline-none transition-colors',
                'hover:text-foreground focus:bg-contrast-100',
                { 'text-foreground': id === activeLocaleId },
              )}
              key={id}
              onSelect={() => {
                // eslint-disable-next-line @typescript-eslint/require-await
                startTransition(async () => {
                  const formData = new FormData();

                  formData.append('id', id);
                  formAction(formData);
                });
              }}
            >
              {label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
