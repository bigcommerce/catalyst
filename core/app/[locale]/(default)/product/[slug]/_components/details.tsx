'use client';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { useFormatter, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PricingFragment } from '~/client/fragments/pricing';
import { ProductItemFragment } from '~/client/fragments/product-item';
import { FragmentOf, graphql } from '~/client/graphql';
import CertificationsAndRatings from '~/components/ui/pdp/belami-certification-rating-pdp';
import { Payment } from '~/components/ui/pdp/belami-payment-pdp';
import { RequestQuote } from '~/components/ui/pdp/belami-request-a-quote-pdp';
import { ShippingReturns } from '~/components/ui/pdp/belami-shipping-returns-pdp';
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
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import { ShoppingCart } from 'lucide-react';

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

interface ProductImage {
  url: string;
  altText: string;
  isDefault: boolean;
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

interface Props {
  product: FragmentOf<typeof DetailsFragment>;
  collectionValue?: string;
  dropdownSheetIcon?: string;
  cartHeader?: string;
  couponIcon?: string;
  paywithGoogle?: string;
}

export const Details = ({
  product,
  collectionValue,
  dropdownSheetIcon,
  cartHeader,
  couponIcon,
  paywithGoogle,
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
  const productImages = removeEdgesAndNodes(product.images);
  const variants = removeEdgesAndNodes(product.variants);

  const closeIcon = imageManagerImageUrl('close.png', '14w');
  const fanPopup = imageManagerImageUrl('grey-image.png', '150w');
  const blankAddImg = imageManagerImageUrl('notneeded-1.jpg', '150w');
  const certificationIcon = imageManagerImageUrl('vector-7-.png', '20w');
  const multipleOptionIcon = imageManagerImageUrl('vector-5-.png', '20w');
  const productMpn = product.mpn;

  const showPriceRange =
    product.prices?.priceRange?.min?.value !== product.prices?.priceRange?.max?.value;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (!productFormRef.current) return;

      const formRect = productFormRef.current.getBoundingClientRect();
      setShowStickyHeader(formRect.bottom < 0);

      if (currentScrollY < lastScrollY) {
        setIsScrollingUp(true);
      } else {
        setIsScrollingUp(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
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

        if (selectedVariant?.defaultImage?.url) {
          setCurrentImageUrl(selectedVariant.defaultImage.url);
          return;
        }
      }

      setCurrentImageUrl(product.defaultImage?.url || '');
    };

    updateImageFromVariant();
  }, [searchParams, product, variants, productOptions, currentMainMedia]);

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
    <div>
      {showStickyHeader && (
        <>
          {/* Desktop View - Sticky Top */}
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
                  <div className="mr-[10em] flex-1">
                    <h2 className="text-left text-[20px] font-medium leading-8 tracking-wide text-black">
                      {product.name}
                    </h2>
                    <div className="mt-3 text-left text-[14px] font-normal leading-[10px] tracking-[0.25px]">
                      by <span className="underline">{product.brand?.name}</span>
                    </div>
                    <div className="mt-3 flex items-center text-[#7F7F7F]">
                      {product.mpn && (
                        <div className="text-[14px] font-bold leading-[24px] tracking-[0.25px]">
                          SKU: {product.mpn}
                        </div>
                      )}
                      {product.mpn &&
                        productOptions.filter(
                          (option) => option.__typename === 'MultipleChoiceOption',
                        ).length > 0 && <span className="mx-2 text-[14px] font-normal">|</span>}
                      {productOptions.filter(
                        (option) => option.__typename === 'MultipleChoiceOption',
                      ).length > 0 && (
                        <div className="text-[14px] font-normal">
                          {productOptions
                            .filter((option) => option.__typename === 'MultipleChoiceOption')
                            .map((option, index, filteredArray) => {
                              if (option.__typename === 'MultipleChoiceOption') {
                                const selectedValue = getSelectedValue(
                                  option as MultipleChoiceOption,
                                );
                                return (
                                  <span key={option.entityId}>
                                    <span className="font-bold">{option.displayName}:</span>{' '}
                                    <span className="text-[15px]">{selectedValue}</span>
                                    {index < filteredArray.length - 1 && (
                                      <span className="mx-2">|</span>
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
                  {product.prices?.price?.value !== undefined && (
                    <div className="text-right">
                      <div className="text-lg font-medium text-[#008bb7]">
                        {format.number(product.prices.price.value, {
                          style: 'currency',
                          currency: product.prices.price.currencyCode,
                        })}
                      </div>
                    </div>
                  )}

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
                      <ShoppingCart className="h-5 w-0 transform opacity-0 transition-all duration-300 group-hover:w-5 group-hover:opacity-100" />
                    </div>
                  </button>
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
                <ShoppingCart className="h-5 w-0 transform opacity-0 transition-all duration-300 group-hover:w-5 group-hover:opacity-100" />
              </div>
            </button>
          </div>
        </>
      )}

      <div className="div-product-details">
        <h1 className="product-name mb-3 text-center text-[1.25rem] font-medium leading-[2rem] tracking-[0.15px] sm:text-center md:mt-6 lg:mt-0 lg:text-left xl:mt-0 xl:text-[1.5rem] xl:font-normal xl:leading-[2rem]">
          {product.name}
        </h1>

        <div className="items-center space-x-1 text-center lg:text-left xl:text-left">
          <span className="OpenSans text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.25px] text-black lg:text-left xl:text-[0.875rem] xl:leading-[1.5rem] xl:tracking-[0.25px]">
            SKU: <span>{product.mpn}</span>
          </span>
          <span className="OpenSans text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.25px] text-black lg:text-left xl:text-[0.875rem] xl:leading-[1.5rem] xl:tracking-[0.25px]">
            by{' '}
            <span className="products-underline border-b border-black">{product.brand?.name}</span>
          </span>

          {collectionValue && (
            <>
              <span className="product-collection OpenSans text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.25px] text-black lg:text-left xl:text-[0.875rem] xl:leading-[1.5rem] xl:tracking-[0.25px]">
                from the{' '}
                <span className="products-underline border-b border-black">{collectionValue} </span>{' '}
                Family
              </span>
            </>
          )}
        </div>

        <ReviewSummary data={product} />
      </div>

      {product.prices && (
        <div className="product-price mt-2 flex gap-2 text-center text-2xl font-bold lg:mt-6 lg:text-left lg:text-3xl">
          {showPriceRange ? (
            <span className="span1-product-price">
              {format.number(product.prices.priceRange.min.value, {
                style: 'currency',
                currency: product.prices.price.currencyCode,
              })}{' '}
              -{' '}
              {format.number(product.prices.priceRange.max.value, {
                style: 'currency',
                currency: product.prices.price.currencyCode,
              })}
            </span>
          ) : (
            <>
              {product.prices.price?.value !== undefined && (
                <span className="span2-product-price text-[1.25rem] font-medium leading-[2rem] tracking-[0.15px] text-[#008bb7]">
                  <span>
                    {format.number(product.prices.price.value, {
                      style: 'currency',
                      currency: product.prices.price.currencyCode,
                    })}
                  </span>
                  <br />
                </span>
              )}
              {product.prices.saved?.value !== undefined &&
              product.prices.basePrice?.value !== undefined ? (
                <>
                  <span className="span3-product-price text-[1rem] font-normal leading-[2rem] tracking-[0.15px] text-[#002a37]">
                    <span className="line-through">
                      {format.number(product.prices.basePrice.value, {
                        style: 'currency',
                        currency: product.prices.price.currencyCode,
                      })}
                    </span>
                  </span>
                  <span className="span4-product-price text-[1rem] font-normal leading-[2rem] tracking-[0.15px]">
                    {t('Prices.now')}{' '}
                    {format.number(product.prices.saved.value, {
                      style: 'currency',
                      currency: product.prices.price.currencyCode,
                    })}
                  </span>
                </>
              ) : (
                product.prices.price.value && <span className="span5-product-price"></span>
              )}
            </>
          )}
        </div>
      )}

      <Coupon couponIcon={couponIcon} />
      <FreeDelivery />

      <div ref={productFormRef}>
        <ProductForm
          data={product}
          productMpn={product.mpn || ''}
          multipleOptionIcon={multipleOptionIcon}
          blankAddImg={blankAddImg}
          fanPopup={fanPopup}
          closeIcon={closeIcon}
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

      <ProductSchema product={product} />

      <div className="apple-pay mt-4 xl:hidden">
        <button className="flex w-[100%] items-center justify-center rounded bg-[#353535] p-4 text-white">
          <BcImage
            alt="GPay icon"
            src={paywithGoogle}
            height={20}
            width={20}
            className="mr-4 inline"
          />
          Pay with Google
        </button>
      </div>

      <Payment />
      <RequestQuote />
      <CertificationsAndRatings certificationIcon={certificationIcon} product={product} />
      <ProductDetailDropdown product={product} dropdownSheetIcon={dropdownSheetIcon} />
      <ShippingReturns />
    </div>
  );
};
