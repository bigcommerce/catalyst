import { Streamable } from '@/vibes/soul/lib/streamable';
import { AnimatedLink } from '@/vibes/soul/primitives/animated-link';
import { CarouselProduct, ProductsCarousel } from '@/vibes/soul/primitives/products-carousel';
import { SectionLayout } from '@/vibes/soul/sections/section-layout';

interface Link {
  label: string;
  href: string;
}

interface Props {
  title?: string;
  description?: string;
  cta?: Link;
  products: Streamable<CarouselProduct[]>;
  emptyStateTitle?: Streamable<string | null>;
  emptyStateSubtitle?: Streamable<string | null>;
  placeholderCount?: number;
  scrollbarLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
}

export function FeaturedProductsCarousel({
  title,
  description,
  cta,
  products,
  emptyStateTitle,
  emptyStateSubtitle,
  placeholderCount,
  scrollbarLabel,
  previousLabel,
  nextLabel,
}: Props) {
  return (
    <SectionLayout className="group/pending" hideOverflow>
      <div className="mb-6 flex w-full flex-row flex-wrap items-end justify-between gap-x-8 gap-y-6 text-foreground @4xl:mb-8">
        <div>
          <h2 className="font-heading text-2xl leading-none @xl:text-3xl @4xl:text-4xl">{title}</h2>
          {description != null && description !== '' && (
            <p className="mt-3 max-w-xl leading-relaxed text-contrast-500">{description}</p>
          )}
        </div>

        {cta != null && cta.href !== '' && cta.label !== '' && (
          <AnimatedLink className="mr-3" label={cta.label} link={{ href: cta.href }} />
        )}
      </div>
      <div className="group-has-[[data-pending]]/pending:animate-pulse">
        <ProductsCarousel
          emptyStateSubtitle={emptyStateSubtitle}
          emptyStateTitle={emptyStateTitle}
          hideOverflow={false}
          nextLabel={nextLabel}
          placeholderCount={placeholderCount}
          previousLabel={previousLabel}
          products={products}
          scrollbarLabel={scrollbarLabel}
        />
      </div>
    </SectionLayout>
  );
}
