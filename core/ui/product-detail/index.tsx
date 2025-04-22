import { type SubmissionResult } from '@conform-to/react';
import { type ReactNode } from 'react';

import { type Streamable } from '@/vibes/soul/lib/streamable';
import { type Field } from '~/ui/dynamic-form-section';

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

// @todo common-interfaces.ts?
type Price = string | PriceRange | PriceSale;

interface ProductDetailProduct {
  id: string;
  title: string;
  href: string;
  images: Streamable<Array<{ src: string; alt: string }>>;
  price?: Streamable<Price | null>;
  subtitle?: string;
  badge?: string;
  rating?: Streamable<number | null>;
  summary?: Streamable<string>;
  description?: Streamable<string | ReactNode | null>;
  accordions?: Streamable<
    Array<{
      title: string;
      content: ReactNode;
    }>
  >;
}

type Action<S, P> = (state: Awaited<S>, payload: P) => S | Promise<S>;

// @todo same problem as order-details-section
// @todo just export all the interfaces?
// @todo how deep do we break down?
// @todo type fields = F[]?
// this duplicates what is in ./product-detail-form.tsx
interface State<F extends Field> {
  fields: F[];
  lastResult: SubmissionResult | null;
  successMessage?: ReactNode;
}

export type ProductDetailFormAction<F extends Field> = Action<State<F>, FormData>;

export interface ProductDetailData<F extends Field> {
  product: Streamable<ProductDetailProduct | null>;
  action: ProductDetailFormAction<F>;
  fields: Streamable<F[]>;
}

export { ProductDetail } from '@/vibes/soul/sections/product-detail';
