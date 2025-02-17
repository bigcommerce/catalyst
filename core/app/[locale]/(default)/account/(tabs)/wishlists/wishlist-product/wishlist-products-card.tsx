'use client';

import React, { memo, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '~/components/ui/button';
import Link from 'next/link';
import { useFormatter } from 'next-intl';
import { Breadcrumbs as ComponentsBreadcrumbs } from '~/components/ui/breadcrumbs';
import { addToCart } from '~/components/product-card/add-to-cart/form/_actions/add-to-cart';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import {
  CheckProductFreeShipping,
  GetProductMetaFields,
  GetVariantsByProductId,
} from '~/components/management-apis';
import {
  calculateProductPrice,
  callforMaxPriceRuleDiscountFunction,
  manageDeletedProducts,
} from '~/components/common-functions';
import { ProductPrice } from '~/belami/components/search/product-price';
import { Promotion } from '~/belami/components/search/hit';
import { getActivePromotions } from '~/belami/lib/fetch-promotions';
import { ReviewSummary } from '~/app/[locale]/(default)/product/[slug]/_components/review-summary';
import { getWishlists } from '~/components/graphql-apis';

import { CloseOut } from '~/app/[locale]/(default)/product/[slug]/_components/closeOut';

interface OptionValue {
  entityId: number;
  label: string;
  isDefault: boolean;
}

interface ProductOption {
  __typename: string;
  entityId: number;
  displayName: string;
  isRequired: boolean;
  isVariantOption: boolean;
  values: OptionValue[];
}

interface ProductVariant {
  entityId: number;
  sku: string;
  mpn: string;
  prices: {
    price: { value: number; currencyCode: string };
    basePrice: { value: number; currencyCode: string };
    salePrice: { value: number; currencyCode: string } | null;
    retailPrice: { value: number; currencyCode: string } | null;
  };
}

interface CategoryNode {
  name: string;
  path: string | null;
  breadcrumbs?: {
    edges: Array<{
      node: {
        entityId: any;
        name: string;
        path: string | null;
      };
    }> | null;
  };
}

interface WishlistProduct {
  categories: CategoryNode;
  entityId: number;
  name: string;
  sku: string;
  mpn: string;
  path: string;
  availabilityV2: {
    status: string;
    description: string;
  };
  brand?: {
    entityId: number;
    name: string;
    path: string;
  };
  defaultImage: {
    url: string;
    altText: string;
  };
  prices: {
    price: { value: number; currencyCode: string };
    basePrice: { value: number; currencyCode: string };
    salePrice: { value: number; currencyCode: string } | null;
    retailPrice: { value: number; currencyCode: string } | null;
  };
  reviewSummary?: {
    numberOfReviews: string;
    averageRating: string;
  };
  productOptions?: ProductOption[];
  variants: ProductVariant[];
}

interface WishlistItem {
  entityId: number;
  productEntityId: number;
  variantEntityId: number;
  product: WishlistProduct;
}

interface DeletedProductInfo {
  productId: number;
  wishlistItemId: number;
  deletionDate: string;
  productName?: string;
  remainingItems: number;
}

interface MetaField {
  key: string;
  value: string;
  namespace: string;
}
interface PriceMaxRule {
  price_max_activation_code_id: number;
  activation_code: string;
  discount: string;
  decoration_flag: boolean;
  decoration_label: string | null;
  exclude_accessories: boolean;
  is_sale_included: boolean;
  bc_brand_ids: string | null;
  skus: string[];
  store_hash: string | null;
  status: boolean;
}

const ProductCard = ({
  item,
  wishlistEntityId,
  onDelete,
  discountRules,
  priceMaxRules, // Add priceMaxRules to props
}: {
  item: WishlistItem;
  wishlistEntityId: number;
  onDelete: (productId: number, wishlistItemId: number) => void;
  discountRules: any;
  priceMaxRules: PriceMaxRule[] | null; // Add type
}) => {
  const format = useFormatter();
  const [isLoading, setIsLoading] = useState(false);
  const [updatedWishlist, setUpdatedWishlist] = useState<any[]>([]);
  const [promotionsData, setPromotionsData] = useState<any>(null);
  const [isFreeShipping, setIsFreeShipping] = useState(false);
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [hasActivePromotion, setHasActivePromotion] = useState(false);
  const [variantDetails, setVariantDetails] = useState<{
    mpn: string;
    calculated_price: number;
    option_values: Array<{
      option_display_name: string;
      label: string;
    }>;
  } | null>(null);

  // Helper functions for SKU matching
  const normalizeSku = (sku: string): string => {
    // Remove only trailing letters after numbers
    const normalized = sku.replace(/[A-Za-z]+$/, '');
    console.log(`SKU Normalization:
    Original SKU: ${sku}
    Normalized SKU: ${normalized}
  `);
    return normalized;
  };

  const doesSkuMatch = (productSku: string, ruleSku: string): boolean => {
    console.log(`\nStarting SKU Comparison:
    Product SKU: ${productSku}
    Rule SKU: ${ruleSku}`);

    const normalizedProductSku = normalizeSku(productSku);
    const normalizedRuleSku = normalizeSku(ruleSku);

    const matches = normalizedProductSku === normalizedRuleSku;

    console.log(`Match Result:
    Normalized Product SKU: ${normalizedProductSku}
    Normalized Rule SKU: ${normalizedRuleSku}
    Matches: ${matches}
  `);

    return matches;
  };

  const handleDeleteWishlist = () => {
    onDelete(item.product.entityId, item.entityId);
  };

  useEffect(() => {
    const fetchVariantDetails = async () => {
      try {
        console.log('\n=== Starting Price Calculations ===');
        console.log('Product SKU:', item.product.sku);

        const allVariantData = await GetVariantsByProductId(item.productEntityId);
        const variant = item.variantEntityId
          ? allVariantData.find((v: any) => v.id === item.variantEntityId)
          : allVariantData[0];

        if (variant) {
          // First check for price max rule
          let hasPriceMaxDiscount = false;
          if (priceMaxRules?.length) {
            const matchingRule = priceMaxRules.find((rule) =>
              rule.skus.some((ruleSku) => doesSkuMatch(item.product.sku, ruleSku)),
            );

            if (matchingRule) {
              console.log('Found Price Max Rule:', matchingRule);
              const basePrice =
                item.product.prices.retailPrice?.value || item.product.prices.basePrice.value;
              const discountPercent = parseInt(matchingRule.discount) / 100;
              const finalPrice = basePrice * (1 - discountPercent);
              hasPriceMaxDiscount = true;

              setUpdatedWishlist([
                {
                  UpdatePriceForMSRP: {
                    originalPrice: basePrice,
                    updatedPrice: finalPrice,
                    hasDiscount: true,
                    warrantyApplied: false,
                    showDecoration: true,
                    currencyCode: { currencyCode: item.product.prices.basePrice.currencyCode },
                  },
                },
              ]);

              console.log('Price Max Calculation:', {
                originalPrice: basePrice,
                discountPercent: matchingRule.discount + '%',
                finalPrice,
              });
            }
          }

          // If no price max discount, calculate regular price
          if (!hasPriceMaxDiscount) {
            console.log('Calculating Regular Price');
            const regularPriceResult = await calculateProductPrice(
              item.product,
              'wishlist',
              discountRules,
              categoryIds,
            );
            setUpdatedWishlist(regularPriceResult);
            console.log('Regular Price Result:', regularPriceResult);
          }

          // Set variant details
          setVariantDetails({
            mpn: variant.mpn,
            calculated_price: variant.calculated_price,
            option_values: variant.option_values,
          });
        }
      } catch (error) {
        console.error('Error in fetchVariantDetails:', error);

        // If error occurs, still try to calculate regular price
        try {
          const regularPriceResult = await calculateProductPrice(
            item.product,
            'wishlist',
            discountRules,
            categoryIds,
          );
          setUpdatedWishlist(regularPriceResult);
        } catch (priceError) {
          console.error('Error calculating regular price:', priceError);
        }
      }
    };

    const fetchData = async () => {
      try {
        const promotions = await getActivePromotions(true);
        const freeShipping = await CheckProductFreeShipping(item.productEntityId.toString());
        const cats =
          item.product?.categories?.edges?.map(
            (edge: { node: { entityId: any } }) => edge.node.entityId,
          ) || [];

        const hasPromo = promotions && (Object.keys(promotions).length > 0 || freeShipping);

        setPromotionsData(promotions);
        setIsFreeShipping(freeShipping);
        setCategoryIds(cats);
        setHasActivePromotion(hasPromo);
      } catch (error) {
        console.error('Error fetching promotions data:', error);
        setHasActivePromotion(false);
      }
    };

    fetchData();
    fetchVariantDetails();
  }, [item, discountRules, priceMaxRules]);

  function handlePriceUpdatedProduct(product: any[]) {
    if (Array.isArray(product) && JSON.stringify(updatedWishlist) !== JSON.stringify(product)) {
      setUpdatedWishlist((prevWishlist) => {
        if (JSON.stringify(prevWishlist) !== JSON.stringify(product)) {
          return product;
        }
        return prevWishlist;
      });
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="relative mb-4 flex h-full flex-col justify-between border border-gray-300 pb-0">
        <div className="product-card-details p-[1em]">
          <div className="relative aspect-square overflow-hidden">
            <Link href={item.product.path}>
              <img
                src={item.product.defaultImage.url.replace('{:size}', '500x500')}
                alt={item.product.defaultImage.altText || item.product.name}
                className="h-full w-full object-cover"
              />
            </Link>
          </div>

          <div className="flex justify-end">
            <div
              className="wishlist-product-delete-icon flex w-fit cursor-pointer justify-end rounded-full bg-[#E7F5F8]"
              onClick={handleDeleteWishlist}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="35"
                height="35"
                viewBox="0 0 21 19"
                fill="none"
                className="p-[7px]"
              >
                <path
                  d="M10.3257 18.35L8.87568 17.03C3.72568 12.36 0.325684 9.27 0.325684 5.5C0.325684 2.41 2.74568 0 5.82568 0C7.56568 0 9.23568 0.81 10.3257 2.08C11.4157 0.81 13.0857 0 14.8257 0C17.9057 0 20.3257 2.41 20.3257 5.5C20.3257 9.27 16.9257 12.36 11.7757 17.03L10.3257 18.35Z"
                  fill="#008BB7"
                />
              </svg>
            </div>
          </div>

          <div className="flex justify-center">
            {item.product.brand && (
              <p className="mb-2 flex justify-center text-sm text-gray-600">
                {item.product.brand.name}
              </p>
            )}
          </div>

          <Link href={item.product.path}>
            <h3 className="text-center font-medium text-black hover:text-gray-700">
              {item.product.name}
            </h3>
          </Link>

          <p className="mt-2 text-center text-sm text-gray-600">SKU: {item.product.sku}</p>

          <div className="flex justify-center">
            <ReviewSummary
              data={{
                reviewSummary: {
                  numberOfReviews: item.product.reviewSummary?.numberOfReviews || '0',
                  averageRating: item.product.reviewSummary?.averageRating || '0',
                },
              }}
            />
          </div>

          {variantDetails && (
            <div className="mt-2 space-y-2 text-center">
              <p className="text-sm">
                <span className="font-semibold">Sku: </span>
                <span>{item.product.sku}</span>
              </p>
              {updatedWishlist[0]?.UpdatePriceForMSRP && (
                <div className="flex flex-col items-center gap-[5px]">
                  <ProductPrice
                    defaultPrice={updatedWishlist[0].UpdatePriceForMSRP.originalPrice}
                    defaultSalePrice={
                      updatedWishlist[0].UpdatePriceForMSRP.hasDiscount
                        ? updatedWishlist[0].UpdatePriceForMSRP.updatedPrice
                        : null
                    }
                    priceMaxRule={priceMaxRules?.find((r) =>
                      r.skus.some((sku) => doesSkuMatch(item.product.sku, sku)),
                    )}
                    currency="USD"
                    format={format}
                    showMSRP={true}
                    warrantyApplied={false}
                    options={{
                      useAsyncMode: false,
                      useDefaultPrices: true,
                    }}
                    classNames={{
                      root: 'product-price mt-[30px] flex justify-center items-center gap-[0.5em] text-center xl:text-center',
                      newPrice:
                        'text-center text-[18px] font-medium leading-8 tracking-[0.15px] text-brand-400',
                      oldPrice:
                        'inline-flex items-baseline text-center text-[14px] font-medium leading-8 tracking-[0.15px] text-gray-600 line-through sm:mr-0',
                      discount:
                        'whitespace-nowrap text-center text-[14px] font-normal leading-8 tracking-[0.15px] text-brand-400',
                      price:
                        'text-center text-[18px] w-full font-medium leading-8 tracking-[0.15px] text-brand-400',
                      msrp: '-ml-[0.5em] mb-1 text-[10px] text-gray-500',
                    }}
                  />
                  <CloseOut
                    entityId={item.productEntityId}
                    variantId={item.variantEntityId}
                    isFromPDP={true}
                    isFromCart={false}
                  />
                </div>
              )}
              {variantDetails.option_values.map((option, index) => {
                const updatedValue =
                  option.option_display_name === 'Fabric Color' || 'Select Fabric Color'
                    ? option.label.split('|')[0]?.trim()
                    : option.label;
                return (
                  <p key={index} className="text-sm">
                    <span className="font-semibold">{`${option.option_display_name}: `} </span>
                    <span>{updatedValue}</span>
                  </p>
                );
              })}
            </div>
          )}
        </div>
        {hasActivePromotion && (
          <div className="text-center">
            <Promotion
              promotions={promotionsData}
              product_id={item.productEntityId}
              brand_id={Number(item.product.brand?.entityId)}
              category_ids={categoryIds}
              free_shipping={isFreeShipping}
            />
          </div>
        )}
      </div>

      {/* Inside ProductCard component */}

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setIsLoading(true);
          const formData = new FormData(e.currentTarget);

          try {
            console.log('\n=== Starting Add to Cart Process ===');

            // Check if we have a matching price max rule
            const matchingRule = priceMaxRules?.find((rule) =>
              rule.skus.some((ruleSku) => doesSkuMatch(item.product.sku, ruleSku)),
            );

            // Log initial state
            console.log('Initial State:', {
              productSku: item.product.sku,
              originalPrice: variantDetails?.calculated_price,
              hasMatchingRule: !!matchingRule,
              discountPercent: matchingRule?.discount,
            });

            // First add item to cart
            const cartResult = await addToCart(formData);
            console.log('Cart Add Result:', cartResult);

            if (cartResult.error) {
              throw new Error(cartResult.error);
            }

            // Get cart ID
            const cartId = cartResult.data?.entityId;
            if (!cartId) {
              throw new Error('Cart ID not found in response');
            }

            // If we have a matching rule, update the cart price
            if (matchingRule && updatedWishlist[0]?.UpdatePriceForMSRP?.hasDiscount) {
              const originalPrice = updatedWishlist[0].UpdatePriceForMSRP.originalPrice;
              const discountedPrice = updatedWishlist[0].UpdatePriceForMSRP.updatedPrice;

              console.log('Applying Price Update:', {
                cartId,
                productId: item.productEntityId,
                originalPrice,
                discountedPrice,
                discountPercent: matchingRule.discount + '%',
              });

              // Update cart price
              const priceUpdateResult = await callforMaxPriceRuleDiscountFunction({
                cartId,
                price: discountedPrice,
                productId: item.productEntityId.toString(),
                quantity: 1,
                originalPrice,
              });

              console.log('Price Update Result:', priceUpdateResult);
            }

            toast.success('Item added to cart');
          } catch (error) {
            console.error('Cart Operation Error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to add item to cart');
          } finally {
            setIsLoading(false);
          }
        }}
      >
        {/* Product and variant IDs */}
        <input name="product_id" type="hidden" value={item.productEntityId} />
        <input name="variant_id" type="hidden" value={item.variantEntityId} />

        {/* Price max rule info */}
        {updatedWishlist[0]?.UpdatePriceForMSRP?.hasDiscount && (
          <>
            <input type="hidden" name="has_price_max" value="true" />
            <input
              type="hidden"
              name="price_max_discount"
              value={updatedWishlist[0].UpdatePriceForMSRP.updatedPrice}
            />
          </>
        )}

        {/* Submit button */}
        {item.product.availabilityV2.status === 'Unavailable' ? (
          <div className="flex flex-col items-center">
            <Button
              id="add-to-cart"
              className="group relative flex h-[3.5em] w-full items-center justify-center overflow-hidden rounded-[4px] !bg-[#b1b9bc] text-center text-[14px] font-medium uppercase leading-[32px] tracking-[1.25px] text-black transition-all duration-300 hover:bg-[#03465c]/90 disabled:opacity-50"
              disabled={true}
              type="submit"
            >
              <span>ADD TO CART</span>
            </Button>
            <p className="text-[12px] text-[#2e2e2e]">This product is currently unavailable</p>
          </div>
        ) : (
          <Button
            type="submit"
            className="h-[42px] w-full bg-[#03465C] font-medium tracking-wider text-white hover:bg-[#02374a]"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>ADDING...</span>
              </div>
            ) : (
              'ADD TO CART'
            )}
          </Button>
        )}
      </form>
    </div>
  );
};

export function WishlistProductCard({
  customerGroupDetails,
  priceMaxRules,
}: {
  customerGroupDetails: { discount_rules: any };
  priceMaxRules: PriceMaxRule[] | null;
}): JSX.Element {
  const [wishlistState, setWishlistState] = useState({
    wishlistData: null as any,
    deletedProductsHistory: [] as DeletedProductInfo[],
    isLoading: true,
    error: null as string | null,
  });
  const router = useRouter();

  const discountRules = customerGroupDetails?.customerGroupDetails?.discount_rules;

  useEffect(() => {
    let isMounted = true;

    const initializeWishlist = async () => {
      try {
        // Load deletion history
        const savedHistory = localStorage.getItem('wishlistDeletionHistory');
        const deletionHistory = savedHistory ? JSON.parse(savedHistory) : [];

        // Load wishlist data
        const savedWishlist = localStorage.getItem('selectedWishlist');
        if (!savedWishlist) {
          router.push('/account/wishlists');
          return;
        }

        const parsedWishlist = JSON.parse(savedWishlist);
        const freshData = await getWishlists({ limit: 50 });
        const currentWishlist = freshData?.wishlists?.find(
          (w: any) => w.entityId === parsedWishlist.entityId,
        );

        if (currentWishlist && isMounted) {
          // Transform items
          const transformedItems = await Promise.all(
            currentWishlist.items.map(async (item: any) => {
              const productMetaFields = await GetProductMetaFields(item.productEntityId, '');

              return {
                entityId: item.entityId,
                productEntityId: item.productEntityId,
                variantEntityId: item.variantEntityId,
                product: {
                  ...item.product,
                  reviewSummary: {
                    numberOfReviews:
                      productMetaFields?.find(
                        (field: MetaField) => field?.key === 'sv-total-reviews',
                      )?.value || '0',
                    averageRating:
                      productMetaFields?.find(
                        (field: MetaField) => field?.key === 'sv-average-rating',
                      )?.value || '0',
                  },
                },
              };
            }),
          );

          if (isMounted) {
            setWishlistState((prev) => ({
              ...prev,
              wishlistData: {
                entityId: currentWishlist.entityId,
                name: currentWishlist.name,
                items: transformedItems,
              },
              deletedProductsHistory: deletionHistory,
              isLoading: false,
            }));
          }
        }
      } catch (error) {
        if (isMounted) {
          setWishlistState((prev) => ({
            ...prev,
            error: 'Failed to load wishlist data',
            isLoading: false,
          }));
        }
      }
    };

    initializeWishlist();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleDelete = useCallback((productId: number, wishlistItemId: number) => {
    setWishlistState((prev) => {
      if (!prev.wishlistData) return prev;

      manageDeletedProducts.addDeletedProduct(productId, wishlistItemId);

      const updatedItems = prev.wishlistData.items.filter(
        (item: { entityId: number }) => item.entityId !== wishlistItemId,
      );

      const updatedWishlist = {
        ...prev.wishlistData,
        items: updatedItems,
      };

      localStorage.setItem('selectedWishlist', JSON.stringify(updatedWishlist));

      return {
        ...prev,
        wishlistData: updatedWishlist,
      };
    });
  }, []);

  const { wishlistData, isLoading, error } = wishlistState;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return <div className="flex items-center justify-center p-8 text-red-500">{error}</div>;
  }

  if (!wishlistData) {
    return <div></div>;
  }

  return (
    <div className="container m-auto mx-auto mb-12 w-[80%] px-4">
      <ComponentsBreadcrumbs
        className="login-div login-breadcrumb mx-auto mb-2 mt-2 hidden px-[1px] lg:block"
        breadcrumbs={[
          {
            label: 'Favorites and Lists',
            href: '/account/wishlists',
          },
          {
            label: wishlistData?.name || 'Loading...',
            href: '#',
          },
        ]}
      />

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-2 text-left text-xl font-medium leading-8 tracking-[0.15px] text-black">
            {wishlistData?.name}
          </h1>
          <p className="text-left text-base leading-8 tracking-[0.15px] text-black">
            {wishlistData?.items.length} {wishlistData?.items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <Button
          variant="secondary"
          className="h-10 !w-auto bg-[#008BB7] px-6 text-[14px] font-medium uppercase tracking-wider text-white hover:bg-[#007a9e]"
        >
          SHARE FAVORITES
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 2xl:grid-cols-4">
        {wishlistData?.items.map((item: WishlistItem) => (
          <ProductCard
            key={item.entityId}
            item={item}
            wishlistEntityId={wishlistData.entityId}
            onDelete={handleDelete}
            discountRules={discountRules}
            priceMaxRules={priceMaxRules}
          />
        ))}
      </div>
    </div>
  );
}

export default memo(WishlistProductCard);
