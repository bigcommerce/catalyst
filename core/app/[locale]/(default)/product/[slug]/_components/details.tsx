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
import { ShoppingCart } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { AddToCartButton } from '~/components/add-to-cart-button';

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
}

const StickyAddToCart = ({ data }: { data: FragmentOf<typeof ProductItemFragment> }) => {
  const { formState } = useFormContext();
  const { isSubmitting } = formState;

  return (
    <AddToCartButton data={data} loading={isSubmitting}>
      <ShoppingCart className="mr-2 h-5 w-5" />
      Add to Cart
    </AddToCartButton>
  );
};

export const Details = ({ product, collectionValue, dropdownSheetIcon }: Props) => {
  const t = useTranslations('Product.Details');
  const format = useFormatter();
  const productFormRef = useRef<HTMLDivElement>(null);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(product.defaultImage?.url || '');
  const searchParams = useSearchParams();

  const customFields = removeEdgesAndNodes(product.customFields);
  const productOptions = removeEdgesAndNodes(product.productOptions);
  const productImages = removeEdgesAndNodes(product.images);
  const variants = removeEdgesAndNodes(product.variants);

  // Declare all the constants needed
  const closeIcon = imageManagerImageUrl('close.png', '14w');
  const fanPopup = imageManagerImageUrl('grey-image.png', '150w');
  const blankAddImg = imageManagerImageUrl('notneeded-1.jpg', '150w');
  const certificationIcon = imageManagerImageUrl('vector-7-.png', '20w');
  const multipleOptionIcon = imageManagerImageUrl('vector-5-.png', '20w');
  const productMpn = product.mpn;

  // Calculate price range
  const showPriceRange =
    product.prices?.priceRange?.min?.value !== product.prices?.priceRange?.max?.value;

  // Update image when variant changes
  useEffect(() => {
    const updateImageFromVariant = () => {
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
  }, [searchParams, product, variants, productOptions]);

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => {
      if (!productFormRef.current) return;
      const formRect = productFormRef.current.getBoundingClientRect();
      setShowStickyHeader(formRect.bottom < 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        <div className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-white py-3 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                  <BcImage
                    src={currentImageUrl}
                    alt={product.name}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-medium text-gray-900">{product.name}</h2>
                  <div className="mt-1 text-sm text-gray-600">by {product.brand?.name}</div>
                  <div className="mt-1 text-sm text-gray-500">SKU: {product.mpn}</div>

                  <div className="mt-2 flex flex-wrap gap-4">
                    {productOptions
                      .filter((option) => option.__typename === 'MultipleChoiceOption')
                      .map((option) => (
                        <div key={option.entityId} className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">
                            {option.displayName}:
                          </span>
                          <span className="text-sm text-gray-600">
                            {getSelectedValue(option as MultipleChoiceOption)}
                          </span>
                        </div>
                      ))}
                  </div>

                  {product.prices?.price?.value && (
                    <div className="mt-1 text-lg font-medium text-[#008bb7]">
                      {format.number(product.prices.price.value, {
                        style: 'currency',
                        currency: product.prices.price.currencyCode,
                      })}
                    </div>
                  )}
                </div>
              </div>
              {/* ProductForm with showInSticky prop */}
              <div className="flex-shrink-0">
                <ProductForm
                  data={product}
                  productMpn={product.mpn || ''}
                  multipleOptionIcon={multipleOptionIcon}
                  blankAddImg={blankAddImg}
                  fanPopup={fanPopup}
                  closeIcon={closeIcon}
                  showInSticky={true}
                />
              </div>
            </div>
          </div>
        </div>
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

      <Coupon />
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
            src={imageManagerImageUrl('apple-xxl.png', '20w')}
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
