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

export type CarouselProduct = Product;

export interface FeaturedProductCarouselData {
  products: Streamable<CarouselProduct[]>;
}

export { FeaturedProductCarousel } from '@/vibes/soul/sections/featured-product-carousel';
