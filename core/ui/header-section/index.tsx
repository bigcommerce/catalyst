import { type SubmissionResult } from '@conform-to/react';
import { type ReactNode } from 'react';

import { type Streamable } from '@/vibes/soul/lib/streamable';
import { type Banner } from '@/vibes/soul/primitives/banner';
import { type Navigation } from '@/vibes/soul/primitives/navigation';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

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

interface Currency {
  id: string;
  label: string;
}

type CurrencyAction = Action<SubmissionResult | null, FormData>;

interface PriceRange {
  type: 'range';
  minValue: string;
  maxValue: string;
}

interface PriceSale {
  type: 'sale';
  previousValue: string;
  currentValue: string;
}

type Price = string | PriceRange | PriceSale;

type SearchResult =
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

type SearchAction<S extends SearchResult> = Action<
  {
    searchResults: S[] | null;
    lastResult: SubmissionResult | null;
    emptyStateTitle?: string;
    emptyStateSubtitle?: string;
  },
  FormData
>;

interface Navigation<S extends SearchResult> {
  // @todo is this configurable, or can theme developers make this static?
  accountHref: string;
  cartCount: Streamable<number | null>;
  // @todo is this configurable, or can theme developers make this static?
  cartHref: string;
  links: Streamable<Link[]>;
  // @todo should themes support locales?
  locales?: Locale[];
  activeLocaleId?: string;
  currencies?: Currency[];
  activeCurrencyId?: string;
  currencyAction?: CurrencyAction;
  logo?: Streamable<string | { src: string; alt: string } | null>;
  // @todo is this configurable, or can theme developers make this static?
  logoHref?: string;
  mobileLogo?: Streamable<string | { src: string; alt: string } | null>;
  // @todo is this configurable, or can theme developers make this static?
  searchHref: string;
  searchAction?: SearchAction<S>;
}

// @todo does this need to be part of the interface?
interface Banner {
  id: string;
  children: ReactNode;
  hideDismiss?: boolean;
  className?: string;
  onDismiss?: () => void;
}

export interface Header<S extends SearchResult> {
  navigation: Navigation<S>;
  banner?: Banner;
}

export { HeaderSection } from '@/vibes/soul/sections/header-section';
