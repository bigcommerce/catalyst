import { useFormatter } from 'next-intl';

import { FragmentOf, graphql, ResultOf } from '~/client/graphql';
import { BcImage } from '~/components/bc-image';
import { ProductCardFragment } from '~/components/product-card';
import { Price as PricesType } from '~/components/ui/product-card';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { cn } from '~/lib/utils';
import { Link } from '~/navigation';

export const OrderItemFragment = graphql(`
  fragment OrderItemFragment on OrderPhysicalLineItem {
    entityId
    brand
    name
    quantity
    image {
      altText
      url: urlTemplate
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
  'productOptions' | 'reviewSummary' | 'inventory' | 'availabilityV2'
> & {
  quantity: number;
  productOptions?: Array<{
    __typename: string;
    name: string;
    value: string;
  }>;
};

export const assembleProductData = (orderItem: FragmentOf<typeof OrderItemFragment>) => {
  const { entityId: productId, name, brand, subTotalListPrice, image, productOptions } = orderItem;

  return {
    entityId: productId,
    name,
    brand: {
      name: brand ?? '',
      path: '', // will be added later
    },
    defaultImage: {
      url: image?.url ?? '',
      altText: image?.altText ?? name,
    },
    productOptions,
    path: '', // will be added later
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

const Price = ({ price }: { price?: PricesType }) => {
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
              Was: <span className="line-through">{price.previousValue}</span>
            </span>
            <span>Now: {price.currentValue}</span>
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

export const ProductSnippet = ({
  product,
  isExtended = false,
  imageSize = 'square',
  imagePriority = false,
  brandSize,
  productSize,
}: Props) => {
  const format = useFormatter();
  const { name, defaultImage, brand, path, prices } = product;
  const price = pricesTransformer(prices, format);

  return (
    <div className={cn('relative flex flex-col overflow-visible', isExtended && 'flex-row gap-4')}>
      <div className={cn('relative flex justify-center pb-3', isExtended && 'w-1/4')}>
        <div
          className={cn('relative flex-auto', {
            'aspect-square': imageSize === 'square',
            'aspect-[4/5]': imageSize === 'tall',
            'aspect-[7/5]': imageSize === 'wide',
          })}
        >
          {defaultImage?.url ? (
            <BcImage
              alt={defaultImage.altText || name}
              className="object-contain"
              fill
              priority={imagePriority}
              sizes="(max-width: 768px) 50vw, (max-width: 1536px) 25vw, 500px"
              src={defaultImage.url}
            />
          ) : (
            <div className="h-full w-full bg-gray-200" />
          )}
        </div>
      </div>
      <div className={cn('flex flex-1 flex-col gap-1', isExtended && 'w-3/4')}>
        {brand ? <p className={cn('text-base text-gray-500', brandSize)}>{brand.name}</p> : null}
        {isExtended ? (
          <div className="flex flex-col items-start justify-between md:flex-row">
            <div>
              <h3 className={cn('text-base font-semibold', productSize)}>
                <Link
                  className="focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-primary/20 focus-visible:ring-0"
                  href={path}
                >
                  <span aria-hidden="true" className="absolute inset-0 bottom-20" />
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
                  <span>Qty:</span>
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
              className="focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-primary/20 focus-visible:ring-0"
              href={path}
            >
              <span aria-hidden="true" className="absolute inset-0 bottom-20" />
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
