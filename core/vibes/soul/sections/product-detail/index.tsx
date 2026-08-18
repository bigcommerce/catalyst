import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Accordion, AccordionItem } from '@/vibes/soul/primitives/accordion';
import { Price, PriceLabel } from '@/vibes/soul/primitives/price-label';
import { Rating } from '@/vibes/soul/primitives/rating';
import { Breadcrumb, Breadcrumbs } from '@/vibes/soul/sections/breadcrumbs';
import { ProductGallery } from '@/vibes/soul/sections/product-detail/product-gallery';
import { Link } from '~/components/link';
import { B2COnly } from '~/components/b2b/visibility';
import { ProductDetailForm, ProductDetailFormAction } from './product-detail-form';
import { Field } from './schema';

// Calculate delivery date accounting for business days (Mon-Fri only)
function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let addedDays = 0;

  while (addedDays < days) {
    result.setDate(result.getDate() + 1);

    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      addedDays += 1;
    }
  }

  return result;
}

interface ProductDetailProduct {
  id: string;
  title: string;
  href: string;
  images: Streamable<Array<{ src: string; alt: string }>>;
  videos?: Streamable<Array<{ title: string; url: string }>>;
  price?: Streamable<Price | null>;
  subtitle?: string;
  subtitleHref?: string;
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
  documents?: Streamable<Array<{ label: string; url: string }>>;
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
  additionaInformationTitle?: string;
  inventoryTracking?: Streamable<string | null>;
  inventoryLevel?: Streamable<{ value: number } | null>;
  sku: Streamable<string>;
  promotions?: Streamable<any>;
  giftProducts?: Streamable<any>;
  documents?: Streamable<Array<{ label: string; url: string }>>;
  /** When provided, renders in the right column alongside the retail form (which is hidden for B2B users via B2COnly). */
  formSlot?: React.ReactNode;
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
  additionaInformationTitle = 'Additional information',
  inventoryTracking,
  inventoryLevel,
  sku,
  promotions,
  giftProducts,
  documents,
  formSlot,
}: Props<F>) {
  return (
    <section className="@container">
      <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20">
        {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} className="mb-6" />}

        <Stream fallback={<ProductDetailSkeleton />} value={streamableProduct}>
          {(product) =>
            product && (
              <div className="grid grid-cols-1 items-start gap-x-8 gap-y-8 @2xl:grid-cols-2 @5xl:gap-x-12">
                <div className="sticky top-8 hidden self-start @2xl:block">
                  <Stream fallback={<ProductGallerySkeleton />} value={Streamable.all([product.images, product.videos ?? Streamable.from(() => Promise.resolve([]))])}>
                    {([images, videos]) => <ProductGallery images={images} videos={videos} productName={product.title} />}
                  </Stream>
                  {documents && (
                    <Stream fallback={null} value={documents}>
                      {(docs) =>
                        docs && docs.length > 0 && (
                          <div className="mt-6 border-t border-contrast-100 pt-4">
                            <p className="mb-3 font-mono text-xs uppercase tracking-wider text-contrast-400">Downloads</p>
                            <ul className="flex flex-col gap-2">
                              {docs.map((doc, i) => (
                                <li key={i}>
                                  <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-foreground underline-offset-4 hover:underline"
                                  >
                                    ↓ {doc.label}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      }
                    </Stream>
                  )}
                </div>

                {/* Product Details */}
                <div className="text-foreground">
                  {product.subtitle != null &&
                    product.subtitle !== '' &&
                    product.subtitleHref != null && (
                      <Link href={product.subtitleHref}>
                        <p className="font-mono text-sm uppercase">{product.subtitle}</p>
                      </Link>
                    )}
                  <h1 className="mb-3 mt-2 font-heading text-2xl font-medium leading-none @xl:mb-4 @xl:text-3xl @4xl:text-4xl">
                    {product.title}
                  </h1>
                  <p className="mb-3 mt-2 font-heading text-base font-medium leading-none">
                    SKU: {sku}
                  </p>
                  <Stream fallback={null} value={product.rating}>
                    {(rating) => (rating ? <Rating rating={rating} /> : null)}
                  </Stream>
                  <Stream fallback={<PriceLabelSkeleton />} value={product.price}>
                    {(price) => (
                      <PriceLabel className="my-3 text-xl @xl:text-2xl" price={price ?? ''} />
                    )}
                  </Stream>
                  <Stream
                    fallback={null}
                    value={Streamable.all([inventoryTracking, inventoryLevel])}
                  >
                    {([tracking, invLevel]) => {
                      // In Stock: tracking is ON and inventory > 0
                      // Backorder: tracking is OFF OR (tracking is ON and inventory <= 0)
                      const isTrackingEnabled = tracking === 'product' || tracking === 'variant';
                      const hasInventory =
                        invLevel && typeof invLevel.value === 'number' && invLevel.value > 0;
                      const isInStock = isTrackingEnabled && hasInventory;

                      if (!isInStock) {
                        // Calculate delivery date using business days (Mon-Fri only)
                        const deliveryDate = addBusinessDays(new Date(), 10);
                        const formattedDate = deliveryDate.toLocaleDateString(undefined, {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        });

                        return (
                          <p className="mt-2 text-sm font-semibold text-green-700">
                            Factory stock. Ships by {formattedDate}
                          </p>
                        );
                      }

                      return <p className="text-base font-semibold text-green-700">✓ In Stock</p>;
                    }}
                  </Stream>
                  <div className="mb-8 @2xl:hidden">
                    <Stream fallback={<ProductGallerySkeleton />} value={Streamable.all([product.images, product.videos ?? Streamable.from(() => Promise.resolve([]))])}>
                      {([images, videos]) => (
                        <ProductGallery
                          images={images}
                          videos={videos}
                          productName={product.title}
                          thumbnailLabel={thumbnailLabel}
                        />
                      )}
                    </Stream>
                  </div>
                  <Stream fallback={<ProductSummarySkeleton />} value={product.summary}>
                    {(summary) =>
                      summary !== undefined &&
                      summary !== '' && <p className="text-contrast-500">{summary}</p>
                    }
                  </Stream>
                  {formSlot ? (
                    <>
                      <B2COnly>
                        <Stream
                          fallback={<ProductDetailFormSkeleton />}
                          value={Streamable.all([
                            streamableFields,
                            streamableCtaLabel,
                            streamableCtaDisabled,
                            promotions ?? Streamable.from(() => Promise.resolve(null)),
                            giftProducts ?? Streamable.from(() => Promise.resolve(null)),
                          ])}
                        >
                          {([fields, ctaLabel, ctaDisabled, promos, gifts]) => (
                            <ProductDetailForm
                              action={action}
                              ctaDisabled={ctaDisabled ?? undefined}
                              ctaLabel={ctaLabel ?? undefined}
                              decrementLabel={decrementLabel}
                              fields={fields}
                              incrementLabel={incrementLabel}
                              inventoryLevel={inventoryLevel}
                              prefetch={prefetch}
                              productId={product.id}
                              quantityLabel={quantityLabel}
                              promotions={promos}
                              giftProducts={gifts}
                            />
                          )}
                        </Stream>
                      </B2COnly>
                      {formSlot}
                    </>
                  ) : (
                    <Stream
                      fallback={<ProductDetailFormSkeleton />}
                      value={Streamable.all([
                        streamableFields,
                        streamableCtaLabel,
                        streamableCtaDisabled,
                        promotions ?? Streamable.from(() => Promise.resolve(null)),
                        giftProducts ?? Streamable.from(() => Promise.resolve(null)),
                      ])}
                    >
                      {([fields, ctaLabel, ctaDisabled, promos, gifts]) => (
                        <ProductDetailForm
                          action={action}
                          ctaDisabled={ctaDisabled ?? undefined}
                          ctaLabel={ctaLabel ?? undefined}
                          decrementLabel={decrementLabel}
                          fields={fields}
                          incrementLabel={incrementLabel}
                          inventoryLevel={inventoryLevel}
                          prefetch={prefetch}
                          productId={product.id}
                          quantityLabel={quantityLabel}
                          promotions={promos}
                          giftProducts={gifts}
                        />
                      )}
                    </Stream>
                  )}

                  <Stream fallback={<ProductDescriptionSkeleton />} value={product.description}>
                    {(description) =>
                      description != null && (
                        <div className="prose prose-sm border-t border-contrast-100 py-8">
                          {description}
                        </div>
                      )
                    }
                  </Stream>
                  <h2 className="sr-only">{additionaInformationTitle}</h2>
                  <Stream fallback={<ProductAccordionsSkeleton />} value={product.accordions}>
                    {(accordions) =>
                      accordions && (
                        <Accordion className="border-t border-contrast-100 pt-4" defaultValue={['0']} type="multiple">
                          {accordions.map((accordion, index) => (
                            <AccordionItem
                              key={index}
                              title={accordion.title}
                              value={index.toString()}
                            >
                              {accordion.content}
                            </AccordionItem>
                          ))}
                        </Accordion>
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
    <div className="aspect-square h-full w-full shrink-0 grow-0 basis-full animate-pulse bg-contrast-100" />
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

export function ProductDetailSkeleton() {
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
