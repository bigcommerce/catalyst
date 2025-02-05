'use client';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { useFormatter, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PricingFragment } from '~/client/fragments/pricing';
import { ProductItemFragment } from '~/client/fragments/product-item';
import { FragmentOf, graphql } from '~/client/graphql';
import CertificationsAndRatings from '~/components/ui/pdp/belami-certification-rating-pdp';
import { PayPalPayLater } from '~/components/ui/pdp/belami-payment-pdp';
import { RequestQuote } from '~/components/ui/pdp/belami-request-a-quote-pdp';
import { imageManagerImageUrl } from '~/lib/store-assets';
import { FreeDelivery } from './belami-product-free-shipping-pdp';
import { ProductForm } from './product-form';
import { ProductFormFragment } from './product-form/fragment';
import { ProductSchema, ProductSchemaFragment } from './product-schema';
import { ReviewSummary, ReviewSummaryFragment } from './review-summary';
import { Coupon } from './belami-product-coupon-pdp';
import { BcImage } from '~/components/bc-image';
import ProductDetailDropdown from '~/components/ui/pdp/belami-product-details-pdp';
import { useCommonContext } from '~/components/common-context/common-provider';
import Link from 'next/link';
import { store_pdp_product_in_localstorage } from '../../../sales-buddy/common-components/common-functions';
import addToCart from '~/public/add-to-cart/addToCart.svg';
import Image from 'next/image';
import { NoShipCanada } from './belami-product-no-shipping-canada';
import { Flyout } from '~/components/common-flyout';
import { ProductPrice } from '~/belami/components/search/product-price';

interface ProductOptionValue {
  entityId: number;
  label: string;
  isDefault: boolean;
}

interface MultipleChoiceOption {
  __typename: 'MultipleChoiceOption';
  entityId: number;
  displayName: string;
  values: {
    edges: Array<{
      node: ProductOptionValue;
    }>;
  };
}

interface Props {
  product: FragmentOf<typeof DetailsFragment> & { parent: any; UpdatePriceForMSRP: any };
  collectionValue?: string;
  dropdownSheetIcon?: string;
  cartHeader?: string;
  couponIcon?: string;
  paywithGoogle?: string;
  payPal?: string;
  requestQuote?: string;
  closeIcon?: string;
  blankAddImg?: string;
  productImages?: string;
  triggerLabel1: React.ReactNode;
  children1: React.ReactNode;
  triggerLabel2: React.ReactNode;
  children2: React.ReactNode;
  triggerLabel3: React.ReactNode;
  children3: React.ReactNode;
  triggerLabel4: React.ReactNode;
  children4: React.ReactNode;
  triggerLabel5: React.ReactNode;
  children5: React.ReactNode;
  priceMaxRules: any;
  getAllCommonSettinngsValues:any;
  customerGroupDetails:any;
}

export const DetailsFragment = graphql(
  `
    fragment DetailsFragment on Product {
      ...ReviewSummaryFragment
      ...ProductSchemaFragment
      ...ProductFormFragment
      ...ProductItemFragment
      entityId
      name
      sku
      mpn
      upc
      minPurchaseQuantity
      maxPurchaseQuantity
      defaultImage {
        url(width: 64)
        altText
      }
      images {
        edges {
          node {
            url(width: 64)
            altText
            isDefault
          }
        }
      }
      variants {
        edges {
          node {
            entityId
            defaultImage {
              url(width: 64)
              altText
            }
          }
        }
      }
      condition
      weight {
        value
        unit
      }
      availabilityV2 {
        description
      }
      customFields {
        edges {
          node {
            entityId
            name
            value
          }
        }
      }
      brand {
        name
        path
        entityId
        id
      }
      ...PricingFragment
    }
  `,
  [
    ReviewSummaryFragment,
    ProductSchemaFragment,
    ProductFormFragment,
    ProductItemFragment,
    PricingFragment,
  ],
);

export const Details = ({
  product,
  collectionValue,
  dropdownSheetIcon,
  couponIcon,
  requestQuote,
  closeIcon,
  blankAddImg,
  productImages,
  getAllCommonSettinngsValues,
  triggerLabel1,
  triggerLabel2,
  children1,
  children2,
  triggerLabel3,
  children3,
  customerGroupDetails,
  triggerLabel4,
  children4,
  triggerLabel5,
  children5,
  priceMaxRules
}: Props) => {
  const t = useTranslations('Product.Details');
  const format = useFormatter();
  const productFormRef = useRef<HTMLDivElement>(null);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(product.defaultImage?.url || '');
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const searchParams = useSearchParams();
  const { currentMainMedia } = useCommonContext();

  const customFields = removeEdgesAndNodes(product.customFields);
  const productOptions = removeEdgesAndNodes(product.productOptions);
  const variants = removeEdgesAndNodes(product.variants);
  const fanPopup = imageManagerImageUrl('grey-image.png', '150w');
  const certificationIcon = imageManagerImageUrl('vector-7-.png', '20w');
  const multipleOptionIcon = imageManagerImageUrl('vector-5-.png', '20w');
  const productSku = product.sku;
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);

  const showPriceRange =
    product.prices?.priceRange?.min?.value !== product.prices?.priceRange?.max?.value;

  // Inside your Details component:

  useEffect(() => {
    // 1. Handle scroll behavior
    const handleScroll = () => {
      setShowStickyHeader(window.scrollY > 1500);
    };

    const handleCustomScroll = (e) => {
      setShowStickyHeader(e.detail.scrollY > 1500);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('customScroll', handleCustomScroll);

    // 2. Handle variant selection
    const matchingVariant = variants.find((variant) => variant?.sku === productSku);
    if (matchingVariant) {
      setSelectedVariantId(matchingVariant.entityId);
    } else {
      setSelectedVariantId(null);
    }

    // 3. Update image from variant
    const updateImageFromVariant = () => {
      if (currentMainMedia?.type === 'image' && currentMainMedia.src) {
        setCurrentImageUrl(currentMainMedia.src);
        return;
      }

      const selectedOptionIds = productOptions
        .filter((option) => option.__typename === 'MultipleChoiceOption')
        .map((option) => searchParams.get(String(option.entityId)))
        .filter(Boolean);

      if (selectedOptionIds.length > 0) {
        const selectedVariant = variants.find((variant) =>
          selectedOptionIds.includes(String(variant.entityId)),
        );
        if (selectedVariant) {
          setSelectedVariantId(selectedVariant.entityId);
          if (selectedVariant?.defaultImage?.url) {
            setCurrentImageUrl(selectedVariant.defaultImage.url);
            return;
          }
        }
      }

      setCurrentImageUrl(product.defaultImage?.url || '');
    };
    updateImageFromVariant();

    // 4. Store product in localStorage
    store_pdp_product_in_localstorage(product);

    // Cleanup function for event listeners
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('customScroll', handleCustomScroll);
    };
  }, [
    // Dependencies for all effects
    variants,
    productSku,
    searchParams,
    product,
    productOptions,
    currentMainMedia,
  ]);

  const productAvailability = product.availabilityV2.status;

  const getSelectedValue = (option: MultipleChoiceOption): string => {
    const selectedId = searchParams.get(String(option.entityId));
    if (selectedId) {
      const values = removeEdgesAndNodes(option.values);
      const selected = values.find((value) => String(value.entityId) === selectedId);
      if (selected) {
        return selected.label;
      }
    }

    const values = removeEdgesAndNodes(option.values);
    const defaultValue = values.find((value) => value.isDefault);
    return defaultValue?.label || 'Select';
  };
  return (
    <div className="">
      {showStickyHeader && (
        <>
          <div className="fixed left-0 right-0 top-0 z-50 hidden border-b border-gray-200 bg-white shadow-2xl xl:block">
            <div className="container mx-auto px-[3rem] pb-[2rem] pt-[1rem]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 overflow-hidden rounded-md border border-gray-200 xl:h-[10em] xl:w-[10em] 2xl:h-[8em] 2xl:w-[8em]">
                    <BcImage
                      src={currentImageUrl}
                      alt={product.name}
                      width={100}
                      height={100}
                      className="h-full w-full object-center"
                    />
                  </div>
                  <div className="mr-[1em] flex-1">
                    <h2 className="text-left text-[20px] font-medium leading-8 tracking-wide text-[#353535]">
                      {product.name}
                    </h2>

                    <div className="mt-3 text-left text-[14px] font-normal leading-[10px] tracking-[0.25px] text-[#353535]">
                      by{' '}
                      <Link href={product.brand?.path ?? ''} className="text-[#353535] underline">
                        {product.brand?.name}
                      </Link>
                    </div>

                    <div className="mt-3 block flex-wrap items-center text-[#7F7F7F]">
                      {product.mpn && (
                        <span className="text-[14px] font-bold leading-[24px] tracking-[0.25px]">
                          SKU: {product.mpn}
                        </span>
                      )}

                      {product.mpn &&
                        productOptions.filter(
                          (option) => option.__typename === 'MultipleChoiceOption',
                        ).length > 0 && <span className="mx-1 text-[14px] font-normal">|</span>}
                      {productOptions.filter(
                        (option) => option.__typename === 'MultipleChoiceOption',
                      ).length > 0 && (
                        <div className="inline text-[14px] font-normal">
                          {productOptions
                            .filter((option) => option.__typename === 'MultipleChoiceOption')
                            .map((option, index, filteredArray) => {
                              if (option.__typename === 'MultipleChoiceOption') {
                                const selectedValue = getSelectedValue(
                                  option as MultipleChoiceOption,
                                );
                                return (
                                  <span key={option.entityId}>
                                    <span className="font-bold">{option.displayName}:</span>
                                    <span className="text-[15px]"> {selectedValue}</span>
                                    {index < filteredArray.length - 1 && (
                                      <span className="mx-1">|</span>
                                    )}
                                  </span>
                                );
                              }
                              return null;
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {product?.UpdatePriceForMSRP && (
                    <ProductPrice
                      defaultPrice={product.UpdatePriceForMSRP.originalPrice || 0}
                      defaultSalePrice={
                        product?.UpdatePriceForMSRP.hasDiscount
                          ? product.UpdatePriceForMSRP.updatedPrice
                          : null
                      }
                      priceMaxRule={priceMaxRules?.find(
                        (r: any) =>
                          (r.bc_brand_ids &&
                            (r.bc_brand_ids.includes(product?.brand?.entityId) ||
                              r.bc_brand_ids.includes(String(product?.brand?.entityId)))) ||
                          (r.skus && r.skus.includes(product?.parent?.sku)),
                      )}
                      currency={product.UpdatePriceForMSRP.currencyCode?.currencyCode || 'USD'}
                      format={format}
                      showMSRP={product.UpdatePriceForMSRP.showDecoration}
                      options={{
                        useAsyncMode: false,
                        useDefaultPrices: true,
                      }}
                      classNames={{
                        root: 'sticky-product-price mt-2 !w-[16em] items-center whitespace-nowrap text-center lg:text-right',
                        newPrice:
                          'price-1 mr-2 text-left text-[20px] font-medium leading-8 tracking-[0.15px] text-brand-400',
                        oldPrice:
                          'mr-2 text-left text-[16px] font-medium leading-8 tracking-[0.15px] text-gray-600 line-through',
                        discount:
                          'whitespace-nowrap mr-2 text-left text-[16px] font-normal leading-8 tracking-[0.15px] text-brand-400',
                        price:
                          'text-left text-[20px] font-medium leading-8 tracking-[0.15px] text-brand-400',
                        msrp: '-ml-[0.5em] mb-1 mr-2 text-left text-[12px] text-gray-500',
                      }}
                    />
                  )}
                  
                  {productAvailability === 'Unavailable' ? (
                    <div className="flex flex-col items-center">
                      <button
                        id="add-to-cart"
                        className="group relative flex h-[3.5em] w-full items-center justify-center overflow-hidden rounded-[4px] !bg-[#b1b9bc] text-center text-[14px] font-medium uppercase leading-[32px] tracking-[1.25px] text-[#353535] transition-all duration-300 hover:bg-[#03465c]/90 disabled:opacity-50"
                        disabled
                      >
                        <span>ADD TO CART</span>
                      </button>
                      <p className="text-center text-[12px] text-[#2e2e2e]">
                        This product is currently unavailable
                      </p>
                    </div>
                  ) : (
                    <button
                      className="group relative flex h-[3em] w-[14em] items-center justify-center overflow-hidden bg-[#03465C] text-center text-[14px] font-medium uppercase leading-[32px] tracking-[1.25px] text-white transition-all duration-300 hover:bg-[#03465C]/90"
                      onClick={() => {
                        const addToCartButton = productFormRef.current?.querySelector(
                          'button[type="submit"]',
                        ) as HTMLButtonElement | null;
                        if (addToCartButton) {
                          addToCartButton.click();
                        }
                      }}
                    >
                      <span className="transition-transform duration-300 group-hover:-translate-x-2">
                        ADD TO CART
                      </span>
                      <div className="absolute right-0 flex h-full w-0 items-center justify-center bg-[#006380] transition-all duration-300 group-hover:w-[2.5em]">
                        <Image
                          src={addToCart}
                          className=""
                          alt="Add to Cart"
                          unoptimized={true}
                          width={44}
                          height={44}
                        />
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div
            className={`fixed bottom-0 left-0 right-0 z-50 block w-full border-t border-gray-200 bg-white transition-all duration-300 xl:hidden ${
              isScrollingUp ? 'pb-[40px] md:pb-[20px]' : 'pb-[20px] md:pb-[20px]'
            } px-[20px] pt-[20px]`}
          >
            {/* Mobile View Button */}
            {productAvailability === 'Unavailable' ? (
              <div className="flex flex-col items-center">
                <button
                  id="add-to-cart"
                  className="group relative flex h-[3.5em] w-full items-center justify-center overflow-hidden rounded-[4px] !bg-[#b1b9bc] text-center text-[14px] font-medium uppercase leading-[32px] tracking-[1.25px] text-[#353535] transition-all duration-300 hover:bg-[#03465c]/90 disabled:opacity-50"
                  disabled
                >
                  <span>ADD TO CART</span>
                </button>
                <p className="text-center text-[12px] text-[#2e2e2e]">
                  This product is currently unavailable
                </p>
              </div>
            ) : (
              <button
                className="group relative flex h-[3em] w-full items-center justify-center overflow-hidden bg-[#03465C] text-center text-[14px] font-medium uppercase leading-[32px] tracking-[1.25px] text-white"
                onClick={() => {
                  const addToCartButton = productFormRef.current?.querySelector(
                    'button[type="submit"]',
                  ) as HTMLButtonElement | null;
                  if (addToCartButton) {
                    addToCartButton.click();
                  }
                }}
              >
                <span className="transition-transform duration-300 group-hover:-translate-x-2">
                  ADD TO CART
                </span>
                <div className="absolute right-0 flex h-full w-0 items-center justify-center bg-[#006380] transition-all duration-300 group-hover:w-12">
                  <Image
                    src={addToCart}
                    className=""
                    alt="Add to Cart"
                    unoptimized={true}
                    width={44}
                    height={44}
                  />
                </div>
              </button>
            )}
          </div>
        </>
      )}

      <div className="main-div-product-details mb-[35px] xl:mb-[0px]">
        <div className="div-product-details mt-[30px] xl:mt-[0px]">
          {/* Add relative positioning wrapper */}
          <div className="relative">
            <h1 className="product-name mb-3 text-center text-[24px] font-medium leading-[2rem] tracking-[0.15px] text-[#353535] sm:text-center md:mt-6 lg:mt-0 xl:mt-0 xl:text-left xl:text-[1.5rem] xl:font-normal xl:leading-[2rem]">
              {product.name}
            </h1>
          </div>

          <div className="items-center space-x-1 text-center xl:text-left">
            <span className="OpenSans text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.25px] text-[#353535] lg:text-left xl:text-[0.875rem] xl:leading-[1.5rem] xl:tracking-[0.25px]">
              SKU: <span>{product.mpn}</span>
            </span>
            <span className="OpenSans text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.25px] text-[#353535] lg:text-left xl:text-[0.875rem] xl:leading-[1.5rem] xl:tracking-[0.25px]">
              by{' '}
              <Link
                href={product.brand?.path ?? ''}
                className="products-underline border-b border-black"
              >
                {product.brand?.name}
              </Link>
            </span>
            {collectionValue && (
              <span className="product-collection OpenSans text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.25px] text-[#353535] lg:text-left xl:text-[0.875rem] xl:leading-[1.5rem] xl:tracking-[0.25px]">
                from the{' '}
                <Link
                  href={`/search?brand_name[0]=${encodeURIComponent(
                    product.brand?.name ?? '',
                  )}&collection[0]=${encodeURIComponent(collectionValue)}`}
                  className="products-underline border-b border-black"
                >
                  {collectionValue}
                </Link>{' '}
                Family
              </span>
            )}
          </div>
          <ReviewSummary data={product} />
        </div>
        
        {product?.UpdatePriceForMSRP && (
          <ProductPrice
            defaultPrice={product.UpdatePriceForMSRP.originalPrice || 0}
            defaultSalePrice={
              product?.UpdatePriceForMSRP.hasDiscount
                ? product.UpdatePriceForMSRP.updatedPrice
                : null
            }
            priceMaxRule={priceMaxRules?.find(
              (r: any) =>
                (r.bc_brand_ids &&
                  (r.bc_brand_ids.includes(product?.brand?.entityId) ||
                    r.bc_brand_ids.includes(String(product?.brand?.entityId)))) ||
                (r.skus && r.skus.includes(product?.parent?.sku)),
            )}
            currency={product.UpdatePriceForMSRP.currencyCode?.currencyCode || 'USD'}
            format={format}
            showMSRP={product.UpdatePriceForMSRP.showDecoration}
            options={{
              useAsyncMode: false,
              useDefaultPrices: true,
            }}
            classNames={{
              root: 'product-price mt-2 flex items-center gap-[0.5em] text-center xl:text-left',
              newPrice:
                'text-left text-[20px] font-medium leading-8 tracking-[0.15px] text-brand-400',
              oldPrice:
                'inline-flex items-baseline text-left text-[16px] font-medium leading-8 tracking-[0.15px] text-gray-600 line-through sm:mr-0',
              discount:
                'whitespace-nowrap text-left text-[16px] font-normal leading-8 tracking-[0.15px] text-brand-400',
              price: 'text-left text-[20px] font-medium leading-8 tracking-[0.15px] text-brand-400',
              msrp: '-ml-[0.5em] mb-1 text-[12px] text-gray-500'
            }} />
          )}
          <Coupon couponIcon={couponIcon} />

          <div className="free-shipping-detail mb-[25px] mt-[10px] text-center xl:text-left">
              <span> Free Delivery</span>
            {selectedVariantId && (
              <FreeDelivery
                entityId={product.entityId}
                variantId={selectedVariantId}
                isFromPDP={true}
              />
            )}
            {product?.brand?.entityId && getAllCommonSettinngsValues.hasOwnProperty(product?.brand?.entityId) &&
              getAllCommonSettinngsValues?.[product?.brand?.entityId]?.no_ship_canada && (
                <NoShipCanada
                description={getAllCommonSettinngsValues?.[product?.brand?.entityId]?.no_ship_canada_message}
                />
              )}
          </div>
          <div ref={productFormRef}>
            <ProductForm
              data={product}
              productMpn={product.mpn || ''}
              multipleOptionIcon={multipleOptionIcon}
              blankAddImg={blankAddImg || ''}
              productImages={productImages}
              fanPopup={fanPopup}
              closeIcon={closeIcon}
              customerGroupDetails={customerGroupDetails}
            />
          </div>

        <div className="div-product-description my-12 hidden">
          <h2 className="mb-4 text-xl font-bold md:text-2xl">{t('additionalDetails')}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {Boolean(product.sku) && (
              <div>
                <h3 className="font-semibold">{t('sku')}</h3>
                <p>{product.sku}</p>
              </div>
            )}
            {Boolean(product.upc) && (
              <div>
                <h3 className="font-semibold">{t('upc')}</h3>
                <p>{product.upc}</p>
              </div>
            )}
            {Boolean(product.minPurchaseQuantity) && (
              <div>
                <h3 className="font-semibold">{t('minPurchase')}</h3>
                <p>{product.minPurchaseQuantity}</p>
              </div>
            )}
            {Boolean(product.maxPurchaseQuantity) && (
              <div>
                <h3 className="font-semibold">{t('maxPurchase')}</h3>
                <p>{product.maxPurchaseQuantity}</p>
              </div>
            )}
            {Boolean(product.availabilityV2.description) && (
              <div>
                <h3 className="font-semibold">{t('availability')}</h3>
                <p>{product.availabilityV2.description}</p>
              </div>
            )}
            {Boolean(product.condition) && (
              <div>
                <h3 className="font-semibold">{t('condition')}</h3>
                <p>{product.condition}</p>
              </div>
            )}
            {Boolean(product.weight) && (
              <div>
                <h3 className="font-semibold">{t('weight')}</h3>
                <p>
                  {product.weight?.value} {product.weight?.unit}
                </p>
              </div>
            )}
            {Boolean(customFields) &&
              customFields.map((customField) => (
                <div key={customField.entityId}>
                  <h3 className="font-semibold">{customField.name}</h3>
                  <p>{customField.value}</p>
                </div>
              ))}
          </div>
        </div>

          {/* <ProductSchema product={product} /> */}
          <PayPalPayLater
            amount={product?.prices?.price?.value?.toString() || '0'}
            currency={product?.prices?.price?.currencyCode || 'USD'}
          />
            <RequestQuote children={children3} />
          <CertificationsAndRatings 
          certificationIcon={certificationIcon} product={product} children={children4} triggerLabel={triggerLabel4}/>
          <ProductDetailDropdown product={product} dropdownSheetIcon={dropdownSheetIcon}
          triggerLabel={triggerLabel5}
          children={children5} />

        {/* <ShippingReturns /> */}

        <div className="flex justify-center gap-4 xl:mt-7">
          <Flyout triggerLabel={triggerLabel1}>{children1}</Flyout>

          <Flyout triggerLabel={triggerLabel2}>{children2}</Flyout>
        </div>
      </div>
    </div>
  );
};
