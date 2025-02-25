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

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

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

interface ProductCardProps {
  item: WishlistItem;
  wishlistEntityId: number;
  onDelete: (productId: number, wishlistItemId: number, variantEntityId: number) => void;
  discountRules: any;
  priceMaxRules: PriceMaxRule[] | null;
}

interface WishlistProductCardProps {
  customerGroupDetails: { discount_rules: any };
  priceMaxRules: PriceMaxRule[] | null;
}

export const ProductCard = memo(
  ({ item, wishlistEntityId, onDelete, discountRules, priceMaxRules }: ProductCardProps) => {
    const format = useFormatter();
    const [state, setState] = useState({
      isLoading: false,
      isDeleting: false,
      hasActivePromotion: false,
      isFreeShipping: false,
      categoryIds: [] as number[],
      promotionsData: null as any,
      updatedWishlist: [] as any[],
      variantDetails: null as any,
    });

    const normalizeSku = useCallback((sku: string): string => {
      return sku.replace(/[A-Za-z]+$/, '');
    }, []);

    const handleDeleteWishlist = useCallback((): void => {
      try {
        setState((prev) => ({ ...prev, isDeleting: true }));
        toast.loading('Removing item...');
        onDelete(item.product.entityId, item.entityId, item.variantEntityId);
        toast.dismiss();
        toast.success('Item removed from favorites');
      } catch (error) {
        toast.dismiss();
        toast.error('Failed to remove item');
      } finally {
        setState((prev) => ({ ...prev, isDeleting: false }));
      }
    }, [item, onDelete]);

    const handleAddToCart = useCallback(
      async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setState((prev) => ({ ...prev, isLoading: true }));
        const formData = new FormData(e.currentTarget);

        try {
          const matchingRule = priceMaxRules?.find((rule) =>
            rule.skus.some((ruleSku) => normalizeSku(item.product.sku) === normalizeSku(ruleSku)),
          );

          const cartResult = await addToCart(formData);
          if (cartResult.error) throw new Error(cartResult.error);

          const cartId = cartResult.data?.entityId;
          if (!cartId) throw new Error('Cart ID not found in response');

          if (matchingRule && state.updatedWishlist[0]?.UpdatePriceForMSRP?.hasDiscount) {
            const originalPrice = state.updatedWishlist[0].UpdatePriceForMSRP.originalPrice;
            const discountedPrice = state.updatedWishlist[0].UpdatePriceForMSRP.updatedPrice;

            await callforMaxPriceRuleDiscountFunction({
              cartId,
              price: discountedPrice,
              productId: item.productEntityId.toString(),
              quantity: 1,
              originalPrice,
            });
          }

          toast.success('Item added to cart');
        } catch (error) {
          console.error('Cart Operation Error:', error);
          toast.error(error instanceof Error ? error.message : 'Failed to add item to cart');
        } finally {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      },
      [item, priceMaxRules, normalizeSku, state.updatedWishlist],
    );
    let selectedSku : any;
    const productsArray = [];
    productsArray.push(item?.product);
    const combinedData = productsArray?.map((item: any) => {
      selectedSku = item?.sku;
      const optionsValue = item?.options?.edges?.length || 0;
      let closeOutValue = [];
        const variantCloseout = item?.variants?.flatMap((variant: any) => {
         const variantSku = variant?.sku;
          if (selectedSku == variantSku) {
            return variant?.closeOutData?.edges[0]?.node?.value
          }
          return [];
        });
        const productCloseout = item?.closeOutParentData?.edges?.map((variant: any) => variant?.node?.value);
        if (optionsValue > 0) {
          closeOutValue = variantCloseout.length > 0 ? variantCloseout : productCloseout;
        } else {
          closeOutValue =  productCloseout;
        }
      return {
        selectedSku,
        closeOutData: closeOutValue || []
      };
    });
    useEffect(() => {
      let mounted = true;

      const processVariantAndPrice = async (variant: any) => {
        if (!mounted) return;

        const variantDetails = {
          mpn: variant.mpn,
          calculated_price: variant.calculated_price,
          option_values: variant.option_values,
        };

        const basePrice =
          item.product.prices.retailPrice?.value || item.product.prices.basePrice.value;
        const matchingRule = priceMaxRules?.find((rule) =>
          rule.skus.some((ruleSku) => normalizeSku(item.product.sku) === normalizeSku(ruleSku)),
        );

        if (matchingRule) {
          const discountPercent = parseInt(matchingRule.discount) / 100;
          const finalPrice = basePrice * (1 - discountPercent);

          if (mounted) {
            setState((prev) => ({
              ...prev,
              variantDetails,
              updatedWishlist: [
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
              ],
            }));
          }
        } else {
          if (mounted) {
            setState((prev) => ({ ...prev, variantDetails }));
            const result = await calculateProductPrice(
              item.product,
              'wishlist',
              discountRules,
              state.categoryIds,
            );
            if (mounted) {
              setState((prev) => ({ ...prev, updatedWishlist: result }));
            }
          }
        }
      };

      const initializeCard = async () => {
        try {
          // Process categories
          if (item.product?.categories) {
            const categories = removeEdgesAndNodes(item.product.categories) as CategoryNode[];
            const categoryWithMostBreadcrumbs = categories.reduce((longest, current) => {
              const longestLength = longest?.breadcrumbs?.edges?.length || 0;
              const currentLength = current?.breadcrumbs?.edges?.length || 0;
              return currentLength > longestLength ? current : longest;
            }, categories[0]);

            const categoryId =
              categoryWithMostBreadcrumbs?.breadcrumbs?.edges?.map((edge) => edge.node.entityId) ||
              [];

            if (mounted) {
              setState((prev) => ({ ...prev, categoryIds: categoryId }));
            }

            // Get variant data
            const allVariantData = await GetVariantsByProductId(item.productEntityId);
            const variant = item.variantEntityId
              ? allVariantData.find((v: any) => v.id === item.variantEntityId)
              : allVariantData[0];

            if (variant && mounted) {
              await processVariantAndPrice(variant);
            }

            // Get promotions data
            const [promotions, freeShipping] = await Promise.all([
              getActivePromotions(true),
              CheckProductFreeShipping(item.productEntityId.toString()),
            ]);

            if (mounted) {
              setState((prev) => ({
                ...prev,
                promotionsData: promotions,
                isFreeShipping: freeShipping,
                hasActivePromotion:
                  promotions && (Object.keys(promotions).length > 0 || freeShipping),
              }));
            }
          }
        } catch (error) {
          console.error('Error initializing card:', error);
        }
      };

      initializeCard();

      return () => {
        mounted = false;
      };
    }, [item.productEntityId, item.variantEntityId]);

    const hasVariantOptions = state.variantDetails?.option_values?.length > 0;
    const hasPrice = state.updatedWishlist[0]?.UpdatePriceForMSRP;
    const isUnavailable = item.product.availabilityV2.status === 'Unavailable';

    return (
      <div className="flex h-full flex-col">
        {/* Main Card Content */}
        <div className="relative mb-4 flex h-full flex-col border border-gray-300 pb-0">
          <div className="product-card-details pb-[0em] text-center">

            <div className="wishlist-product-details pl-[15px] pr-[15px]">

              {/* Image and Delete Button */}
              <div className="relative aspect-square overflow-hidden">
                <Link href={item.product.path}>
                  <img
                    src={item.product.defaultImage.url.replace('{:size}', '500x500')}
                    alt={item.product.defaultImage.altText || item.product.name}
                    className="h-full w-full object-cover"
                  />
                </Link>
              </div>
              <div className='wishlist-product-brand-delete'>

                <div className="flex justify-end">
                  <div
                    className="wishlist-product-delete-icon mb-[1em] flex w-fit cursor-pointer justify-end rounded-full bg-[#E7F5F8]"
                    onClick={handleDeleteWishlist}
                  >
                    {state.isDeleting ? (
                      <Loader2 className="h-[35px] w-[35px] animate-spin p-[7px] text-[#008BB7]" />
                    ) : (
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
                    )}
                  </div>
                </div>


                {/* Brand */}
                <div className="flex justify-center">
                  {item.product.brand && (
                    <p className="mb-2 flex justify-center text-sm text-gray-600">
                      {item.product.brand.name}
                    </p>
                  )}
                </div>



              </div>

              {/* Product Name */}
              <Link href={item.product.path}>
                <h3 className="text-center font-medium text-black hover:text-gray-700">
                  {item.product.name}
                </h3>
              </Link>

              {/* Price and Options */}
              {hasPrice && (
                <div className="mt-2 space-y-2 text-center">
                  <div className="mb-[15px] flex flex-col items-center gap-[8px]">
                    <ProductPrice
                      defaultPrice={state.updatedWishlist[0].UpdatePriceForMSRP.originalPrice}
                      defaultSalePrice={
                        state.updatedWishlist[0].UpdatePriceForMSRP.hasDiscount
                          ? state.updatedWishlist[0].UpdatePriceForMSRP.updatedPrice
                          : null
                      }
                      priceMaxRule={priceMaxRules?.find((r) =>
                        r.skus.some((sku) => normalizeSku(item.product.sku) === normalizeSku(sku)),
                      )}
                      currency="USD"
                      format={format}
                      showMSRP={state.updatedWishlist[0].UpdatePriceForMSRP?.showDecoration}
                      warrantyApplied={false}
                      options={{
                        useAsyncMode: false,
                        useDefaultPrices: true,
                      }}
                      classNames={{
                        root: 'product-price flex justify-center items-center gap-[0.5em] text-center xl:text-center',
                        newPrice: 'text-center text-[18px] font-medium leading-8 tracking-[0.15px]',
                        oldPrice:
                          'inline-flex items-baseline text-center text-[14px] font-medium leading-8 tracking-[0.15px] text-gray-600 line-through sm:mr-0',
                        discount:
                          'whitespace-nowrap text-center text-[14px] font-normal leading-8 tracking-[0.15px] text-brand-400',
                        price:
                          'text-center text-[18px] w-full font-medium leading-8 tracking-[0.15px]',
                        msrp: '-ml-[0.5em] mb-1 text-[10px] text-gray-500',
                      }}
                    />
                    {combinedData.map((value:any) => {
                    if(value?.closeOutData[0] === "True"){
                      return (
                        <div className="closeout-messages">
                          <div className="bg-[#B4B4B5] content-center px-[10px] max-w-fit text-[#ffffff] tracking-[1.25px] leading-[32px] text-[14px]">
                        CLEARANCE
                        </div>
                      </div>
                      )
                    }
                  })}
                  </div>
                </div>
              )}

              {/* Variant Options */}
              {hasVariantOptions && (
                <div className="mt-2 space-y-2 text-center">
                  {state.variantDetails.option_values.map(
                    (
                      option: { option_display_name: string; label: string },
                      index: React.Key | null | undefined,
                    ) => {
                      const label =
                        option.option_display_name === 'Fabric Color' ||
                          option.option_display_name === 'Select Fabric Color'
                          ? option.label.split('|')[0]?.trim()
                          : option.label;
                      return (
                        <p key={index} className="text-sm">
                          <span className="font-semibold">{`${option.option_display_name}: `}</span>
                          <span>{label}</span>
                        </p>
                      );
                    },
                  )}
                </div>
              )}

              {/* Reviews */}
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
            </div>

            {/* Promotions */}
            {state.hasActivePromotion && (
              <div className="text-center">
                <Promotion
                  promotions={state.promotionsData}
                  product_id={item.productEntityId}
                  brand_id={Number(item.product.brand?.entityId)}
                  category_ids={state.categoryIds}
                  free_shipping={state.isFreeShipping}
                />
              </div>
            )}
          </div>
        </div>

        {/* Add to Cart Form - Outside the main card */}
        <form onSubmit={handleAddToCart}>
          <input name="product_id" type="hidden" value={item.productEntityId} />
          <input name="variant_id" type="hidden" value={item.variantEntityId} />

          {state.updatedWishlist[0]?.UpdatePriceForMSRP?.hasDiscount && (
            <>
              <input type="hidden" name="has_price_max" value="true" />
              <input
                type="hidden"
                name="price_max_discount"
                value={state.updatedWishlist[0].UpdatePriceForMSRP.updatedPrice}
              />
            </>
          )}

          {isUnavailable ? (
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
              disabled={state.isLoading}
            >
              {state.isLoading ? (
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
  },
);

ProductCard.displayName = 'ProductCard';

export const WishlistProductCard = memo(
  ({ customerGroupDetails, priceMaxRules }: WishlistProductCardProps) => {
    const [wishlistState, setWishlistState] = useState<{
      wishlistData: any | null;
      isLoading: boolean;
      error: string | null;
    }>({
      wishlistData: null,
      isLoading: true,
      error: null,
    });

    const router = useRouter();
    const discountRules = customerGroupDetails?.discount_rules;

    const filterDeletedItems = useCallback((items: WishlistItem[]): WishlistItem[] => {
      if (!items) return [];
      return items.filter((item) => !manageDeletedProducts.isWishlistItemDeleted(item.entityId));
    }, []);

    const handleDelete = useCallback(
      (productId: number, wishlistItemId: number, variantEntityId: number): void => {
        manageDeletedProducts.addDeletedProduct(productId, wishlistItemId, variantEntityId);

        setWishlistState((prev) => {
          if (!prev.wishlistData) return prev;

          const updatedItems = prev.wishlistData.items.filter(
            (item: { entityId: number }) => item.entityId !== wishlistItemId,
          );

          const updatedWishlist = {
            ...prev.wishlistData,
            items: updatedItems,
          };

          try {
            localStorage.setItem('selectedWishlist', JSON.stringify(updatedWishlist));
          } catch (error) {
            console.error('Error saving wishlist:', error);
          }

          return {
            ...prev,
            wishlistData: updatedWishlist,
          };
        });
      },
      [],
    );

    useEffect(() => {
      let isMounted = true;

      const initializeWishlist = async () => {
        try {
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
            let transformedItems = await Promise.all(
              currentWishlist.items.map(async (item: any) => {
                if (manageDeletedProducts.isWishlistItemDeleted(item.entityId)) {
                  return null;
                }

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

            transformedItems = transformedItems.filter((item) => item !== null);

            if (isMounted) {
              const updatedWishlist = {
                entityId: currentWishlist.entityId,
                name: currentWishlist.name,
                items: transformedItems,
              };

              setWishlistState({
                wishlistData: updatedWishlist,
                isLoading: false,
                error: null,
              });

              try {
                localStorage.setItem('selectedWishlist', JSON.stringify(updatedWishlist));
              } catch (error) {
                console.error('Error saving wishlist:', error);
              }
            }
          }
        } catch (error) {
          console.error('Failed to load wishlist:', error);
          if (isMounted) {
            setWishlistState({
              wishlistData: null,
              isLoading: false,
              error: 'Failed to load wishlist data',
            });
          }
        }
      };

      initializeWishlist();

      return () => {
        isMounted = false;
      };
    }, [router]);

    const { wishlistData, isLoading, error } = wishlistState;

    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center p-8 text-red-500">
          <div className="text-center">
            <p className="mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-[#008BB7] text-white hover:bg-[#007a9e]"
            >
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    if (!wishlistData) {
      return <div></div>;
    }

    if (wishlistData.items.length === 0) {
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
              <p className="text-left text-base leading-8 tracking-[0.15px] text-black">0 items</p>
            </div>
            <Button
              variant="secondary"
              className="h-10 !w-auto bg-[#008BB7] px-6 text-[14px] font-medium uppercase tracking-wider text-white hover:bg-[#007a9e]"
            >
              SHARE FAVORITES
            </Button>
          </div>
        </div>
      );
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

        <div className="mb-8 flex flex-col flex-wrap items-center justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="mb-2 text-left text-xl font-medium leading-8 tracking-[0.15px] text-black">
              {wishlistData?.name}
            </h1>
            <p className="text-center text-base leading-8 tracking-[0.15px] text-black sm:text-left">
              {wishlistData?.items.length} {wishlistData?.items.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          <Button
            variant="secondary"
            className="h-10 !w-auto bg-white px-6 text-[14px] text-base font-medium uppercase tracking-wider sm:bg-[#008BB7] sm:text-white sm:hover:bg-[#007a9e]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="mx-2 sm:hidden"
            >
              <mask
                id="mask0_10545_6748"
                style={{ maskType: 'alpha' }}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="24"
                height="24"
              >
                <rect width="24" height="24" fill="#D9D9D9" />
              </mask>
              <g mask="url(#mask0_10545_6748)">
                <path
                  d="M6 23C5.45 23 4.97917 22.8042 4.5875 22.4125C4.19583 22.0208 4 21.55 4 21V10C4 9.45 4.19583 8.97917 4.5875 8.5875C4.97917 8.19583 5.45 8 6 8H9V10H6V21H18V10H15V8H18C18.55 8 19.0208 8.19583 19.4125 8.5875C19.8042 8.97917 20 9.45 20 10V21C20 21.55 19.8042 22.0208 19.4125 22.4125C19.0208 22.8042 18.55 23 18 23H6ZM11 16V4.825L9.4 6.425L8 5L12 1L16 5L14.6 6.425L13 4.825V16H11Z"
                  fill="#000000"
                />
              </g>
            </svg>
            <span>SHARE FAVORITES</span>
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
  },
);

WishlistProductCard.displayName = 'WishlistProductCard';

export default WishlistProductCard;
