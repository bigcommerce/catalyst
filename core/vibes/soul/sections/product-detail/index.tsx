import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Accordion, Accordions } from '@/vibes/soul/primitives/accordions';
import { Breadcrumb, Breadcrumbs } from '@/vibes/soul/primitives/breadcrumbs';
import { Price, PriceLabel } from '@/vibes/soul/primitives/price-label';
import { Rating } from '@/vibes/soul/primitives/rating';
import { ProductGallery } from '@/vibes/soul/sections/product-detail/product-gallery';

import { ProductDetailForm, ProductDetailFormAction } from './product-detail-form';
import { Field } from './schema';

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
  description?: Streamable<string | React.ReactNode | null>;
  accordions?: Streamable<
    Array<{
      title: string;
      content: React.ReactNode;
    }>
  >;
}

interface Props<F extends Field> {
  breadcrumbs?: Streamable<Breadcrumb[]>;
  product: Streamable<ProductDetailProduct | null>;
  action: ProductDetailFormAction<F>;
  fields: Streamable<F[]>;
  quantityLabel?: string;
  incrementLabel?: string;
  decrementLabel?: string;
  ctaLabel?: Streamable<string | null>;
  ctaDisabled?: Streamable<boolean | null>;
  prefetch?: boolean;
  thumbnailLabel?: string;
}

export function ProductDetail<F extends Field>({
  product: streamableProduct,
  action,
  fields: streamableFields,
  breadcrumbs,
  quantityLabel,
  incrementLabel,
  decrementLabel,
  ctaLabel: streamableCtaLabel,
  ctaDisabled: streamableCtaDisabled,
  prefetch,
  thumbnailLabel,
}: Props<F>) {
  return (
    <section className="@container">
      <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20">
        {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} className="mb-6" />}

        <Stream fallback={<ProductDetailSkeleton />} value={streamableProduct}>
          {(product) =>
            product && (
              <div className="grid grid-cols-1 items-stretch gap-x-8 gap-y-8 @2xl:grid-cols-2 @5xl:gap-x-12">
                <div className="hidden @2xl:block">
                  <Stream fallback={<ProductGallerySkeleton />} value={product.images}>
                    {(images) => <ProductGallery images={images} />}
                  </Stream>
                </div>

                {/* Product Details */}
                <div className="text-foreground">
                  {product.subtitle != null && product.subtitle !== '' && (
                    <p className="font-mono text-sm uppercase">{product.subtitle}</p>
                  )}

                  <h1 className="mb-3 mt-2 font-heading text-2xl font-medium leading-none @xl:mb-4 @xl:text-3xl @4xl:text-4xl">
                    {product.title}
                  </h1>

                  <Stream fallback={<RatingSkeleton />} value={product.rating}>
                    {(rating) => <Rating rating={rating ?? 0} />}
                  </Stream>

                  <Stream fallback={<PriceLabelSkeleton />} value={product.price}>
                    {(price) => (
                      <PriceLabel className="my-3 text-xl @xl:text-2xl" price={price ?? ''} />
                    )}
                  </Stream>

                  <div className="mb-8 @2xl:hidden">
                    <Stream fallback={<ProductGallerySkeleton />} value={product.images}>
                      {(images) => (
                        <ProductGallery images={images} thumbnailLabel={thumbnailLabel} />
                      )}
                    </Stream>
                  </div>

                  <Stream fallback={<ProductSummarySkeleton />} value={product.summary}>
                    {(summary) =>
                      summary !== undefined &&
                      summary !== '' && <p className="text-contrast-500">{summary}</p>
                    }
                  </Stream>

                  <Stream
                    fallback={<ProductDetailFormSkeleton />}
                    value={Promise.all([
                      streamableFields,
                      streamableCtaLabel,
                      streamableCtaDisabled,
                    ])}
                  >
                    {([fields, ctaLabel, ctaDisabled]) => (
                      <ProductDetailForm
                        action={action}
                        ctaDisabled={ctaDisabled ?? undefined}
                        ctaLabel={ctaLabel ?? undefined}
                        decrementLabel={decrementLabel}
                        fields={fields}
                        incrementLabel={incrementLabel}
                        prefetch={prefetch}
                        productId={product.id}
                        quantityLabel={quantityLabel}
                      />
                    )}
                  </Stream>

                  <Stream fallback={<ProductDescriptionSkeleton />} value={product.description}>
                    {(description) =>
                      description !== null &&
                      description !== undefined && (
                        <div className="border-t border-contrast-100 py-8 text-contrast-500">
                          {description}
                        </div>
                      )
                    }
                  </Stream>

                  <Stream fallback={<ProductAccordionsSkeleton />} value={product.accordions}>
                    {(accordions) =>
                      accordions && (
                        <Accordions className="border-t border-contrast-100 pt-4" type="multiple">
                          {accordions.map((accordion, index) => (
                            <Accordion key={index} title={accordion.title} value={index.toString()}>
                              {accordion.content}
                            </Accordion>
                          ))}
                        </Accordions>
                      )
                    }
                  </Stream>
                </div>
              </div>
            )
          }
        </Stream>
      </div>
    </section>
  );
}

function ImageSkeleton() {
  return (
    <div className="aspect-[4/5] h-full w-full shrink-0 grow-0 basis-full animate-pulse bg-contrast-100" />
  );
}

function ThumbnailsSkeleton() {
  return (
    <>
      <div className="h-12 w-12 shrink-0 animate-pulse rounded-lg bg-contrast-100 @md:h-16 @md:w-16" />
      <div className="h-12 w-12 shrink-0 animate-pulse rounded-lg bg-contrast-100 @md:h-16 @md:w-16" />
      <div className="h-12 w-12 shrink-0 animate-pulse rounded-lg bg-contrast-100 @md:h-16 @md:w-16" />
      <div className="h-12 w-12 shrink-0 animate-pulse rounded-lg bg-contrast-100 @md:h-16 @md:w-16" />
    </>
  );
}

function ProductGallerySkeleton() {
  return (
    <div className="@container">
      <div className="w-full overflow-hidden rounded-xl @xl:rounded-2xl">
        <div className="flex">
          <ImageSkeleton />
        </div>
      </div>

      <div className="mt-2 flex max-w-full gap-2 overflow-x-auto">
        <ThumbnailsSkeleton />
      </div>
    </div>
  );
}

function PriceLabelSkeleton() {
  return <div className="my-4 h-4 w-20 animate-pulse rounded-md bg-contrast-100" />;
}

function RatingSkeleton() {
  return (
    <div className="flex w-[136px] animate-pulse items-center gap-1">
      <div className="h-4 w-[100px] rounded-md bg-contrast-100" />
      <div className="h-6 w-8 rounded-xl bg-contrast-100" />
    </div>
  );
}

function ProductSummarySkeleton() {
  return (
    <div className="flex w-full animate-pulse flex-col gap-3.5 pb-6">
      <div className="h-2.5 w-full bg-contrast-100" />
      <div className="h-2.5 w-full bg-contrast-100" />
      <div className="h-2.5 w-3/4 bg-contrast-100" />
    </div>
  );
}

function ProductDescriptionSkeleton() {
  return (
    <div className="flex w-full animate-pulse flex-col gap-3.5 pb-6">
      <div className="h-2.5 w-full bg-contrast-100" />
      <div className="h-2.5 w-full bg-contrast-100" />
      <div className="h-2.5 w-3/4 bg-contrast-100" />
    </div>
  );
}

function ProductDetailFormSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-8 py-8">
      <div className="flex flex-col gap-5">
        <div className="h-2 w-10 rounded-md bg-contrast-100" />
        <div className="flex gap-2">
          <div className="h-11 w-[72px] rounded-full bg-contrast-100" />
          <div className="h-11 w-[72px] rounded-full bg-contrast-100" />
          <div className="h-11 w-[72px] rounded-full bg-contrast-100" />
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <div className="h-2 w-16 rounded-md bg-contrast-100" />
        <div className="flex gap-4">
          <div className="h-10 w-10 rounded-full bg-contrast-100" />
          <div className="h-10 w-10 rounded-full bg-contrast-100" />
          <div className="h-10 w-10 rounded-full bg-contrast-100" />
          <div className="h-10 w-10 rounded-full bg-contrast-100" />
          <div className="h-10 w-10 rounded-full bg-contrast-100" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-12 w-[120px] rounded-lg bg-contrast-100" />
        <div className="h-12 w-[216px] rounded-full bg-contrast-100" />
      </div>
    </div>
  );
}

function ProductAccordionsSkeleton() {
  return (
    <div className="flex h-[600px] w-full animate-pulse flex-col gap-8 pt-4">
      <div className="flex items-center justify-between">
        <div className="h-2 w-20 rounded-sm bg-contrast-100" />
        <div className="h-3 w-3 rounded-full bg-contrast-100" />
      </div>
      <div className="mb-1 flex flex-col gap-4">
        <div className="h-3 w-full rounded-sm bg-contrast-100" />
        <div className="h-3 w-full rounded-sm bg-contrast-100" />
        <div className="h-3 w-3/5 rounded-sm bg-contrast-100" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-2 w-24 rounded-sm bg-contrast-100" />
        <div className="h-3 w-3 rounded-full bg-contrast-100" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-2 w-20 rounded-sm bg-contrast-100" />
        <div className="h-3 w-3 rounded-full bg-contrast-100" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-2 w-32 rounded-sm bg-contrast-100" />
        <div className="h-3 w-3 rounded-full bg-contrast-100" />
      </div>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="grid animate-pulse grid-cols-1 items-stretch gap-x-6 gap-y-8 @2xl:grid-cols-2 @5xl:gap-x-12">
      <div className="hidden @2xl:block">
        <ProductGallerySkeleton />
      </div>

      <div>
        <div className="mb-6 h-4 w-20 rounded-lg bg-contrast-100" />

        <div className="mb-6 h-6 w-72 rounded-lg bg-contrast-100" />

        <RatingSkeleton />

        <PriceLabelSkeleton />

        <ProductSummarySkeleton />

        <div className="mb-8 @2xl:hidden">
          <ProductGallerySkeleton />
        </div>

        <ProductDetailFormSkeleton />
      </div>
    </div>
  );
}
