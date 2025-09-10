import { clsx } from 'clsx';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import {
  Carousel,
  CarouselButtons,
  CarouselContent,
  CarouselItem,
} from '@/vibes/soul/primitives/carousel';
import {
  CompareCard,
  CompareCardSkeleton,
  type CompareProduct,
} from '@/vibes/soul/primitives/compare-card';
import { CompareAddToCartAction } from '@/vibes/soul/primitives/compare-card/add-to-cart-form';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';

interface CompareSectionProps {
  className?: string;
  title?: string;
  products: Streamable<CompareProduct[]>;
  emptyStateTitle?: Streamable<string>;
  emptyStateSubtitle?: Streamable<string>;
  addToCartLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  descriptionLabel?: string;
  noDescriptionLabel?: string;
  ratingLabel?: string;
  noRatingsLabel?: string;
  otherDetailsLabel?: string;
  noOtherDetailsLabel?: string;
  viewOptionsLabel?: string;
  preorderLabel?: string;
  placeholderCount?: number;
  addToCartAction?: CompareAddToCartAction;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --compare-section-title-font-family: var(--font-family-heading);
 *   --compare-section-title: hsl(var(--foreground));
 *   --compare-section-count: hsl(var(--contrast-300));
 *   --compare-section-empty-font-family: var(--font-family-body);
 *   --compare-section-empty-title-font-family: var(--font-family-heading);
 *   --compare-section-empty-title: hsl(var(--foreground));
 *   --compare-section-empty-subtitle: hsl(var(--contrast-500));
 * }
 * ```
 */
export function CompareSection({
  className = '',
  title = 'Compare products',
  products: streamableProducts,
  addToCartAction,
  addToCartLabel,
  emptyStateTitle = 'No products to compare',
  emptyStateSubtitle = 'Browse our catalog to find products.',
  previousLabel,
  nextLabel,
  descriptionLabel,
  noDescriptionLabel,
  ratingLabel,
  noRatingsLabel,
  otherDetailsLabel,
  noOtherDetailsLabel,
  viewOptionsLabel,
  preorderLabel,
  placeholderCount,
}: CompareSectionProps) {
  return (
    <Stream
      fallback={
        <CompareSectionSkeleton className={className} placeholderCount={placeholderCount} />
      }
      value={streamableProducts}
    >
      {(products) => {
        if (products.length === 0) {
          return (
            <CompareSectionEmptyState
              className={className}
              emptyStateSubtitle={emptyStateSubtitle}
              emptyStateTitle={emptyStateTitle}
              placeholderCount={placeholderCount}
            />
          );
        }

        return (
          <div className={clsx('overflow-hidden @container', className)}>
            <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20">
              <Carousel>
                <div className="mb-8 flex w-full items-end justify-between gap-10 @xl:mb-10">
                  <h1 className="font-[family-name:var(--compare-section-title-font-family,var(--font-family-heading))] text-2xl leading-none text-[var(--compare-section-title,hsl(var(--foreground)))] @xl:text-3xl @4xl:text-4xl">
                    {title}{' '}
                    <span className="text-[var(--compare-section-count,hsl(var(--contrast-300)))]">
                      {products.length}
                    </span>
                  </h1>
                  <CarouselButtons
                    className="hidden @md:flex"
                    nextLabel={nextLabel}
                    previousLabel={previousLabel}
                  />
                </div>
                <CarouselContent>
                  {products.map((product) => (
                    <CarouselItem
                      className="basis-full @sm:basis-1/2 @md:basis-1/3 @4xl:basis-1/4"
                      key={product.id}
                    >
                      <CompareCard
                        addToCartAction={addToCartAction}
                        addToCartLabel={addToCartLabel}
                        descriptionLabel={descriptionLabel}
                        imageSizes="(min-width: 42rem) 25vw, (min-width: 32rem) 33vw, (min-width: 28rem) 50vw, 100vw"
                        key={product.id}
                        noDescriptionLabel={noDescriptionLabel}
                        noOtherDetailsLabel={noOtherDetailsLabel}
                        noRatingsLabel={noRatingsLabel}
                        otherDetailsLabel={otherDetailsLabel}
                        preorderLabel={preorderLabel}
                        product={product}
                        ratingLabel={ratingLabel}
                        viewOptionsLabel={viewOptionsLabel}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        );
      }}
    </Stream>
  );
}

export function CompareSectionSkeleton({
  className,
  title = 'Compare products',
  placeholderCount = 4,
}: Pick<CompareSectionProps, 'className' | 'title' | 'placeholderCount'>) {
  return (
    <Skeleton.Root className={clsx('group/compare-section', className)} hideOverflow>
      <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20">
        <div className="relative @container">
          <div className="mb-8 flex w-full items-end justify-between gap-10 @xl:mb-10">
            <h1 className="font-[family-name:var(--compare-section-title-font-family,var(--font-family-heading))] text-2xl leading-none text-[var(--compare-section-title,hsl(var(--foreground)))] @xl:text-3xl @4xl:text-4xl">
              {title}
            </h1>
            <div className="group-has-[[data-pending]]/compare-section:animate-pulse" data-pending>
              <div className="flex gap-2">
                <Skeleton.Icon
                  icon={<ArrowLeft aria-hidden className="h-6 w-6" strokeWidth={1.5} />}
                />
                <Skeleton.Icon
                  icon={<ArrowRight aria-hidden className="h-6 w-6" strokeWidth={1.5} />}
                />
              </div>
            </div>
          </div>
          <div
            className="w-full group-has-[[data-pending]]/compare-section:animate-pulse"
            data-pending
          >
            <div className="-ml-4 flex @2xl:-ml-5">
              {Array.from({ length: placeholderCount }).map((_, index) => (
                <div
                  className="min-w-0 shrink-0 grow-0 basis-full pl-4 @md:basis-1/2 @lg:basis-1/3 @2xl:basis-1/4 @2xl:pl-5"
                  key={index}
                  role="group"
                >
                  <CompareCardSkeleton />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Skeleton.Root>
  );
}

export function CompareSectionEmptyState({
  className,
  emptyStateTitle,
  emptyStateSubtitle,
  placeholderCount = 4,
}: Pick<
  CompareSectionProps,
  'className' | 'title' | 'emptyStateTitle' | 'emptyStateSubtitle' | 'placeholderCount'
>) {
  return (
    <div className={clsx('overflow-hidden @container', className)}>
      <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20">
        <div className="@container">
          <div className="relative w-full">
            <div className="-ml-4 flex [mask-image:linear-gradient(to_bottom,_black_0%,_transparent_90%)] @2xl:-ml-5">
              {Array.from({ length: placeholderCount }).map((_, index) => (
                <div
                  className="min-w-0 shrink-0 grow-0 basis-full pl-4 @md:basis-1/2 @lg:basis-1/3 @2xl:basis-1/4 @2xl:pl-5"
                  key={index}
                  role="group"
                >
                  <CompareCardSkeleton />
                </div>
              ))}
            </div>
            <div className="absolute inset-0 mx-auto px-3 py-16 pb-3 @4xl:px-10 @4xl:pb-10 @4xl:pt-28">
              <header className="mx-auto max-w-xl space-y-2 text-center font-[family-name:var(--compare-section-empty-font-family,var(--font-family-body))] @4xl:space-y-3">
                <h3 className="font-[family-name:var(--compare-section-empty-title-font-family,var(--font-family-heading))] text-2xl leading-tight text-[var(--compare-section-empty-title,hsl(var(--foreground)))] @4xl:text-4xl @4xl:leading-none">
                  {emptyStateTitle}
                </h3>
                <p className="text-sm text-[var(--compare-section-empty-subtitle,hsl(var(--contrast-500)))] @4xl:text-lg">
                  {emptyStateSubtitle}
                </p>
              </header>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
