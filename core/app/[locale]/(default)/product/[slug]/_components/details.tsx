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
import Link from 'next/link';

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
            <Link
              href={product.brand?.path ?? ''}
              className="products-underline border-b border-black"
            >
              {product.brand?.name}
            </Link>
          </span>
          {collectionValue && (
            <span className="product-collection OpenSans text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.25px] text-black lg:text-left xl:text-[0.875rem] xl:leading-[1.5rem] xl:tracking-[0.25px]">
              from the{' '}
              <Link
                href={`/search?brand_name[0]=${encodeURIComponent(product.brand?.name ?? '')}&collection[0]=${encodeURIComponent(collectionValue)}`}
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
    </div>
  );
};
