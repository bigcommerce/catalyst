import { Streamable } from '@/vibes/soul/lib/streamable';

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

interface Link {
  label: string;
  href: string;
}

export interface FeaturedProductListProps {
  title: string;
  description?: string;
  cta?: Link;
  products: Streamable<Product[]>;
  emptyStateSubtitle: Streamable<string>;
  emptyStateTitle: Streamable<string>;
}

export { FeaturedProductList } from '~/ui/my-theme-components/featured-product-list';
