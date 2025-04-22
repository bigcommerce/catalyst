import { type SubmissionResult } from '@conform-to/react';
import { type ReactNode } from 'react';

import { type Streamable } from '@/vibes/soul/lib/streamable';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

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

interface Product {
  id: string;
  title: string;
  href: string;
  image?: { src: string; alt: string };
  price?: Price;
  subtitle?: string;
  badge?: string;
  rating?: number;
}

export interface CompareCardWithId extends Product {
  description?: string | React.ReactNode;
  customFields?: Array<{ name: string; value: string }>;
  hasVariants?: boolean;
  disabled?: boolean;
  isPreorder?: boolean;
}

interface CompareAddToCartState {
  lastResult: SubmissionResult | null;
  successMessage?: ReactNode;
}

export type CompareAddToCartAction = Action<CompareAddToCartState, FormData>;

export interface CompareSectionData {
  products: Streamable<CompareCardWithId[]>;
  addToCartAction: CompareAddToCartAction;
}

export { CompareSection } from '@/vibes/soul/sections/compare-section';
