import { Suspense } from 'react';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { AnimatedLink } from '@/vibes/soul/primitives/animated-link';
import {
  CarouselProduct,
  ProductsCarousel,
  ProductsCarouselSkeleton,
} from '@/vibes/soul/primitives/products-carousel';

type Link = {
  label: string;
  href: string;
};

type Props = {
  title?: string;
  description?: string;
  cta?: Link;
  products: Streamable<CarouselProduct[]>;
};

export function FeaturedProductsCarousel({ title, description, cta, products }: Props) {
  return (
    <section className="overflow-hidden @container">
      <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20">
        <div className="mb-6 flex w-full flex-row flex-wrap items-end justify-between gap-x-8 gap-y-6 text-foreground @4xl:mb-8">
          <div>
            <h2 className="font-heading text-2xl leading-none @xl:text-3xl @4xl:text-4xl">
              {title}
            </h2>
            {description != null && description !== '' && (
              <p className="mt-3 max-w-xl leading-relaxed text-contrast-500">{description}</p>
            )}
          </div>

          {cta != null && cta.href !== '' && cta.label !== '' && (
            <AnimatedLink label={cta.label} link={{ href: cta.href }} className="mr-3" />
          )}
        </div>
        <Suspense fallback={<ProductsCarouselSkeleton />}>
          <ProductsCarousel products={products} />
        </Suspense>
      </div>
    </section>
  );
}
