import { getFormatter, getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';

import { client } from '~/client';
import { graphql, ResultOf, VariablesOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { BcImage } from '~/components/bc-image';
import { retrieveMpnData } from '~/components/common-functions';
import { Link } from '~/components/link';
import { GetCartMetaFields } from '~/components/management-apis';
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
    baseCatalogProduct {
      variants {
        edges {
          node {
            mpn
            sku
            entityId
            isPurchasable
          }
        }
      }
    }
    image {
      url(width: 150, height: 150, lossy: true)
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
    baseCatalogProduct,
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
    baseCatalogProduct: baseCatalogProduct,
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
      <>
        {price.type === 'range' && (
          <div className="text-[14px] font-normal leading-[24px] tracking-[0.25px]">
            {price.minValue} - {price.maxValue}
          </div>
        )}
        <div className="flex items-center justify-end gap-[2px]">
          {price.type === 'sale' && (
            <>
              <span className="text-[14px] font-normal leading-[24px] tracking-[0.25px] line-through">
                {price.previousValue}
              </span>
              <span className="text-[12px] font-normal leading-[18px] tracking-[0.4px] text-[#5C5C5C]">
                {price.currentValue}
              </span>
            </>
          )}
        </div>
      </>

    ) : (
      <div className="text-[14px] font-normal leading-[24px] tracking-[0.25px]">
        {price}
      </div>
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
  from?: string;
}

export const ProductSnippet = async ({
  product,
  isExtended = false,
  imageSize = 'square',
  imagePriority = false,
  brandSize,
  productSize,
  from,
}: Props) => {
//    const cookieStore = await cookies();
//     const cartId = cookieStore.get('cartId')?.value ||"";
const cartId = "0fc2508f-f0aa-4ff6-b59a-821fbc5187f1";
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
console.log("product------", product);
  const { path = '' } = data.site.product ?? {};




  let getCartMetaFields: any = await GetCartMetaFields(cartId, 'accessories_data');
console.log("getCartMetaFields", getCartMetaFields);

let updatedLineItemInfo: any = [];
let updatedLineItemWithoutAccessories: any = [];
let accessoriesSkuArray: any = [];

// Ensure getCartMetaFields is an array
if (Array.isArray(getCartMetaFields) && getCartMetaFields?.length > 0) {
  // Ensure product is an array before forEach
  if (Array.isArray(product)) {
    product?.forEach((item: any) => {
      let accessoriesData: any = [];
      let findAccessories = getCartMetaFields?.find((acces: any) => acces?.key == item?.entityId);
      console.log("item.entitId", item?.entitId);
      if (findAccessories) {
        let getAccessoriesInfo = findAccessories?.value ? JSON?.parse(findAccessories?.value) : [];
        if (Array.isArray(getAccessoriesInfo) && getAccessoriesInfo?.length > 0) {
          getAccessoriesInfo?.forEach((getInfo: any) => {
            if (!accessoriesSkuArray?.includes(getInfo?.variantId)) {
              accessoriesSkuArray.push(getInfo?.variantId);
            }
            let accessoriesInfo = product?.find(
              (line: any) => line?.variantEntityId == getInfo?.variantId,
            );
            if (accessoriesInfo) {
              let accessSpreadData: any = { ...accessoriesInfo };
              accessSpreadData.prodQuantity = getInfo.quantity;
              accessSpreadData.cartId = cartId;
              accessSpreadData.lineItemId = item?.entityId;
              accessoriesData.push(accessSpreadData);
            }
          });
        }
      }
      if (accessoriesData?.length > 0) {
        item['accessories'] = accessoriesData;
      }
      if (!accessoriesSkuArray?.includes(item?.variantEntityId)) {
        updatedLineItemInfo.push(item);
      }
    });
  } else {
    console.error("Product is not an array");
  }
} else {
  // Fallback when getCartMetaFields is empty or not an array
  getCartMetaFields = [];
  updatedLineItemInfo = Array.isArray(product) ? product : [];
}

// Ensure updatedLineItemInfo is an array
updatedLineItemInfo?.forEach((item: any, index: number) => {
  if (!accessoriesSkuArray?.includes(item?.variantEntityId)) {
    updatedLineItemWithoutAccessories.push(item);
  }
});



  //let productMpn: string = retrieveMpnData(product, product?.)

  return (
    <div className="flex flex-col items-start gap-[15px] border border-[#CCCBCB] p-0">
      {from != 'order' && (
        <div className="flex w-full flex-row items-start gap-[10px] bg-[#03465C] p-[10px]">
          <button className="flex flex-row items-center justify-center gap-[10px] rounded-[50px] bg-[#F3F4F5] px-[10px] text-[16px] font-normal leading-[32px] tracking-[0.15px] text-[#353535]">
            PROCESSING
          </button>
        </div>
      )}
      <div className={`flex w-full flex-row items-center justify-between p-0 px-[20px] pb-[20px] ${from == 'order' ? 'mt-[20px]' : ''}`}>
        <div className={`flex-row items-center gap-[20px] p-0  ${from == 'order' ? 'w-full pr-0 grid [grid-template-columns:88px_auto] sm:flex' : 'w-2/3 pr-[20px] flex'}` }>
          <div>
            {isImageAvailable && (
              <BcImage
                alt={defaultImage.altText || name}
                className={`${from == 'order' ? "h-[88px] w-[88px] sm:h-[150px] sm:w-[150px]" : 'h-[150px] w-[150px]'}`}
                width={150}
                height={150}
                priority={imagePriority}
                src={defaultImage.url}
              />
            )}
            {!isImageAvailable && (
              <div className="h-[150px] w-[150px]">
                <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
                  <span className="text-center text-sm md:text-base">{t('comingSoon')}</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex-shrink-[100]">
            <div className="items-center text-[16px] font-normal leading-[32px] tracking-[0.15px] text-black">
              {name}
            </div>
            <div>
              <span className="text-[14px] font-bold leading-[24px] tracking-[0.25px] text-[#7F7F7F]">
                SKU:
              </span>
              <span className="text-[14px] font-[400] leading-[24px] tracking-[0.25px] text-[#7F7F7F]">
                {' '}
                |{' '}
              </span>
              {product.productOptions?.map(({ name: optionName, value }, idx) => {
                return (
                  <>
                    <span className="text-[14px] font-bold leading-[24px] tracking-[0.25px] text-[#7F7F7F]" key={idx}>
                      {optionName}
                    </span>
                    <span className="text-[14px] font-[400] leading-[24px] tracking-[0.25px] text-[#7F7F7F]">
                      {' '}
                      {value}
                    </span>
                  </>
                );
              })}
            </div>
            <div className={`text-[14px] leading-[24px] tracking-[0.25px] text-[#353535] ${from == 'order' ? 'font-normal' : 'font-bold'}`}>
              {t('qty')}: {product.quantity}
            </div>
          </div>
          <div className="flex min-w-[25%] flex-col justify-center text-right">
            <Price price={price} />
          </div>
        </div>
        {from != 'order' && (
          <div className="w-1/3">
            <div className="flex flex-col gap-[5px]">
              {/*<button className="flex w-full flex-row items-center justify-center gap-[5px] rounded-[3px] bg-[#008BB7] p-[5px] px-[10px] text-[14px] font-medium leading-[32px] tracking-[1.25px] text-white">
              CANCEL ORDER
            </button>
            <div className="h-[42px] self-center text-center text-[12px] font-normal leading-[18px] tracking-[0.4px] text-[#000000]">
              Eligible Through mm/dd/yy
            </div>
            <button className="flex h-[42px] flex-row items-center justify-center rounded-[3px] border border-[#B4DDE9] bg-[#ffffff] p-[5px_10px] text-[14px] font-[500] leading-[32px] tracking-[1.25px] text-[#002A37]">
              LEAVE A REVIEW
            </button>*/}
              <button className="flex h-[42px] flex-row items-center justify-center rounded-[3px] border border-[#B4DDE9] bg-[#ffffff] p-[5px_10px] text-[14px] font-[500] leading-[32px] tracking-[1.25px] text-[#002A37]">
                REPLACE ITEMS
              </button>
            </div>
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
