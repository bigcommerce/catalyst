import { clsx } from 'clsx';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import {
  Carousel,
  CarouselButtons,
  CarouselContent,
  CarouselItem,
} from '@/vibes/soul/primitives/carousel';
import { CompareCard, CompareCardSkeleton } from '@/vibes/soul/primitives/compare-card';
import { type CompareSectionData } from '~/ui/compare-section';

interface Props extends CompareSectionData {
  className?: string;
  title?: string;
  emptyStateTitle?: Streamable<string | null>;
  emptyStateSubtitle?: Streamable<string | null>;
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
}

export function CompareSection({
  className,
  title = 'Compare products',
  products: streamableProducts,
  addToCartAction,
  addToCartLabel,
  emptyStateTitle,
  emptyStateSubtitle,
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
}: Props) {
  return (
    <Stream
      fallback={<CompareSectionSkeleton className={className} pending />}
      value={streamableProducts}
    >
      {(products) => {
        if (products.length === 0) {
          return (
            <CompareSectionEmptyState
              className={className}
              emptyStateSubtitle={emptyStateSubtitle}
              emptyStateTitle={emptyStateTitle}
            />
          );
        }

        return (
          <div className={clsx('@container overflow-hidden', className)}>
            <div className="mx-auto w-full max-w-(--breakpoint-2xl) px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20">
              <Carousel>
                <div className="mb-8 flex w-full items-end justify-between gap-10 @xl:mb-10">
                  <h1 className="font-heading text-2xl leading-none @xl:text-3xl @4xl:text-4xl">
                    {title} <span className="text-contrast-300">{products.length}</span>
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
                      className="basis-[calc(100%-20px)] @md:basis-1/2 @lg:basis-1/3 @2xl:basis-1/4"
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
  pending = false,
}: {
  className?: string;
  title?: string;
  pending?: boolean;
}) {
  return (
    <div className={clsx('group/pending @container overflow-hidden', className)}>
      <div
        className="mx-auto w-full max-w-(--breakpoint-2xl) px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20"
        data-pending={pending ? '' : undefined}
      >
        <div className="@container relative">
          <div className="mb-8 flex w-full items-end justify-between gap-10 @xl:mb-10">
            <h1 className="font-heading text-2xl leading-none @xl:text-3xl @4xl:text-4xl">
              {title}
            </h1>
            <div className="text-contrast-200 flex gap-2 group-has-data-pending/pending:animate-pulse">
              <ArrowLeft className="h-6 w-6" strokeWidth={1.5} />
              <ArrowRight className="h-6 w-6" strokeWidth={1.5} />
            </div>
          </div>

          <div className="w-full group-has-data-pending/pending:animate-pulse">
            <div className="-ml-4 flex @2xl:-ml-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  className="min-w-0 shrink-0 grow-0 basis-[calc(100%-20px)] pl-4 @md:basis-1/2 @lg:basis-1/3 @2xl:basis-1/4 @2xl:pl-5"
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
    </div>
  );
}

export function CompareSectionEmptyState({
  className,
  title = 'Compare products',
  emptyStateTitle,
  emptyStateSubtitle,
}: {
  className?: string;
  title?: string;
  emptyStateTitle?: Streamable<string | null>;
  emptyStateSubtitle?: Streamable<string | null>;
}) {
  return (
    <div className={clsx('@container overflow-hidden', className)}>
      <div className="mx-auto w-full max-w-(--breakpoint-2xl) px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20">
        <div className="@container relative">
          <div className="mb-8 flex w-full items-end justify-between gap-10 @xl:mb-10">
            <h1 className="font-heading text-2xl leading-none @xl:text-3xl @4xl:text-4xl">
              {title}
            </h1>
          </div>

          <div className="relative w-full">
            <div className="-ml-4 flex [mask-image:linear-gradient(to_bottom,_black_0%,_transparent_90%)] @2xl:-ml-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  className="min-w-0 shrink-0 grow-0 basis-[calc(100%-20px)] pl-4 @md:basis-1/2 @lg:basis-1/3 @2xl:basis-1/4 @2xl:pl-5"
                  key={index}
                  role="group"
                >
                  <CompareCardSkeleton />
                </div>
              ))}
            </div>
            <div className="absolute inset-0 mx-auto px-3 py-16 pb-3 @4xl:px-10 @4xl:pt-28 @4xl:pb-10">
              <div className="mx-auto max-w-xl space-y-2 text-center @4xl:space-y-3">
                <h3 className="@4x:leading-none font-heading text-foreground text-2xl leading-tight @4xl:text-4xl">
                  {emptyStateTitle}
                </h3>
                <p className="text-contrast-500 text-sm @4xl:text-lg">{emptyStateSubtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
