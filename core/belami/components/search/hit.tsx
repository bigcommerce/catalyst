import React from 'react';
import { useState } from 'react';
import { Hit as AlgoliaHit } from 'instantsearch.js';
import { Highlight } from 'react-instantsearch';

import Link from 'next/link';
import Image from 'next/image';
//import { BcImage } from '~/components/bc-image';

import searchColors from '~/belami/include/search-colors.json';

import noImage from '~/public/no-image.svg';

import wetBadge from '~/public/badges/wet.svg';
import dampBadge from '~/public/badges/damp.svg';
import energystarBadge from '~/public/badges/energystar.svg';
import darkskyBadge from '~/public/badges/darksky.svg';
import coastalBadge from '~/public/badges/coastal.svg';

import { useFormatter } from 'next-intl';

import { ReviewSummary } from '~/belami/components/reviews';
import { Compare } from '~/components/ui/product-card/compare';
import WishlistAddToList from '~/app/[locale]/(default)/account/(tabs)/wishlists/wishlist-add-to-list/wishlist-add-to-list';
import { useWishlists } from '~/app/[locale]/(default)/account/(tabs)/wishlists/wishlist-add-to-list/hooks';
import { ProductPrice } from './product-price';

const useAsyncMode = process.env.NEXT_PUBLIC_USE_ASYNC_MODE === 'true';

type DynamicObject = {
  [key: string]: string;
};

const searchColorsHEX: DynamicObject = searchColors;

type HitPrice = {
  CAD: number;
  USD: number;
};

type HitProps = {
  hit: AlgoliaHit<{
    name: string;
    brand: string;
    brand_id: number;
    brand_name: string;
    category_ids: Array<number>;
    image: string;
    image_url: string;
    url: string;
    product_images: any;
    price: number;
    prices: HitPrice;
    sales_prices: HitPrice;
    retail_prices: HitPrice;
    rating: number;
    on_sale: boolean;
    on_clearance: boolean;
    free_shipping: boolean;
    newPrice: number;
    description: string;
    objectID: number | string;
    reviews_rating_sum: number;
    reviews_count: number;
    metafields: any;
    variants: any;
    _tags: string[]; // Add this
    sku: string; // Add this
    mpn: string; // Add this
  }>;
  sendEvent?: any;
  insights?: any;
  promotions?: any[] | null;
  priceMaxRules?: any[] | null;
  useDefaultPrices?: boolean;
  price?: number | null;
  salePrice?: number | null;
  isLoading?: boolean;
  isLoaded?: boolean;
  view?: string;
};

/*
function findPromotionWithBrand(promotions: any[], brandId: number): any | null {
  for (const promotion of promotions) {
    const hasItemConditions = promotion.rules.some(
      (rule: any) =>
        rule.condition?.cart &&
        rule.condition?.cart.items &&
        rule.condition?.cart.items.brands &&
        rule.condition?.cart.items.brands.includes(brandId),
    );
    if (hasItemConditions) {
      return promotion; // Return the first promotion that matches
    }
  }

  return null;
}
*/

interface Promotion {
  name: string;
  redemption_type: string;
  rules: {
    action: {
      cart_items?: {
        discount?: {
          percentage_amount?: string;
          fixed_amount?: string;
        };
      };
      cart_value?: {
        discount?: {
          percentage_amount?: string;
          fixed_amount?: string;
        };
      };
    };
  }[];
  coupons: {
    id: number;
    code?: string;
  }[];
}

export function sortPromotions(promotions: Promotion[]): Promotion[] {
  return promotions.sort((a, b) => {
    const getDiscountValue = (promotion: Promotion, type: string, discountType: string): number => {
      for (const rule of promotion.rules) {
        if (
          (type === 'cart_items' || type === 'cart_value') &&
          (discountType === 'percentage_amount' || discountType === 'fixed_amount') &&
          rule.action[type]?.discount?.[discountType]
        ) {
          return parseFloat(rule.action[type].discount[discountType]);
        }
      }
      return -1;
    };

    const aCartItemsPercentage = getDiscountValue(a, 'cart_items', 'percentage_amount');
    const bCartItemsPercentage = getDiscountValue(b, 'cart_items', 'percentage_amount');
    if (aCartItemsPercentage !== bCartItemsPercentage) {
      return bCartItemsPercentage - aCartItemsPercentage;
    }

    const aCartValuePercentage = getDiscountValue(a, 'cart_value', 'percentage_amount');
    const bCartValuePercentage = getDiscountValue(b, 'cart_value', 'percentage_amount');
    if (aCartValuePercentage !== bCartValuePercentage) {
      return bCartValuePercentage - aCartValuePercentage;
    }

    const aCartItemsFixed = getDiscountValue(a, 'cart_items', 'fixed_amount');
    const bCartItemsFixed = getDiscountValue(b, 'cart_items', 'fixed_amount');
    if (aCartItemsFixed !== bCartItemsFixed) {
      return bCartItemsFixed - aCartItemsFixed;
    }

    const aCartValueFixed = getDiscountValue(a, 'cart_value', 'fixed_amount');
    const bCartValueFixed = getDiscountValue(b, 'cart_value', 'fixed_amount');
    return bCartValueFixed - aCartValueFixed;
  });
}

export function findApplicablePromotion(
  promotions: any[],
  productId: number,
  brandId: number,
  categoryIds: number[],
): any | null {
  const applicablePromotions = promotions.filter((promotion: any) => {
    // 1. CHECKING STRICT RULES FIRST (without "and" or "or")

    const hasNotConditions = promotion.rules.some(
      (rule: any) =>
        rule.condition?.cart &&
        rule.condition?.cart.items &&
        rule.condition?.cart.items.not &&
        rule.condition?.cart.items.not.some(
          (notRule: any) =>
            (notRule.brands && notRule.brands.includes(brandId)) ||
            (notRule.categories &&
              notRule.categories.some((category: number) => categoryIds.includes(category))) ||
            (notRule.products && notRule.products.includes(productId)),
        ),
    );
    if (hasNotConditions) return false;

    const hasConditions = promotion.rules.some(
      (rule: any) =>
        rule.condition?.cart &&
        (!rule.condition?.cart.items ||
          (rule.condition?.cart.items &&
            (!rule.condition?.cart.items.brands ||
              (rule.condition?.cart.items.brands &&
                rule.condition?.cart.items.brands.includes(brandId))) &&
            (!rule.condition?.cart.items.categories ||
              (rule.condition?.cart.items.categories &&
                rule.condition?.cart.items.categories.some((category: number) =>
                  categoryIds.includes(category),
                ))) &&
            (!rule.condition?.cart.items.products ||
              (rule.condition?.cart.items.products &&
                rule.condition?.cart.items.products.includes(productId))))),
    );
    if (!hasConditions) return false;

    // 2. CHECKING AND RULES SECOND

    // Checking if brand / category / product is in Not Brands / Categories / Products condition
    const hasAndNotConditions = promotion.rules.some(
      (rule: any) =>
        rule.condition?.cart &&
        rule.condition?.cart.items &&
        rule.condition?.cart.items.and &&
        rule.condition?.cart.items.and.some(
          (andRule: any) =>
            andRule.not &&
            ((andRule.not.brands && andRule.not.brands.includes(brandId)) ||
              (andRule.not.categories &&
                andRule.not.categories.some((category: number) =>
                  categoryIds.includes(category),
                )) ||
              (andRule.not.products && andRule.not.products.includes(productId))),
        ),
    );
    if (hasAndNotConditions) return false;

    const hasAndConditions = promotion.rules.some(
      (rule: any) =>
        rule.condition?.cart &&
        rule.condition?.cart.items &&
        (!rule.condition?.cart.items.and ||
          (rule.condition?.cart.items.and &&
            rule.condition?.cart.items.and.some(
              (andRule: any) =>
                (!andRule.brands || (andRule.brands && andRule.brands.includes(brandId))) &&
                (!andRule.categories ||
                  (andRule.categories &&
                    andRule.categories.some((category: number) =>
                      categoryIds.includes(category),
                    ))) &&
                (!andRule.products || (andRule.products && andRule.products.includes(productId))),
            ))),
    );
    if (!hasAndConditions) return false;

    return true;
  });

  return applicablePromotions && applicablePromotions.length > 0
    ? sortPromotions(applicablePromotions)[0]
    : null;
}

export function getPromotionDecoration(
  promotion: Promotion,
  free_shipping: boolean = false,
): string | null {
  let decoration: string | null = null;

  if (free_shipping) decoration = 'Free Shipping';

  const rule = promotion.rules.some(
    (rule: any) => rule.action.cart_items && rule.action.cart_items.discount,
  )
    ? promotion.rules.find((rule: any) => rule.action.cart_items && rule.action.cart_items.discount)
    : promotion.rules.find(
        (rule: any) => rule.action.cart_value && rule.action.cart_value.discount,
      );

  if (rule) {
    if (rule.action.cart_items && rule.action.cart_items.discount) {
      if (promotion.redemption_type === 'AUTOMATIC') {
        decoration =
          rule.action.cart_items.discount.percentage_amount &&
          Number(rule.action.cart_items.discount.percentage_amount) > 0
            ? `${Number(rule.action.cart_items.discount.percentage_amount)}% Off`
            : `$${Number(rule.action.cart_items.discount.percentage_amount)} Off`;
      } else if (promotion.redemption_type === 'COUPON') {
        decoration =
          rule.action.cart_items.discount.percentage_amount &&
          Number(rule.action.cart_items.discount.percentage_amount) > 0
            ? `${Number(rule.action.cart_items.discount.percentage_amount)}% Off with Code${promotion.coupons && promotion.coupons[0]?.code ? ': ' + promotion.coupons[0]?.code : ''}`
            : `$${Number(rule.action.cart_items.discount.percentage_amount)} Off with Code${promotion.coupons && promotion.coupons[0]?.code ? ': ' + promotion.coupons[0]?.code : ''}`;
      }
    } else if (rule.action.cart_value && rule.action.cart_value.discount) {
      if (promotion.redemption_type === 'AUTOMATIC') {
        decoration =
          rule.action.cart_value.discount.percentage_amount &&
          Number(rule.action.cart_value.discount.percentage_amount) > 0
            ? `${Number(rule.action.cart_value.discount.percentage_amount)}% Off in the Cart`
            : `$${Number(rule.action.cart_value.discount.percentage_amount)} Off in the Cart`;
      } else if (promotion.redemption_type === 'COUPON') {
        decoration =
          rule.action.cart_value.discount.percentage_amount &&
          Number(rule.action.cart_value.discount.percentage_amount) > 0
            ? `${Number(rule.action.cart_value.discount.percentage_amount)}% Off in the Cart with Code${promotion.coupons && promotion.coupons[0]?.code ? ': ' + promotion.coupons[0]?.code : ''}`
            : `$${Number(rule.action.cart_value.discount.percentage_amount)} Off in the Cart with Code${promotion.coupons && promotion.coupons[0]?.code ? ': ' + promotion.coupons[0]?.code : ''}`;
      }
    }
  }

  if (
    ['no tax', 'zero tax', 'notax'].some((keyword: string) =>
      promotion.name.toLowerCase().includes(keyword),
    )
  ) {
    decoration = 'We Pay the Tax';
  }

  return decoration;
}

export function Promotion({
  promotions,
  product_id,
  brand_id,
  category_ids,
  free_shipping,
}: {
  promotions: any[] | null;
  product_id: number;
  brand_id: number;
  category_ids: number[];
  free_shipping: boolean;
}) {
  //const promotion = findPromotionWithBrand(promotions, brand_id);
  const promotion = findApplicablePromotion(promotions || [], product_id, brand_id, category_ids);

  return (
    <>
      {promotion ? (
        <div className="mt-4 bg-gray-100 p-2 text-center">
          {getPromotionDecoration(promotion, free_shipping)}
        </div>
      ) : null}
    </>
  );
}

/*
Badges for PLP
Sale
Clearance
Wet rated     wet  Wet Rated
Damp rated    damp  Damp Rated
Energy star   energystar  Energy Star Certified
Dark sky  darksky  Dark Sky Friendly
Coastal/Marine grade  coastal  Coastal Quality
*/
function RatingCertifications({ data }: any) {
  const badges: {
    [key: string]: any;
  } = {
    'Wet Rated': wetBadge,
    'Damp Rated': dampBadge,
    'Energy Star Certified': energystarBadge,
    'Dark Sky Friendly': darkskyBadge,
    'Coastal Quality': coastalBadge,
  };

  const items = typeof data === 'string' ? JSON.parse(data) : Array.isArray(data) ? data : null;
  return (
    <>
      {items
        ? items
            .filter((item: any) =>
              ['Wet Rated', 'Damp Rated', 'Energy Star Certified', 'Dark Sky Friendly', 'Coastal Quality'].includes(item.label),
            )
            .map((item: any, index: number) => (
              <Image
                key={index}
                src={badges[item.label]}
                height={24}
                alt={item.label}
                title={item.label}
                className="h-7"
              />
            ))
        : null}
    </>
  );
}

function AmountUnitValue({ data }: any) {
  const value =
    typeof data === 'string' ? JSON.parse(data) : typeof data === 'object' ? data : null;
  const amount: number | null = value && value.amount ? +value.amount : null;
  const unit: string | null = value && value.unit ? value.unit.toLowerCase() : null;
  return <>{amount ? amount + (unit ? ' ' + unit : '') : null}</>;
}

function ColorSwatches({ variants, onImageClick }: any) {
  const items =
    variants && variants.length > 0
      ? variants
          .filter((item: any) => Object.hasOwn(item.options, 'Finish Color'))
          .map((item: any) => item.options['Finish Color'])
          .filter(
            (value: string, index: number, array: Array<string>) => array.indexOf(value) === index,
          )
      : null;

  const imageUrls = {} as any;

  return (
    //items && items.length > 0 &&
    <>
      <div className="mx-auto mt-4 flex h-8 items-center justify-center space-x-2">
        {items.slice(0, 5).map((item: string) => (
          <button
            key={item}
            type="button"
            title={item}
            className="h-8 w-8 cursor-auto rounded-full border border-gray-500"
            style={
              searchColorsHEX[item] && searchColorsHEX[item].indexOf('.svg') !== -1
                ? {
                    backgroundImage: `url("/swatches/${searchColorsHEX[item]}")`,
                    backgroundSize: `cover`,
                    backgroundRepeat: `no-repeat`,
                  }
                : { backgroundColor: searchColorsHEX[item] ?? 'transparent' }
            }
            onClick={() => (imageUrls[item] ? onImageClick(imageUrls[item]) : null)}
          />
        ))}
        {items.length > 5 && <span>+{items.length - 5}</span>}
      </div>
    </>
  );
}

function getDiscount(price: number, salePrice: number): number | null {
  return price > 0 ? Math.round(((price - salePrice) * 100) / price) : 0;
}

export function Hit({
  hit,
  sendEvent,
  insights,
  promotions = null,
  priceMaxRules = null,
  useDefaultPrices = false,
  price = null,
  salePrice = null,
  isLoading = false,
  isLoaded = false,
  view = 'grid',
}: HitProps) {
  const { wishlists } = useWishlists();

  const format = useFormatter();
  const currency = 'USD';

  const [imageUrl, _setImageUrl] = useState(
    hit.image_url ? hit.image_url.replace('.220.290.', '.386.513.') : null,
  );

  function setImageUrl(value: string) {
    _setImageUrl(value);
  }

  return view === 'grid' ? (
    <article
      data-id={hit.objectID}
      className="product flex h-full w-full flex-col "
    >
      <div className="flex min-h-[60px] items-start overflow-x-hidden p-4">
        <div className="compare-product mr-4 hidden md:block">
          <Compare
            id={hit.objectID}
            image={hit.image_url ? { src: hit.image_url, altText: hit.name } : noImage}
            name={hit.name}
          />
        </div>
        <div className="ml-auto flex flex-none items-center space-x-1">
          {hit.metafields &&
            hit.metafields.Details &&
            hit.metafields.Details['Ratings and Certifications'] && (
              <RatingCertifications data={hit.metafields.Details['Ratings and Certifications']} />
            )}
          {hit.on_sale && (
            <span className="flex items-center space-x-1 bg-brand-500 px-1.5 py-1 text-xs uppercase text-white">
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.87109 15.5095C6.68335 15.5095 6.49562 15.4719 6.30789 15.3969C6.12015 15.3218 5.95119 15.2091 5.801 15.0589L0.43179 9.68972C0.281602 9.53953 0.17209 9.3737 0.103254 9.19222C0.034418 9.01075 0 8.82614 0 8.63841C0 8.45067 0.034418 8.26294 0.103254 8.0752C0.17209 7.88747 0.281602 7.71851 0.43179 7.56832L7.04005 0.941286C7.17772 0.803614 7.34043 0.694102 7.52816 0.61275C7.7159 0.531399 7.90989 0.490723 8.11014 0.490723H13.4981C13.9111 0.490723 14.2647 0.637781 14.5588 0.931899C14.8529 1.22602 15 1.57958 15 1.9926V7.38058C15 7.58084 14.9625 7.7717 14.8874 7.95318C14.8123 8.13465 14.7059 8.29423 14.5682 8.4319L7.94118 15.0589C7.79099 15.2091 7.62203 15.3218 7.43429 15.3969C7.24656 15.4719 7.05882 15.5095 6.87109 15.5095ZM11.6208 4.99635C11.9337 4.99635 12.1996 4.88684 12.4186 4.66782C12.6377 4.4488 12.7472 4.18284 12.7472 3.86995C12.7472 3.55706 12.6377 3.2911 12.4186 3.07207C12.1996 2.85305 11.9337 2.74354 11.6208 2.74354C11.3079 2.74354 11.0419 2.85305 10.8229 3.07207C10.6039 3.2911 10.4944 3.55706 10.4944 3.86995C10.4944 4.18284 10.6039 4.4488 10.8229 4.66782C11.0419 4.88684 11.3079 4.99635 11.6208 4.99635Z"
                  fill="white"
                />
              </svg>
              <span className="tracking-wider">Sale</span>
            </span>
          )}
        </div>
      </div>

      <div className="px-4">
        <div className="pb-full relative mx-auto my-0 flex h-auto w-full overflow-hidden pb-[100%]">
          <figure className="absolute left-0 top-0 h-full w-full">
            <Link
              href={hit.url}
              className="flex h-full w-full items-center justify-center align-middle"
            >
              {hit.image_url ? (
                <img
                  src={imageUrl || ''}
                  alt={hit.name}
                  className="relative m-auto inline-block h-auto max-h-full w-auto max-w-full align-middle"
                />
              ) : (
                <Image
                  src={noImage}
                  alt="No Image"
                  className="relative m-auto inline-block h-auto max-h-full w-auto max-w-full align-middle"
                />
              )}
            </Link>
          </figure>

          <WishlistAddToList
            wishlists={wishlists}
            hasPreviousPage={false}
            product={{
              entityId: parseInt(hit.objectID.toString()),
              name: hit.name,
              path: hit.url,
              sku: hit.variants?.[0]?.sku || hit.sku || '',
              brand: {
                name: hit.brand_name,
                path: '',
              },
              images: [],
              mpn: '',
              variants: [
                {
                  id: hit.variants?.[0]?.id,
                  sku: hit.variants?.[0]?.sku || hit.sku || '',
                  price: {
                    value: hit.variants?.[0]?.price || hit.prices?.USD,
                    currencyCode: 'USD',
                  },
                  basePrice: {
                    value: hit.prices?.USD,
                    currencyCode: 'USD',
                  },
                  salePrice: hit.sales_prices?.USD
                    ? {
                        value: hit.sales_prices.USD,
                        currencyCode: 'USD',
                      }
                    : null,
                },
              ],
            }}
            onGuestClick={() => {
              window.location.href = '/login';
            }}
            classNames={{
              root: 'absolute bottom-2 right-2',
              button: 'inline-flex items-center justify-center rounded-full p-1.5 focus:outline-none bg-gray-100',
              icon: 'w-6 h-6',
            }}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex-1 p-4 text-center">
          <ColorSwatches variants={hit.variants} onImageClick={setImageUrl} />
          {(hit.brand_name || hit.brand) && (
            <div className="mt-2">{hit.brand_name ?? hit.brand}</div>
          )}
          <h2 className="mt-2 text-base font-medium leading-6">
            <Link href={hit.url}>
              <Highlight hit={hit} attribute="name" />
            </Link>
          </h2>

          <div className="mx-auto mt-2 flex flex-wrap items-center justify-center space-x-2">
            {!!hit.on_clearance && (
              <span className="mt-2 inline-block bg-gray-400 px-1 py-0.5 text-xs uppercase tracking-wider text-white">
                Clearance
              </span>
            )}
            <ProductPrice
              defaultPrice={hit?.prices?.USD || 0}
              defaultSalePrice={hit?.sales_prices?.USD || null}
              price={price}
              salePrice={salePrice}
              priceMaxRule={priceMaxRules?.find(
                (r: any) =>
                  (r.bc_brand_ids &&
                    (r.bc_brand_ids.includes(hit?.brand_id) ||
                      r.bc_brand_ids.includes(String(hit?.brand_id)))) ||
                  (r.skus && r.skus.includes(hit?.sku)),
              )}
              currency={currency}
              format={format}
              options={{
                useAsyncMode: useAsyncMode,
                useDefaultPrices: useDefaultPrices,
                isLoading: isLoading,
                isLoaded: isLoaded,
              }}
              classNames={{
                root: 'mt-2 flex flex-wrap items-center justify-center space-x-2 md:justify-start',
                discount: 'whitespace-nowrap font-bold text-brand-400',
              }}
            />
          </div>

          {/*
          {useAsyncMode && !useDefaultPrices ? (
            <div className="mx-auto mt-2 flex flex-wrap items-center justify-center space-x-2">
              {hit.on_clearance && (
                <span className="mt-2 inline-block bg-gray-400 px-1 py-0.5 text-xs uppercase tracking-wider text-white">
                  Clearance
                </span>
              )}

              {!isLoading && (price || salePrice) ? (
                <div className="mt-2 flex flex-wrap items-center justify-center space-x-2 md:justify-start">
                  {salePrice && salePrice > 0 ? (
                    <s className="order-1">
                      {format.number(price || 0, { style: 'currency', currency: currency })}
                    </s>
                  ) : (
                    <span className="order-1">
                      {format.number(price || 0, { style: 'currency', currency: currency })}
                    </span>
                  )}
                  {price && salePrice && salePrice > 0 ? (
                    <strong className="order-3 whitespace-nowrap font-bold text-brand-400 md:order-2">
                      Save {getDiscount(price, salePrice)}%
                    </strong>
                  ) : null}
                  {salePrice && salePrice > 0 ? (
                    <span className="order-2 md:order-3">
                      {format.number(salePrice || 0, { style: 'currency', currency: currency })}
                    </span>
                  ) : null}
                </div>
              ) : !isLoading && isLoaded ? (
                hit.prices ? (
                  <div className="mt-2 flex flex-wrap items-center justify-center space-x-2 md:justify-start">
                    {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) ||
                    hit.on_sale ? (
                      <s className="order-1">
                        {format.number(hit.prices.USD || 0, {
                          style: 'currency',
                          currency: currency,
                        })}
                      </s>
                    ) : (
                      <span className="order-1">
                        {format.number(hit.prices.USD || 0, {
                          style: 'currency',
                          currency: currency,
                        })}
                      </span>
                    )}
                    {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) ||
                    hit.on_sale ? (
                      <strong className="order-3 whitespace-nowrap font-bold text-brand-400 md:order-2">
                        Save{' '}
                        {getDiscount(
                          hit.prices.USD ?? hit.price,
                          hit.sales_prices.USD ?? hit.newPrice,
                        )}
                        %
                      </strong>
                    ) : null}
                    {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) ||
                    hit.on_sale ? (
                      <span className="order-2 md:order-3">
                        {format.number(hit.sales_prices.USD || 0, {
                          style: 'currency',
                          currency: currency,
                        })}
                      </span>
                    ) : null}
                  </div>
                ) : null
              ) : (
                'Loading...'
              )}
            </div>
          ) : hit.prices ? (
            <div className="mx-auto mt-2 flex flex-wrap items-center justify-center space-x-2">
              {hit.on_clearance && (
                <span className="mt-2 inline-block bg-gray-400 px-1 py-0.5 text-xs uppercase tracking-wider text-white">
                  Clearance
                </span>
              )}
              <div className="mt-2 flex flex-wrap items-center justify-center space-x-2 md:justify-start">
                {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) ||
                hit.on_sale ? (
                  <s className="order-1">
                    {format.number(hit.prices.USD || 0, { style: 'currency', currency: currency })}
                  </s>
                ) : (
                  <span className="order-1">
                    {format.number(hit.prices.USD || 0, { style: 'currency', currency: currency })}
                  </span>
                )}
                {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) ||
                hit.on_sale ? (
                  <strong className="order-3 whitespace-nowrap font-bold text-brand-400 md:order-2">
                    Save{' '}
                    {getDiscount(hit.prices.USD ?? hit.price, hit.sales_prices.USD ?? hit.newPrice)}
                    %
                  </strong>
                ) : null}
                {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) ||
                hit.on_sale ? (
                  <span className="order-2 md:order-3">
                    {format.number(hit.sales_prices.USD || 0, {
                      style: 'currency',
                      currency: currency,
                    })}
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}
          */}
          {hit.reviews_count > 0 && (
            <ReviewSummary
              numberOfReviews={hit.reviews_count}
              averageRating={hit.reviews_rating_sum}
              className="mx-auto mt-2 justify-center"
            />
          )}
        </div>
        <Promotion
          promotions={promotions}
          product_id={Number(hit.objectID)}
          brand_id={hit.brand_id}
          category_ids={hit.category_ids}
          free_shipping={hit.free_shipping}
        />
        <div className="compare-product flex items-center justify-center p-4 pt-2 md:hidden">
          <Compare
            id={hit.objectID}
            image={hit.image_url ? { src: hit.image_url, altText: hit.name } : noImage}
            name={hit.name}
          />
        </div>
      </div>
    </article>
  ) : view === 'list' ? (
    <article
      data-id={hit.objectID}
      className="product w-full rounded-none border border-gray-300 p-4"
    >
      <div className="tems-start flex flex-col space-x-0 space-y-4 md:flex-row md:space-x-8 md:space-y-0">
        <div className="w-full flex-none md:w-auto md:max-w-[240px] lg:max-w-[300px]">
          <div className="mb-4 mr-4 flex flex-none items-center space-x-1">
            {hit.on_sale && (
              <span className="flex items-center space-x-0.5 bg-brand-500 px-1 py-0.5 text-xs uppercase text-white">
                <svg
                  width="15"
                  height="16"
                  viewBox="0 0 15 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.87109 15.5095C6.68335 15.5095 6.49562 15.4719 6.30789 15.3969C6.12015 15.3218 5.95119 15.2091 5.801 15.0589L0.43179 9.68972C0.281602 9.53953 0.17209 9.3737 0.103254 9.19222C0.034418 9.01075 0 8.82614 0 8.63841C0 8.45067 0.034418 8.26294 0.103254 8.0752C0.17209 7.88747 0.281602 7.71851 0.43179 7.56832L7.04005 0.941286C7.17772 0.803614 7.34043 0.694102 7.52816 0.61275C7.7159 0.531399 7.90989 0.490723 8.11014 0.490723H13.4981C13.9111 0.490723 14.2647 0.637781 14.5588 0.931899C14.8529 1.22602 15 1.57958 15 1.9926V7.38058C15 7.58084 14.9625 7.7717 14.8874 7.95318C14.8123 8.13465 14.7059 8.29423 14.5682 8.4319L7.94118 15.0589C7.79099 15.2091 7.62203 15.3218 7.43429 15.3969C7.24656 15.4719 7.05882 15.5095 6.87109 15.5095ZM11.6208 4.99635C11.9337 4.99635 12.1996 4.88684 12.4186 4.66782C12.6377 4.4488 12.7472 4.18284 12.7472 3.86995C12.7472 3.55706 12.6377 3.2911 12.4186 3.07207C12.1996 2.85305 11.9337 2.74354 11.6208 2.74354C11.3079 2.74354 11.0419 2.85305 10.8229 3.07207C10.6039 3.2911 10.4944 3.55706 10.4944 3.86995C10.4944 4.18284 10.6039 4.4488 10.8229 4.66782C11.0419 4.88684 11.3079 4.99635 11.6208 4.99635Z"
                    fill="white"
                  />
                </svg>
                <span>Sale</span>
              </span>
            )}
            {hit.metafields &&
              hit.metafields.Details &&
              hit.metafields.Details['Ratings and Certifications'] && (
                <RatingCertifications data={hit.metafields.Details['Ratings and Certifications']} />
              )}
          </div>

          <div className="w-full md:h-[240px] md:max-h-[240px] md:w-[240px] lg:h-[300px] lg:max-h-[300px] lg:w-[300px]">
            <div className="md:pb-full relative mx-auto my-0 flex w-full md:h-auto md:overflow-hidden md:pb-[100%]">
              <figure className="left-0 top-0 h-full w-full md:absolute">
                <Link
                  href={hit.url}
                  className="flex h-full w-full items-center justify-center align-middle"
                >
                  {hit.image_url ? (
                    <img
                      src={imageUrl || ''}
                      alt={hit.name}
                      className="relative m-auto inline-block h-auto max-h-full w-auto max-w-full align-middle"
                    />
                  ) : (
                    <Image
                      src={noImage}
                      alt="No Image"
                      className="relative m-auto inline-block h-auto max-h-full w-auto max-w-full align-middle"
                    />
                  )}
                </Link>
              </figure>

              <WishlistAddToList
                wishlists={wishlists}
                hasPreviousPage={false}
                product={{
                  entityId: parseInt(hit.objectID.toString()),
                  name: hit.name,
                  path: hit.url,
                  sku: hit.variants?.[0]?.sku || hit.sku || '',
                  brand: {
                    name: hit.brand_name,
                    path: ''
                  },
                  images: [],
                  mpn: '',
                  variants: [
                    {
                      id: hit.variants?.[0]?.id,
                      sku: hit.variants?.[0]?.sku || hit.sku || '',
                      price: {
                        value: hit.variants?.[0]?.price || hit.prices?.USD,
                        currencyCode: 'USD',
                      },
                      basePrice: {
                        value: hit.prices?.USD,
                        currencyCode: 'USD',
                      },
                      salePrice: hit.sales_prices?.USD
                        ? {
                            value: hit.sales_prices.USD,
                            currencyCode: 'USD',
                          }
                        : null,
                    },
                  ],
                }}
                onGuestClick={() => {
                  window.location.href = '/login';
                }}
                classNames={{
                  root: 'absolute bottom-2 right-2',
                  button: 'inline-flex items-center justify-center rounded-full p-1.5 focus:outline-none bg-gray-100',
                  icon: 'w-6 h-6',
                }}
              />
            </div>
          </div>
          <ColorSwatches variants={hit.variants} onImageClick={setImageUrl} />
        </div>
        <div className="flex-1 md:!ml-4">
          {(hit.brand_name || hit.brand) && (
            <div className="mt-2">{hit.brand_name ?? hit.brand}</div>
          )}
          <h2 className="mt-2 text-base font-medium leading-6">
            <Link href={hit.url}>
              <Highlight hit={hit} attribute="name" />
            </Link>
          </h2>

          <div className="mx-auto mt-2 flex flex-wrap items-center space-x-2">
            {!!hit.on_clearance && (
              <span className="mt-2 inline-block bg-gray-400 px-1 py-0.5 text-xs uppercase tracking-wider text-white">
                Clearance
              </span>
            )}
            <ProductPrice
              defaultPrice={hit?.prices?.USD || 0}
              defaultSalePrice={hit?.sales_prices?.USD || null}
              price={price}
              salePrice={salePrice}
              priceMaxRule={priceMaxRules?.find(
                (r: any) =>
                  (r.bc_brand_ids &&
                    (r.bc_brand_ids.includes(hit?.brand_id) ||
                      r.bc_brand_ids.includes(String(hit?.brand_id)))) ||
                  (r.skus && r.skus.includes(hit?.sku)),
              )}
              currency={currency}
              format={format}
              options={{
                useAsyncMode: useAsyncMode,
                useDefaultPrices: useDefaultPrices,
                isLoading: isLoading,
                isLoaded: isLoaded,
              }}
              classNames={{
                root: 'mt-2 flex flex-wrap items-center justify-center space-x-2 md:justify-start',
                discount: 'whitespace-nowrap font-bold text-brand-400',
              }}
            />
          </div>

          {/*
          {useAsyncMode && !useDefaultPrices ? (
            <div className="mx-auto mt-2 flex flex-wrap items-center space-x-2">
              {hit.on_clearance && (
                <span className="mt-2 inline-block bg-gray-400 px-1 py-0.5 text-xs uppercase tracking-wider text-white">
                  Clearance
                </span>
              )}
              {!isLoading && (price || salePrice) ? (
                <div className="mt-2 flex flex-wrap items-center justify-center space-x-2 md:justify-start">
                  {salePrice && salePrice > 0 ? (
                    <s className="order-1">
                      {format.number(price || 0, { style: 'currency', currency: currency })}
                    </s>
                  ) : (
                    <span className="order-1">
                      {format.number(price || 0, { style: 'currency', currency: currency })}
                    </span>
                  )}
                  {price && salePrice && salePrice > 0 ? (
                    <strong className="order-3 whitespace-nowrap font-bold text-brand-400 md:order-2">
                      Save {getDiscount(price, salePrice)}%
                    </strong>
                  ) : null}
                  {salePrice && salePrice > 0 ? (
                    <span className="order-2 md:order-3">
                      {format.number(salePrice || 0, { style: 'currency', currency: currency })}
                    </span>
                  ) : null}
                </div>
              ) : !isLoading && isLoaded ? (
                hit.prices ? (
                  <div className="mt-2 flex flex-wrap items-center justify-center space-x-2 md:justify-start">
                    {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) ||
                    hit.on_sale ? (
                      <s className="order-1">
                        {format.number(hit.prices.USD || 0, {
                          style: 'currency',
                          currency: currency,
                        })}
                      </s>
                    ) : (
                      <span className="order-1">
                        {format.number(hit.prices.USD || 0, {
                          style: 'currency',
                          currency: currency,
                        })}
                      </span>
                    )}
                    {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) ||
                    hit.on_sale ? (
                      <strong className="order-3 whitespace-nowrap font-bold text-brand-400 md:order-2">
                        Save{' '}
                        {getDiscount(
                          hit.prices.USD ?? hit.price,
                          hit.sales_prices.USD ?? hit.newPrice,
                        )}
                        %
                      </strong>
                    ) : null}
                    {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) ||
                    hit.on_sale ? (
                      <span className="order-2 md:order-3">
                        {format.number(hit.sales_prices.USD || 0, {
                          style: 'currency',
                          currency: currency,
                        })}
                      </span>
                    ) : null}
                  </div>
                ) : null
              ) : (
                'Loading...'
              )}
            </div>
          ) : hit.prices ? (
            <div className="mx-auto mt-2 flex flex-wrap items-center space-x-2">
              {hit.on_clearance && (
                <span className="mt-2 inline-block bg-gray-400 px-1 py-0.5 text-xs uppercase tracking-wider text-white">
                  Clearance
                </span>
              )}
              <div className="mt-2 flex flex-wrap items-center justify-center space-x-2 md:justify-start">
                {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) ||
                hit.on_sale ? (
                  <s className="order-1">
                    {format.number(hit.prices.USD || 0, { style: 'currency', currency: currency })}
                  </s>
                ) : (
                  <span className="order-1">
                    {format.number(hit.prices.USD || 0, { style: 'currency', currency: currency })}
                  </span>
                )}
                {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) ||
                hit.on_sale ? (
                  <strong className="order-3 whitespace-nowrap font-bold text-brand-400 md:order-2">
                    Save{' '}
                    {getDiscount(hit.prices.USD ?? hit.price, hit.sales_prices.USD ?? hit.newPrice)}
                    %
                  </strong>
                ) : null}
                {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) ||
                hit.on_sale ? (
                  <span className="order-2 md:order-3">
                    {format.number(hit.sales_prices.USD || 0, {
                      style: 'currency',
                      currency: currency,
                    })}
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}
          */}
          {hit.reviews_count > 0 && (
            <ReviewSummary
              numberOfReviews={hit.reviews_count}
              averageRating={hit.reviews_rating_sum}
              className="mt-2"
            />
          )}
          <Promotion
            promotions={promotions}
            product_id={Number(hit.objectID)}
            brand_id={hit.brand_id}
            category_ids={hit.category_ids}
            free_shipping={hit.free_shipping}
          />
        </div>
        <div className="flex-1 bg-gray-50 px-8 py-4">
          <div className="flex flex-row items-center md:flex-col md:items-start lg:flex-row lg:items-center">
            <div className="compare-product order-2 ml-auto flex flex-none md:order-1 lg:order-2">
              <Compare
                id={hit.objectID}
                image={hit.image_url ? { src: hit.image_url, altText: hit.name } : noImage}
                name={hit.name}
              />
            </div>
            {hit.description && (
              <h3 className="order-1 mr-4 mt-0 whitespace-nowrap text-lg font-medium md:order-2 md:mt-4 lg:order-1 lg:mt-0">
                Product Overview
              </h3>
            )}
          </div>
          {hit.metafields && 
            hit.metafields.Details && 
            (Object.keys(hit.metafields.Details).filter(key => ['Depth', 'Height', 'Length', 'Width', 'Minimum Mounting Height', 'Fuel Source', 'Heating Area', 'Wattage', 'Number of Bulbs', 'Lift', 'Lamp Base Type', 'Voltage'].includes(key)).length > 2 
              || !hit.description 
              || hit.description.length == 0
            ) ? (
            <div className="product-details mt-2 leading-6">
              <ul>
                {hit.metafields.Details.Depth ? (
                  <li><span className="label">Depth: </span><AmountUnitValue data={hit.metafields.Details.Depth} /></li>
                ) : null}
                {hit.metafields.Details.Height ? (
                  <li><span className="label">Height: </span><AmountUnitValue data={hit.metafields.Details.Height} /></li>
                ) : null}
                {hit.metafields.Details.Length ? (
                  <li><span className="label">Length: </span><AmountUnitValue data={hit.metafields.Details.Length} /></li>
                ) : null}
                {hit.metafields.Details.Width ? (
                  <li><span className="label">Width/Diameter: </span><AmountUnitValue data={hit.metafields.Details.Width} /></li>
                ) : null}
                {hit.metafields.Details['Minimum Mounting Height'] ? (
                  <li><span className="label">Min. Mounting Height: </span>{hit.metafields.Details['Minimum Mounting Height']}</li>
                ) : null}
                {hit.metafields.Details['Fuel Source'] ? (
                  <li><span className="label">Fuel Source: </span>{hit.metafields.Details['Fuel Source']}</li>
                ) : null}
                {hit.metafields.Details['Heating Area'] ? (
                  <li><span className="label">Heating Area: </span>{hit.metafields.Details['Heating Area']}</li>
                ) : null}
                {hit.metafields.Details.Wattage ? (
                  <li><span className="label">Wattage: </span><AmountUnitValue data={hit.metafields.Details.Wattage} /></li>
                ) : null}
                {hit.metafields.Details['Number of Bulbs'] ? (
                  <li><span className="label">Number of Lights: </span>{hit.metafields.Details['Number of Bulbs']}</li>
                ) : null}
                {hit.metafields.Details.Lift ? (
                  <li><span className="label">Lift: </span>{hit.metafields.Details.Lift}</li>
                ) : null}
                {hit.metafields.Details['Lamp Base Type'] ? (
                  <li><span className="label">Lamp Type: </span>{hit.metafields.Details['Lamp Base Type']}</li>
                ) : null}
                {hit.metafields.Details.Voltage ? (
                  <li><span className="label">Voltage: </span><AmountUnitValue data={hit.metafields.Details.Voltage} /></li>
                ) : null}
              </ul>
            </div>
          ) : (
            !!hit.description && (
              <div
                className="product-details mt-2 leading-6"
                dangerouslySetInnerHTML={{ __html: hit.description }}
              ></div>
            )
          )}
          <div className="mt-4 md:flex md:space-x-2">
            <Link
              href={hit.url}
              className="flex h-10 w-full cursor-pointer items-center justify-center rounded border border-brand-600 bg-brand-600 px-4 text-center uppercase text-white hover:border-brand-400 hover:bg-brand-400 md:w-auto md:flex-1"
            >
              View Details
            </Link>
            {/*
          <button type="button" className="mt-1 md:mt-0 md:flex-1 flex w-full md:w-auto uppercase px-4 h-10 bg-cyan-700 text-white rounded border border-cyan-700 cursor-pointer items-center justify-center" onClick={() =>
            sendEvent("conversion", hit, "Added To Cart", {
              // Special subtype
              eventSubtype: "addToCart",
              // An array of objects representing each item added to the cart
              objectData: [
                {
                  // The discount value for this item, if applicable
                  discount: 0,
                  // The price value for this item (minus the discount)
                  price: hit.prices.USD,
                  // How many of this item were added
                  quantity: 1,
                },
              ],
              // The total value of all items
              value: hit.prices.USD,
              // The currency code
              currency: "USD",
            })}>Add To Cart</button>
          */}
          </div>
        </div>
      </div>
    </article>
  ) : (
    <></>
  );
}
