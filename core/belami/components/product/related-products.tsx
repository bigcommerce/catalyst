'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import noImage from '~/public/no-image.svg';
import {
  Carousel,
  CarouselButtons,
  CarouselContent,
  CarouselItem,
  CarouselScrollbar,
} from '~/belami/components/carousel';
import { useFormatter } from 'next-intl';
import { ProductPrice } from '~/belami/components/search/product-price';
import { ReviewSummary } from '~/belami/components/reviews';
import searchColors from '~/belami/include/search-colors.json';
import QuickView from '~/components/product-card/Quickview';

type DynamicObject = {
  [key: string]: string;
};

const searchColorsHEX: DynamicObject = searchColors;
const useAsyncMode = process.env.NEXT_PUBLIC_USE_ASYNC_MODE === 'true';

interface Props {
  productId: number;
  products: any[];
  useDefaultPrices?: boolean;
  priceMaxRules?: any;
  dropdownSheetIcon?: string;
  cartHeader?: string;
  couponIcon?: string;
  paywithGoogle?: string;
  payPal?: string;
  requestQuote?: string;
  closeIcon?: string;
  blankAddImg?: string;
  bannerIcon?: string;
  galleryExpandIcon?: string;
  getAllCommonSettinngsValues?: any;
  productImages?: any[];
}

function getDiscount(price: number, sale: number): number | null {
  return price > 0 ? Math.round(((price - sale) * 100) / price) : 0;
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
  const items2 =
    items && items.length > 0
      ? variants
          .filter(
            (item: any) =>
              item.image_url &&
              item.image_url.length > 0 &&
              Object.hasOwn(item.options, 'Finish Color'),
          )
          .map((item: any) => {
            imageUrls[item.options['Finish Color']] = item.image_url.replace(
              '.220.290.',
              '.386.513.',
            );
          })
      : null;

  return (
    <div className="mx-auto mt-4 flex h-8 items-center justify-center space-x-2">
      {items &&
        items.slice(0, 5).map((item: string) => (
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
      {items && items.length > 5 && <span>+{items.length - 5}</span>}
    </div>
  );
}

function CustomItem({
  hit,
  priceMaxRules = null,
  useDefaultPrices = false,
  price = null,
  salePrice = null,
  isLoading = false,
  isLoaded = false,
  dropdownSheetIcon,
  cartHeader,
  couponIcon,
  paywithGoogle,
  payPal,
  requestQuote,
  closeIcon,
  blankAddImg,
  bannerIcon,
  galleryExpandIcon,
  getAllCommonSettinngsValues,
  productImages,
}: any) {
  const format = useFormatter();
  const currency = 'USD';
  const [imageUrl, _setImageUrl] = useState(
    hit.image_url ? hit.image_url.replace('.220.290.', '.386.513.') : null,
  );

  function setImageUrl(value: string) {
    _setImageUrl(value);
  }

  return (
    <article className="product flex h-full w-full flex-col rounded-none border border-gray-300">
      <div className="px-4 pt-4">
        <div className="pb-full relative mx-auto my-0 flex h-auto w-full overflow-hidden pb-[100%]">
          <figure className="absolute left-0 top-0 h-full w-full">
            <Link
              href={hit.url}
              className="flex h-full w-full items-center justify-center bg-white align-middle"
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
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex-1 p-4 text-center">
          <ColorSwatches variants={hit.variants} onImageClick={setImageUrl} />
          <h2 className="mt-2 text-lg font-medium">
            <Link href={hit.url}>{hit.name}</Link>
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
                discount: 'font-bold text-brand-400 whitespace-nowrap',
              }}
            />
          </div>

          {hit.reviews_count > 0 && (
            <ReviewSummary
              numberOfReviews={hit.reviews_count}
              averageRating={hit.reviews_rating_sum}
              className="mx-auto mt-2 justify-center"
            />
          )}
        </div>
        <div className="mt-4 hidden p-4 lg:block">
          <QuickView
            product={{
              ...hit,
              dropdownSheetIcon,
              cartHeader,
              couponIcon,
              paywithGoogle,
              payPal,
              requestQuote,
              closeIcon,
              blankAddImg,
              bannerIcon,
              galleryExpandIcon,
              getAllCommonSettinngsValues,
              productImages,
            }}
          />
        </div>
      </div>
    </article>
  );
}

export function RelatedProducts({
  products,
  useDefaultPrices = false,
  priceMaxRules,
  dropdownSheetIcon,
  cartHeader,
  couponIcon,
  paywithGoogle,
  payPal,
  requestQuote,
  closeIcon,
  blankAddImg,
  bannerIcon,
  galleryExpandIcon,
  getAllCommonSettinngsValues,
  productImages,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [prices, setPrices] = useState({} as any);
  const [cachedPrices, setCachedPrices] = useState({} as any);

  const skus: string[] = products.map((hit: any) => hit.sku);

  useEffect(() => {
    (async () => {
      if (!useDefaultPrices && !isLoading) {
        if (!cachedPrices[skus.join(',')]) {
          try {
            setIsLoaded(false);
            setIsLoading(true);
            const response = await fetch('/api/prices/?skus=' + skus.join(','));
            const data = await response.json();
            setCachedPrices({
              ...cachedPrices,
              [skus.join(',')]: data.data,
            });
            setPrices(data.data);
            setIsLoading(false);
            setIsLoaded(true);
          } catch (error) {
            setIsLoading(false);
            setIsLoaded(true);
            console.error('Error fetching pricing data: ', error);
          }
        } else {
          setPrices(cachedPrices[skus.join(',')]);
          setIsLoading(false);
          setIsLoaded(true);
        }
      }
    })();
  }, [skus, useDefaultPrices, isLoading, cachedPrices]);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="flex items-center space-x-2 text-left text-3xl font-normal leading-[2rem] text-[#353535]">
        <span className="brightness-0 xl:brightness-[1]">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-brand-500"
          >
            <g>
              <path
                d="M0.974976 7.0001C0.974976 5.33343 1.56248 3.9126 2.73748 2.7376C3.91248 1.5626 5.33331 0.975098 6.99998 0.975098V3.0001C5.89998 3.0001 4.95831 3.39176 4.17498 4.1751C3.39164 4.95843 2.99998 5.9001 2.99998 7.0001H0.974976ZM5.29998 18.7251C3.78331 17.2084 3.02498 15.3834 3.02498 13.2501C3.02498 11.1168 3.78331 9.29176 5.29998 7.7751L7.04998 6.0001L7.34998 6.3001C7.83331 6.78343 8.07498 7.37093 8.07498 8.0626C8.07498 8.75426 7.83331 9.34176 7.34998 9.8251L6.99998 10.1751C6.79998 10.3751 6.69998 10.6126 6.69998 10.8876C6.69998 11.1626 6.79998 11.4001 6.99998 11.6001L7.89998 12.5001C8.33331 12.9334 8.54998 13.4584 8.54998 14.0751C8.54998 14.6918 8.33331 15.2168 7.89998 15.6501L8.97498 16.7251C9.70831 15.9918 10.075 15.1126 10.075 14.0876C10.075 13.0626 9.69998 12.1751 8.94998 11.4251L8.39998 10.8751C8.83331 10.4418 9.14164 9.95426 9.32498 9.4126C9.50831 8.87093 9.58331 8.31676 9.54998 7.7501L14.025 3.2751C14.225 3.0751 14.4625 2.9751 14.7375 2.9751C15.0125 2.9751 15.25 3.0751 15.45 3.2751C15.65 3.4751 15.75 3.7126 15.75 3.9876C15.75 4.2626 15.65 4.5001 15.45 4.7001L10.775 9.3751L11.825 10.4251L17.85 4.4251C18.05 4.2251 18.2833 4.1251 18.55 4.1251C18.8166 4.1251 19.05 4.2251 19.25 4.4251C19.45 4.6251 19.55 4.85843 19.55 5.1251C19.55 5.39176 19.45 5.6251 19.25 5.8251L13.25 11.8501L14.3 12.9001L19.6 7.6001C19.8 7.4001 20.0375 7.3001 20.3125 7.3001C20.5875 7.3001 20.825 7.4001 21.025 7.6001C21.225 7.8001 21.325 8.0376 21.325 8.3126C21.325 8.5876 21.225 8.8251 21.025 9.0251L15.725 14.3251L16.775 15.3751L20.825 11.3251C21.025 11.1251 21.2625 11.0251 21.5375 11.0251C21.8125 11.0251 22.05 11.1251 22.25 11.3251C22.45 11.5251 22.55 11.7626 22.55 12.0376C22.55 12.3126 22.45 12.5501 22.25 12.7501L16.25 18.7251C14.7333 20.2418 12.9083 21.0001 10.775 21.0001C8.64164 21.0001 6.81664 20.2418 5.29998 18.7251ZM17 23.0251V21.0001C18.1 21.0001 19.0416 20.6084 19.825 19.8251C20.6083 19.0418 21 18.1001 21 17.0001H23.025C23.025 18.6668 22.4375 20.0876 21.2625 21.2626C20.0875 22.4376 18.6666 23.0251 17 23.0251Z"
                fill="currentColor"
              ></path>
            </g>
          </svg>
        </span>
        <span>You May Also Like ...</span>
      </h2>
      <Carousel className="mb-10 mt-5 overflow-x-hidden lg:mt-6">
        <CarouselContent className="mb-10">
          {products.map((item: any) => (
            <CarouselItem
              className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5"
              key={item.objectID}
            >
              <CustomItem
                hit={item}
                useDefaultPrices={useDefaultPrices}
                price={prices[item.sku]?.price ?? null}
                salePrice={prices[item.sku]?.salePrice ?? null}
                isLoading={isLoading}
                isLoaded={isLoaded}
                priceMaxRules={priceMaxRules}
                dropdownSheetIcon={dropdownSheetIcon}
                cartHeader={cartHeader}
                couponIcon={couponIcon}
                paywithGoogle={paywithGoogle}
                payPal={payPal}
                requestQuote={requestQuote}
                closeIcon={closeIcon}
                blankAddImg={blankAddImg}
                bannerIcon={bannerIcon}
                galleryExpandIcon={galleryExpandIcon}
                getAllCommonSettinngsValues={getAllCommonSettinngsValues}
                productImages={productImages}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselScrollbar className="carousel-scrollbar" />
        <CarouselButtons className="carousel-arrows" />
      </Carousel>
    </div>
  );
}
