import { type Streamable } from '@/vibes/soul/lib/streamable';

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

// @todo common-interface.ts?
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

interface Link {
  label: string;
  href: string;
}

export interface FeaturedProductListData {
  products: Streamable<Product[]>;
  title: string;
  description?: string;
  cta?: Link;
  emptyStateTitle?: Streamable<string>;
  emptyStateSubtitle?: Streamable<string>;
}

export { FeaturedProductList } from '@/vibes/soul/sections/featured-product-list';
