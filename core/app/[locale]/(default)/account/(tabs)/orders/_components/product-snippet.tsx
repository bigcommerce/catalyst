import { getFormatter, getTranslations } from 'next-intl/server';

import { client } from '~/client';
import { graphql, ResultOf, VariablesOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { Image } from '~/components/image';
import { Link } from '~/components/link';
import { ProductCardFragment } from '~/components/product-card/fragment';
import { Price as PricesType } from '~/components/ui/product-card';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { cn } from '~/lib/utils';

const ProductAttributes = graphql(`
  query ProductAttributes($entityId: Int) {
    site {
      product(entityId: $entityId) {
        path
      }
    }
  }
`);

export type ProductAttributesVariables = VariablesOf<typeof ProductAttributes>;

export const OrderItemFragment = graphql(`
  fragment OrderItemFragment on OrderPhysicalLineItem {
    entityId
    productEntityId
    brand
    name
    quantity
    image {
      url: urlTemplate(lossy: true)
      altText
    }
    subTotalListPrice {
      value
      currencyCode
    }
    productOptions {
      __typename
      name
      value
    }
  }
`);

export type ProductSnippetFragment = Omit<
  ResultOf<typeof ProductCardFragment>,
  'productOptions' | 'reviewSummary' | 'inventory' | 'availabilityV2' | 'brand' | 'path'
> & {
  productId: number;
  brand: string | null;
  quantity: number;
  productOptions?: Array<{
    __typename: string;
    name: string;
    value: string;
  }>;
};

export const assembleProductData = (orderItem: ResultOf<typeof OrderItemFragment>) => {
  const {
    entityId,
    productEntityId: productId,
    name,
    brand,
    image,
    subTotalListPrice,
    productOptions,
  } = orderItem;

  return {
    entityId,
    productId,
    name,
    brand,
    defaultImage: image
      ? {
          url: image.url,
          altText: image.altText,
        }
      : null,
    productOptions,
    quantity: orderItem.quantity,
    prices: {
      price: subTotalListPrice,
      basePrice: null,
      retailPrice: null,
      salePrice: null,
      priceRange: {
        min: subTotalListPrice,
        max: subTotalListPrice,
      },
    },
  };
};

const Price = async ({ price }: { price?: PricesType }) => {
  const t = await getTranslations('Product.Details.Prices');

  if (!price) {
    return;
  }

  return (
    Boolean(price) &&
    (typeof price === 'object' ? (
      <p className="flex flex-col gap-1">
        {price.type === 'range' && (
          <span>
            {price.minValue} - {price.maxValue}
          </span>
        )}

        {price.type === 'sale' && (
          <>
            <span>
              {t('was')}: <span className="line-through">{price.previousValue}</span>
            </span>
            <span>
              {t('now')}: {price.currentValue}
            </span>
          </>
        )}
      </p>
    ) : (
      <span>{price}</span>
    ))
  );
};

interface Props {
  product: ProductSnippetFragment;
  imageSize?: 'tall' | 'wide' | 'square';
  brandSize?: string;
  productSize?: string;
  imagePriority?: boolean;
  isExtended?: boolean;
}

export const ProductSnippet = async ({
  product,
  isExtended = false,
  imageSize = 'square',
  imagePriority = false,
  brandSize,
  productSize,
}: Props) => {
  const { name, defaultImage, brand, productId, prices } = product;
  const format = await getFormatter();
  const t = await getTranslations('Product.Details');
  const price = pricesTransformer(prices, format);
  const isImageAvailable = defaultImage !== null;

  const { data } = await client.fetch({
    document: ProductAttributes,
    variables: { entityId: productId },
    fetchOptions: { next: { revalidate } },
  });

  const { path = '' } = data.site.product ?? {};

  return (
    <div className={cn('relative flex flex-col overflow-visible', isExtended && 'flex-row gap-4')}>
      <div className="flex justify-center pb-3">
        {isImageAvailable && (
          <div
            className={cn('relative flex-auto', isExtended && 'h-20 md:h-36', {
              'aspect-square': imageSize === 'square',
              'aspect-[4/5]': imageSize === 'tall',
              'aspect-[7/5]': imageSize === 'wide',
            })}
          >
            <Image
              alt={defaultImage.altText || name}
              className="object-contain"
              fill
              priority={imagePriority}
              sizes="(max-width: 768px) 80px, 144px"
              src={defaultImage.url}
            />
          </div>
        )}
        {!isImageAvailable && (
          <div className={cn('relative aspect-square flex-auto', isExtended && 'h-20 md:h-36')}>
            <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
              <span className="text-center text-sm md:text-base">{t('comingSoon')}</span>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        {brand ? <p className={cn('text-base text-gray-500', brandSize)}>{brand}</p> : null}
        {isExtended ? (
          <div className="flex flex-col items-start justify-between md:flex-row">
            <div>
              <h3 className={cn('text-base font-semibold', productSize)}>
                <Link
                  className="hover:text-primary focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-primary/20 focus-visible:ring-0"
                  href={path}
                >
                  <span aria-hidden="true" className="absolute inset-0" />
                  {name}
                </Link>
              </h3>
              <div className="mb-2 mt-2 lg:mb-0">
                {product.productOptions?.map(({ name: optionName, value }, idx) => {
                  return (
                    <p className="flex gap-1 text-xs" key={idx}>
                      <span>{optionName}:</span>
                      <span className="font-semibold">{value}</span>
                    </p>
                  );
                })}
                <p className="flex gap-1 text-xs">
                  <span>{t('qty')}:</span>
                  <span className="font-semibold">{product.quantity}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-end justify-between font-semibold">
              <Price price={price} />
            </div>
          </div>
        ) : (
          <h3 className={cn('text-base font-semibold', productSize)}>
            <Link
              className="hover:text-primary focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-primary/20 focus-visible:ring-0"
              href={path}
            >
              <span aria-hidden="true" className="absolute inset-0" />
              {name}
            </Link>
          </h3>
        )}
        {!isExtended && (
          <div className="flex flex-wrap items-end justify-between">
            <Price price={price} />
          </div>
        )}
      </div>
    </div>
  );
};

export const ProductSnippetSkeleton = ({ isExtended = false }: { isExtended?: boolean }) => {
  return (
    <div
      className={cn(
        'relative flex animate-pulse flex-col overflow-visible',
        isExtended && 'flex-row gap-4',
      )}
    >
      <div className="flex justify-center pb-3">
        <div className={cn('relative aspect-square flex-auto', isExtended && 'h-20 md:h-36')}>
          <div className="flex h-full w-full items-center justify-center bg-slate-200 text-gray-500" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1">
        {isExtended ? (
          <div className="flex h-full flex-col items-start justify-between md:flex-row">
            <div className="flex h-20 flex-col justify-between md:h-36">
              <div className="h-5 w-20 bg-slate-200 md:h-10 md:w-36" />
              <div className="h-5 w-20 bg-slate-200 md:h-10 md:w-36" />
              <div className="h-5 w-20 bg-slate-200 md:h-10 md:w-36" />
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-5 w-36 bg-slate-200 md:h-6" />
            <div className="h-5 w-36 bg-slate-200 md:h-6" />
            <div className="h-5 w-36 bg-slate-200 md:h-6" />
          </div>
        )}
      </div>
    </div>
  );
};
