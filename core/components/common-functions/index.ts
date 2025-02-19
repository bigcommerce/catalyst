import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import {
  getCommonSettingByBrandChannel,
  addCouponCodeToCart,
  GetProductMetaFields,
  GetProductVariantMetaFields,
  generateCouponPromotion,
  generateCouponCodeInPromotion,
  updateCouponPromotion,
  updateCartItemMaxPriceRuleDisccount,
  deleteCouponCodeFromCart,
} from '../management-apis';
import { getCookieData } from '../graphql-apis';

interface MetaField {
  entityId: number;
  key: string;
  value: string;
  description?: string;
  id?: number;
  namespace?: string;
  resource_type?: string;
  resource_id?: number;
  date_created?: string;
  date_modified?: string;
  owner_client_id?: string;
}

interface Variant {
  entityId: number;
  sku: string;
}

interface ProcessedDetail {
  category: string;
  order: number;
  mainOrder: number;
  key: string;
  value: string;
}

interface GroupedDetails {
  category: string;
  order: number;
  details: ProcessedDetail[];
}

interface MetaFieldResponse {
  metaField: MetaField | null;
  productMetaField: MetaField | null;
  message: string;
  hasVariantOptions: boolean;
  isVariantData: boolean;
}

interface ProcessedMetaFieldsResponse {
  variantDetails: MetaField[];
  groupedDetails: GroupedDetails[];
}

interface IncludedItem {
  name: string;
}

interface IncludedItemsResponse {
  productLevel: IncludedItem[];
  variantLevel: IncludedItem[];
}

interface ExcludedMetaFields {
  keys: string[];
  categories: string[];
}
interface DeletedProduct {
  productId: number;
  wishlistItemId: number;
  wishlistId: number;
}
// Define excluded metadata
const excludedMetaFields: ExcludedMetaFields = {
  keys: [
    'spec_sheet',
    'install_sheet',
    'included',
    'ratings_certifications',
    'Ratings and Certifications',
  ],
  categories: ['Other'],
};

// Helper function to check if a field should be excluded
const shouldExcludeField = (key: string, category: string): boolean => {
  return excludedMetaFields.keys.includes(key) || excludedMetaFields.categories.includes(category);
};

// Helper function to format values
export const formatValue = (value: string): string => {
  try {
    const parsed = JSON.parse(value);

    // Handle arrays
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          if (typeof item === 'object' && item !== null) {
            // If array contains objects, try to extract meaningful values
            return Object.values(item).join(', ');
          }
          return item.toString();
        })
        .join(', ');
    }

    // Handle objects
    if (typeof parsed === 'object' && parsed !== null) {
      return Object.values(parsed).join(', ');
    }

    return parsed.toString();
  } catch {
    // If we can't parse it, return the original value
    return value.toString();
  }
};

// Process meta fields into grouped details
export const processMetaFields = (metaFields: MetaField[]): GroupedDetails[] => {
  const processed = metaFields
    .filter((field) => {
      // First filter out any fields we don't want to process
      try {
        const [, category] = (field.description || '').split('|');
        return !shouldExcludeField(field.key, category || 'Other');
      } catch {
        return false; // Exclude if we can't parse the description
      }
    })
    .map((field) => {
      try {
        const [mainOrder, category, key, subOrder] = (field.description || '').split('|');
        // Format the key to be more readable
        const formattedKey =
          key ||
          field.key
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        return {
          category: category || 'Other',
          order: parseInt(subOrder || '0', 10),
          mainOrder: parseInt(mainOrder || '0', 10),
          key: formattedKey,
          value: formatValue(field.value),
        };
      } catch (error) {
        return null; // Return null for any entries we can't process
      }
    })
    .filter((item): item is ProcessedDetail => item !== null); // Filter out null entries

  const groupedByCategory = processed.reduce((acc, item) => {
    const existing = acc.find((group) => group.category === item.category);
    if (existing) {
      existing.details.push(item);
    } else {
      acc.push({
        category: item.category,
        order: item.mainOrder,
        details: [item],
      });
    }
    return acc;
  }, [] as GroupedDetails[]);

  return groupedByCategory
    .sort((a, b) => a.order - b.order)
    .map((group) => ({
      ...group,
      details: group.details.sort((a, b) => a.order - b.order),
    }))
    .filter((group) => group.details.length > 0); // Remove any empty groups
};

export const fetchVariantDetails = async (product: any): Promise<ProcessedMetaFieldsResponse> => {
  if (!product?.entityId) {
    throw new Error('Product ID is missing');
  }

  let variantDetails: MetaField[] = [];
  let groupedDetails: GroupedDetails[] = [];

  try {
    // Fetch product level details
    const productMetaFields = await GetProductMetaFields(product.entityId, 'Details');
    const productGroupedDetails = processMetaFields(productMetaFields);

    // Fetch variant level details
    let variantData: Variant[] = removeEdgesAndNodes(product?.variants) as Variant[];
    const currentSku = product.sku;
    const matchingVariant = variantData.find((variant) => variant.sku === currentSku);

    if (matchingVariant?.entityId) {
      const variantMetaFields = await GetProductVariantMetaFields(
        product.entityId,
        matchingVariant.entityId,
        'Details',
      );

      if (variantMetaFields) {
        variantDetails = variantMetaFields;
        const variantGroupedDetails = processMetaFields(variantMetaFields);
        groupedDetails = [...productGroupedDetails, ...variantGroupedDetails];
      }
    }

    return {
      variantDetails,
      groupedDetails,
    };
  } catch (error) {
    console.error('Error fetching variant details:', error);
    return {
      variantDetails: [],
      groupedDetails: [],
    };
  }
};

// Fetch included items
export const fetchIncludedItems = async (
  product: any,
  productMetaFields: MetaField[],
): Promise<IncludedItemsResponse> => {
  let productLevelItems: IncludedItem[] = [];
  let variantLevelItems: IncludedItem[] = [];

  try {
    const productIncludedMeta = productMetaFields?.find(
      (meta: MetaField) => meta.key === 'included',
    );

    if (productIncludedMeta) {
      try {
        productLevelItems = JSON.parse(productIncludedMeta.value);
      } catch (parseError) {
        console.error('Error parsing product level included items');
      }
    }

    const variantIncludedData = await getMetaFieldsByProduct(product, 'included');
    if (variantIncludedData?.isVariantData && variantIncludedData?.metaField?.value) {
      try {
        variantLevelItems = JSON.parse(variantIncludedData.metaField.value);
      } catch (parseError) {
        console.error('Error parsing variant level included items');
      }
    }

    return {
      productLevel: productLevelItems,
      variantLevel: variantLevelItems,
    };
  } catch (error) {
    console.error('Error fetching included items:', error);
    return {
      productLevel: [],
      variantLevel: [],
    };
  }
};

export const getVariantId = async (product: any) => {
  let getvariantData = removeEdgesAndNodes(product?.variants);
  if (getvariantData) {
    let getvariant: any = getvariantData?.find((variant: any) => variant?.sku === product?.sku);
    if (getvariant) {
      return getvariant?.entityId;
    }
  }
  return null;
};

export const getMetaFieldsByProduct = async (
  product: any,
  metaKey: string,
): Promise<MetaFieldResponse> => {
  let entityId = product?.entityId;
  let variantData: any = removeEdgesAndNodes(product?.variants);
  let optionsData: any = removeEdgesAndNodes(product?.productOptions);

  let result: MetaFieldResponse = {
    metaField: null,
    productMetaField: null,
    message: '',
    hasVariantOptions: false,
    isVariantData: false,
  };

  const productMetaFields = await GetProductMetaFields(entityId, '');
  if (productMetaFields) {
    const productMeta = productMetaFields?.find((meta: MetaField) => meta.key === metaKey);
    if (productMeta) {
      result.productMetaField = productMeta;
    }
  }

  const hasMatchingVariant = variantData?.some((variant: any) => variant.sku === product.sku);

  if (
    variantData &&
    Array.isArray(variantData) &&
    variantData.length > 0 &&
    optionsData &&
    Array.isArray(optionsData) &&
    optionsData.length > 0 &&
    hasMatchingVariant
  ) {
    const hasVariantOptions = optionsData.some((option: any) => option.isVariantOption === true);
    result.hasVariantOptions = hasVariantOptions;

    if (hasVariantOptions) {
      const variantId = await getVariantId(product);
      if (variantId) {
        const variantMetaFields = await GetProductVariantMetaFields(entityId, variantId, '');
        if (variantMetaFields && variantMetaFields.length > 0) {
          const variantMeta = variantMetaFields.find((meta: MetaField) => meta.key === metaKey);
          if (variantMeta) {
            result.metaField = variantMeta;
            result.message = 'Found both variant and product data';
            result.isVariantData = true;
            return result;
          }
        }
      }
      if (result.productMetaField) {
        result.message = 'No variant data found, showing product data only';
        result.isVariantData = false;
      }
    } else {
      if (result.productMetaField) {
        result.message = 'No variant options, showing product data only';
        result.isVariantData = false;
      }
    }
  } else {
    if (result.productMetaField) {
      result.message = 'No variant data available, showing product data only';
      result.isVariantData = false;
    }
  }

  return result;
};

export const commonSettinngs = async (brand_ids: any) => {
  brand_ids = [...new Set(brand_ids.filter((id: any) => id !== undefined))];
  if (brand_ids !== undefined && brand_ids.length > 0) {
    var res = await getCommonSettingByBrandChannel(brand_ids);
    return res.output;
  } else {
    return { status: 500, output: [] };
  }
};
export const retrieveMpnData = (product: any, productid: Number, variantId: Number) => {
  if (product?.baseCatalogProduct?.variants) {
    let productVariants: any = removeEdgesAndNodes(product?.baseCatalogProduct?.variants);
    let productvariantData: any = productVariants.find((prod: any) => prod?.entityId == variantId);
    return productvariantData?.mpn ?? product?.sku;
  } else {
    return product?.sku;
  }
};

export const checkZeroTaxCouponIsApplied = async (checkoutData: any) => {
  let couponCodeArray: any = checkoutData?.coupons;
  let zeroTaxCoupon: number = 0;
  if (couponCodeArray?.length > 0) {
    let couponData: any = couponCodeArray?.find((discount: any) =>
      discount?.code?.toLowerCase()?.includes('zerotax'),
    );
    if (couponData) {
      zeroTaxCoupon = 1;
    }
  }
  return zeroTaxCoupon;
};

export const checkZeroTaxCouponAmount = async (checkoutData: any) => {
  let couponCodeArray: any = checkoutData?.coupons;
  let zeroTaxCoupon: number = 0;
  if (couponCodeArray?.length > 0) {
    let couponData: any = couponCodeArray?.find((discount: any) =>
      discount?.code?.toLowerCase()?.includes('zerotax'),
    );
    if (couponData) {
      zeroTaxCoupon = couponData?.discountedAmount?.value;
    }
  }
  return zeroTaxCoupon;
};

export const getDiscountPercentage = (originalPrice: any, updatedPrice: any): number => {
  const originalPriceNum = Number(originalPrice);
  const updatedPriceNum = Number(updatedPrice);

  if (!isNaN(originalPriceNum) && !isNaN(updatedPriceNum) && originalPriceNum > 0) {
    return Math.round(((originalPriceNum - updatedPriceNum) / originalPriceNum) * 100);
  }

  return 0;
};

export const calculateProductPrice = async (
  products: any,
  type: String,
  discountRules: any,
  categoryIds: any,
) => {
  const isSingleProduct = !Array.isArray(products);
  const productArray = isSingleProduct ? [products] : products;

  const convertedPrices = productArray.map((product: any) => {
    const prices = product?.catalogProductWithOptionSelections?.prices || product?.prices;
    const quantity = product?.quantity || 1;

    const retailPrice = type === 'accessories' ? product.retail_price : prices?.retailPrice?.value;
    const salePrice = type === 'accessories' ? product.sale_price : prices?.salePrice?.value;
    const basePrice = type === 'accessories' ? product.price : prices?.basePrice?.value;
    const warrantyPrice = prices && prices.price ? prices.price : null;

    const productId =
      type === 'accessories'
        ? product.product_id
        : type === 'pdp' || type === 'wishlist' || type === 'flyout'
          ? product.entityId
          : product.productEntityId;

    let originalPrice = 0;
    let updatedPrice = 0;
    let discount = 0;
    let hasDiscount = false;
    let warrantyApplied = false;

    // MSRP Logic
    if (salePrice && retailPrice) {
      originalPrice = retailPrice * quantity;
      updatedPrice = salePrice * quantity;
      discount = getDiscountPercentage(retailPrice, salePrice);
    } else if (retailPrice && basePrice) {
      originalPrice = retailPrice * quantity;
      updatedPrice = basePrice * quantity;
      discount = getDiscountPercentage(retailPrice, basePrice);
    } else if (salePrice && basePrice) {
      originalPrice = basePrice * quantity;
      updatedPrice = salePrice * quantity;
      discount = getDiscountPercentage(basePrice, salePrice);
    } else if (basePrice) {
      originalPrice = basePrice * quantity;
      updatedPrice = basePrice * quantity;
      discount = 0;
    }

    if (type === 'pdp' || type === "flyout") {
      if (warrantyPrice.value*quantity > updatedPrice) {
        updatedPrice = warrantyPrice.value*quantity;
        warrantyApplied = true;
      }
    }
    if (discountRules && Array.isArray(discountRules) && discountRules.length > 0) {
      const productLevelDiscounts = discountRules.filter(
        (eachItem: any) => eachItem.type === 'product',
      );
      const categoryLevelDiscounts = discountRules.filter(
        (eachItem: any) => eachItem.type === 'category',
      );
      const storeWideDiscounts = discountRules.filter((eachItem: any) => eachItem.type === 'all');

      let isProductDiscountApplied = false;
      let isCategoryDiscountApplied = false;
      let isStoreWideDiscountApplied = false;

      const applyDiscount = (method: string, amount: number) => {
        if (method === 'price') {
          updatedPrice -= amount;
        } else if (method === 'percent') {
          updatedPrice -= (updatedPrice * amount) / 100;
        } else if (method === 'fixed') {
          updatedPrice = amount;
        }
        discount = getDiscountPercentage(originalPrice, updatedPrice);
        hasDiscount = originalPrice > updatedPrice;
      };

      if (!isProductDiscountApplied) {
        productLevelDiscounts &&
          productLevelDiscounts.forEach((rule: any) => {
            if (rule.product_id && productId === parseInt(rule.product_id, 10)) {
              let amount = Math.round(parseInt(rule.amount, 10));
              applyDiscount(rule.method, amount);
              isProductDiscountApplied = true;
            }
          });
      }
      if (!isProductDiscountApplied && !isCategoryDiscountApplied) {
        categoryLevelDiscounts &&
          categoryLevelDiscounts.forEach((rule: any) => {
            if (
              rule.category_id &&
              categoryIds?.some((id: number) => id === parseInt(rule.category_id, 10))
            ) {
              let amount = Math.round(parseInt(rule.amount, 10));
              applyDiscount(rule.method, amount);
              isCategoryDiscountApplied = true;
            }
          });
      }
      if (!isProductDiscountApplied && !isCategoryDiscountApplied && !isStoreWideDiscountApplied) {
        storeWideDiscounts &&
          storeWideDiscounts.forEach((rule: any) => {
            let amount = Math.round(parseInt(rule.amount, 10));
            applyDiscount(rule.method, amount);
            isStoreWideDiscountApplied = true;
          });
      }
    }

    const convertedObject = {
      UpdatePriceForMSRP: {
        originalPrice,
        updatedPrice,
        discount,
        hasDiscount: discount > 0,
        showDecoration: !!retailPrice && retailPrice > 0,
        warrantyApplied: warrantyApplied,
      },
    };

    return {
      ...product,
      ...convertedObject,
    };
  });

  return convertedPrices;
};

export const checkCouponCodeIsApplied = async (checkoutData: any) => {
  let couponCodeArray: any = checkoutData?.coupons;
  let couponIsAvailable: number = 0;
  if (couponCodeArray?.length > 0) {
    couponIsAvailable = 1;
  }
  return couponIsAvailable;
};

export const zeroTaxCalculation = async (cartObject: any) => {
  let checkoutData: any = cartObject?.checkout;
  let cartData: any = cartObject?.cart;
  let cartId: string = cartData?.entityId;
  let couponAppliedData: any = [];
  if (await checkZeroTaxCouponIsApplied(checkoutData)) {
    let taxPercentage: any = 0;
    let subTotalAmount: any = checkoutData?.subtotal?.value || 0;
    let taxAmount: any = checkoutData?.taxTotal?.value || 0;
    taxPercentage = Number((subTotalAmount / taxAmount)?.toFixed(2));
    let taxPercentCalc: any = taxAmount / subTotalAmount;
    let postDataArray: any = [];
    let overAllTaxAmount: any = 0;
    let overallZeroTaxAmount: any = 0;
    let productIdsArray: any = [];
    let zeroTaxCouponAmount: any = await checkZeroTaxCouponAmount(checkoutData);
    for await (const item of cartData?.lineItems?.physicalItems) {
      let couponDiscount: any = item?.couponAmount;
      let couponAmount: any = couponDiscount?.value;
      overallZeroTaxAmount += couponAmount;
      let qty: any = item?.quantity;
      let zeroTaxCheck: any = couponAmount / qty;
      if (zeroTaxCheck == 0.1 || (zeroTaxCouponAmount > 0 && couponAmount > 0)) {
        let productAmount = item?.extendedSalePrice?.value;
        let taxAmountEachProduct = (taxPercentCalc * productAmount) / (1 + taxPercentCalc);
        if (taxAmountEachProduct) {
          overAllTaxAmount += taxAmountEachProduct;
          postDataArray.push({
            id: item?.entityId,
            discounted_amount: taxAmountEachProduct?.toFixed(2),
            prodId: item?.productEntityId,
          });
          productIdsArray.push(item?.productEntityId);
        }
      }
    }
    couponAppliedData = checkoutData?.coupons?.[0];
    if (postDataArray?.length > 0) {
      let finalDiscountAmount: any = (overAllTaxAmount - zeroTaxCouponAmount)?.toFixed(2);
      const cookieStore = await getCookieData();
      const getCartZTCpn = cookieStore.get('ztcpn_data')?.value;
      if (!getCartZTCpn) {
        let couponCodeZerotax: string = couponAppliedData?.code + '_' + generateRandomString(8);
        let createPromotionData = await generateCouponPromotion(
          finalDiscountAmount,
          postDataArray,
          couponCodeZerotax,
          'Zero_Tax_Addon_',
        );
        if (createPromotionData?.data?.id) {
          await generateCouponCodeInPromotion(couponCodeZerotax, createPromotionData?.data?.id);
          await deleteCouponCodeFromCart(cartId, couponAppliedData?.code);
          await addCouponCodeToCart(cartId, couponCodeZerotax);
          return {
            id: createPromotionData?.data?.id,
            amount: finalDiscountAmount,
            code: couponCodeZerotax,
            action: 'create',
          };
        }
      } else {
        let promoData = getCartZTCpn ? JSON.parse(getCartZTCpn) : [];
        if (promoData?.id) {
          let updatePromotionData = await updateCouponPromotion(
            finalDiscountAmount,
            postDataArray,
            promoData?.id,
            'Zero_Tax_Addon_',
          );
          if (updatePromotionData?.data?.id) {
            return {
              id: updatePromotionData?.data?.id,
              amount: finalDiscountAmount,
              code: promoData?.code,
              action: 'update',
            };
          }
        }
      }
    }
  }
};

export function generateRandomString(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter: number = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result?.toUpperCase();
}

export const floorPriceCalculation = async (cartObject: any) => {
  let brandArrayIds: any = [];
  let productDataArray: any = [];
  let checkoutData: any = cartObject?.checkout;
  let cartData: any = cartObject?.cart;
  let cartId: string = cartData?.entityId;
  let couponAppliedData: any = [];
  cartObject?.cart?.lineItems.physicalItems?.forEach((item: any) => {
    let couponDiscount: any = item?.couponAmount;
    if (couponDiscount?.value > 0) {
      brandArrayIds.push(item?.baseCatalogProduct?.brand?.entityId);
    }
  });
  let floorPercentUrl = process.env.COMMON_SETTING_URL + 'api/get-floor-price';
  try {
    let data = await fetch(floorPercentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        brand_ids: brandArrayIds,
        channel_id: process.env.BIGCOMMERCE_CHANNEL_ID,
      }),
      next: {
        revalidate: 3600,
      },
    })
      .then((res) => res.json())
      .then((jsonData) => {
        return jsonData;
      });
    let priceFloorHappened: number = 0;
    let sumOfCouponAmount: number = 0;
    if (data?.output) {
      let discountAmountItemWise: any = 0;
      couponAppliedData = checkoutData?.coupons?.[0];
      cartObject?.cart?.lineItems.physicalItems?.forEach((item: any) => {
        let productVariants: any = item?.baseCatalogProduct?.variants
          ? removeEdgesAndNodes(item?.baseCatalogProduct?.variants)
          : [];
        let currentProductVariant: any = productVariants?.filter(
          (variant: any) => item?.variantEntityId == variant?.entityId,
        );
        let couponAmountData: any = item?.couponAmount;
        let itemCouponAmount: number = couponAmountData?.value > 0 ? couponAmountData?.value : 0;
        let itemProductPrice: any = item?.extendedSalePrice?.value;
        if (currentProductVariant?.[0]?.metafields) {
          let productVariantMeta: any = removeEdgesAndNodes(currentProductVariant?.[0]?.metafields);
          if (productVariantMeta?.[0]?.key == 'adjusted_cost') {
            let getBrandFactor: any = Object.values(data?.output)?.find(
              (factor: any) => factor?.brand_id == item?.baseCatalogProduct?.brand?.entityId,
            );
            if (getBrandFactor?.floor_price) {
              let floorPrice: any =
                getBrandFactor?.floor_price * productVariantMeta?.[0]?.value * item?.quantity;
              let isFloorCheck: number = 0;
              let remainDiscount: number = 0;
              let availableDiscount: number = 0;
              if (floorPrice > itemProductPrice - itemCouponAmount) {
                discountAmountItemWise = (itemProductPrice - floorPrice)?.toFixed(2);
                discountAmountItemWise =
                  discountAmountItemWise > 0 ? discountAmountItemWise * 1 : 0;
                remainDiscount = itemCouponAmount - discountAmountItemWise;
                availableDiscount = 0;
                priceFloorHappened = 1;
                isFloorCheck = 1;
              } else {
                discountAmountItemWise = (itemProductPrice - floorPrice)?.toFixed(2);
                remainDiscount = 0;
                availableDiscount = Math.abs(itemCouponAmount - discountAmountItemWise);
                discountAmountItemWise =
                  discountAmountItemWise > itemCouponAmount
                    ? itemCouponAmount
                    : discountAmountItemWise;
              }
              sumOfCouponAmount += discountAmountItemWise;
              let remainDisc: any = remainDiscount?.toFixed(2);
              productDataArray.push({
                id: item?.entityId,
                discounted_amount: discountAmountItemWise * 1,
                prodId: item?.productEntityId,
                itemDiscount: itemCouponAmount,
                isFloorHit: isFloorCheck,
                floorPrice: floorPrice,
                itemPrice: itemProductPrice,
                remainDiscount: Math.abs(remainDisc),
                availableDiscount: availableDiscount,
              });
            }
          } else {
            sumOfCouponAmount += itemCouponAmount * 1;
            productDataArray.push({
              id: item?.entityId,
              discounted_amount: itemCouponAmount?.toFixed(2),
              prodId: item?.productEntityId,
              itemDiscount: itemCouponAmount,
              isFloorHit: 0,
              itemPrice: itemProductPrice,
              remainDiscount: Math.abs(itemCouponAmount),
              availableDiscount: 0,
            });
          }
        } else {
          sumOfCouponAmount += itemCouponAmount * 1;
          productDataArray.push({
            id: item?.entityId,
            discounted_amount: itemCouponAmount?.toFixed(2),
            prodId: item?.productEntityId,
            itemDiscount: itemCouponAmount,
            isFloorHit: 0,
            itemPrice: itemProductPrice,
            remainDiscount: Math.abs(itemCouponAmount),
            availableDiscount: 0,
          });
        }
      });
    }
    if (priceFloorHappened == 1) {
      let priceFloorApportion: any = await apportionateRemainingDiscount(
        productDataArray,
        couponAppliedData?.discountedAmount?.value,
        sumOfCouponAmount,
      );
      if (priceFloorApportion?.length > 0) {
        const cookieStore = await getCookieData();
        const getCartPFLCpn = cookieStore.get('pr_flr_data')?.value;
        let finalDiscountAmount: any = couponAppliedData?.discountedAmount?.value;
        let couponCodePFCode: string = couponAppliedData?.code + '_' + generateRandomString(8);
        if (!getCartPFLCpn) {
          let createPromotionData = await generateCouponPromotion(
            finalDiscountAmount,
            priceFloorApportion,
            couponCodePFCode,
            couponAppliedData?.code + '_',
          );
          if (createPromotionData?.data?.id) {
            await generateCouponCodeInPromotion(couponCodePFCode, createPromotionData?.data?.id);
            await deleteCouponCodeFromCart(cartId, couponAppliedData?.code);
            await addCouponCodeToCart(cartId, couponCodePFCode);
            return {
              id: createPromotionData?.data?.id,
              amount: finalDiscountAmount,
              code: couponCodePFCode,
              action: 'create',
            };
          }
        } else {
          let promoData = getCartPFLCpn ? JSON.parse(getCartPFLCpn) : [];
          if (promoData?.id) {
            let updatePromotionData = await updateCouponPromotion(
              finalDiscountAmount,
              priceFloorApportion,
              promoData?.id,
              'FL_Price_',
            );
            if (updatePromotionData?.data?.id) {
              return {
                id: updatePromotionData?.data?.id,
                amount: finalDiscountAmount,
                code: promoData?.code,
                action: 'update',
              };
            }
          }
        }
      }
    } else {
      return {
        action: 'no_floor',
      };
    }
  } catch (error) {
    console.error(error);
  }
};

export const apportionateRemainingDiscount = async (
  productDataArray: any,
  couponAmount: any,
  sumOfCouponAmount: any,
) => {
  const initialAvailValue = 0;
  const availableDiscountValue = productDataArray?.reduce(
    (accumulator, currentValue) => accumulator + currentValue?.availableDiscount,
    initialAvailValue,
  );
  const initialRemainValue = 0;
  const remainingDiscountValue = productDataArray?.reduce(
    (accumulator, currentValue) => accumulator + Math.abs(currentValue?.remainDiscount),
    initialRemainValue,
  );

  if (availableDiscountValue > 0 && remainingDiscountValue > 0) {
    productDataArray?.forEach((newData: any) => {
      let newDiscountData: any = newData?.remainDiscount;
      if (newDiscountData > 0) {
        productDataArray?.forEach((data: any) => {
          if (data?.availableDiscount > 0) {
            if (data?.availableDiscount >= newDiscountData) {
              newData['remainDiscount'] = 0;
            } else if (newDiscountData > data?.availableDiscount) {
              newData['remainDiscount'] -= data?.availableDiscount;
            }
            if (data?.availableDiscount >= newDiscountData) {
              let availDiscount: any = data?.availableDiscount - newDiscountData;
              data['discounted_amount'] += data?.availableDiscount - availDiscount;
              data['availableDiscount'] = availDiscount;
            } else if (newDiscountData > data?.availableDiscount) {
              let availDiscount: any = newDiscountData - data?.availableDiscount;
              data['availableDiscount'] = availDiscount;
            }
          }
        });
      }
    });
  }
  return productDataArray;
};

// delete-product-wishlist
export const storageUtils = {
  getFromStorage: (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },

  setToStorage: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },

  removeFromStorage: (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
};

// Initialize deleted products array
let deletedProducts: DeletedProduct[] = [];

// Initialize from storage if available
if (typeof window !== 'undefined') {
  const savedProducts = storageUtils.getFromStorage('deletedWishlistProducts');
  if (savedProducts) {
    deletedProducts = JSON.parse(savedProducts);
  }
}

export const manageDeletedProducts = {
  addDeletedProduct: (productId: number, wishlistItemId: number) => {
    const deletedProducts = JSON.parse(localStorage.getItem('deletedProducts') || '[]');
    // Check if product is already in deleted list
    const existingIndex = deletedProducts.findIndex(
      (item: any) => item.productId === productId && item.wishlistItemId === wishlistItemId,
    );

    if (existingIndex === -1) {
      deletedProducts.push({
        productId,
        wishlistItemId,
        deletionDate: new Date().toISOString(),
      });

      localStorage.setItem('deletedProducts', JSON.stringify(deletedProducts));
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'deletedProducts',
        }),
      );
    }
  },

  removeDeletedProduct: (productId: number) => {
    const deletedProducts = JSON.parse(localStorage.getItem('deletedProducts') || '[]');
    const updatedProducts = deletedProducts.filter((item: any) => item.productId !== productId);

    localStorage.setItem('deletedProducts', JSON.stringify(updatedProducts));
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'deletedProducts',
      }),
    );
  },

  getDeletedProducts: () => {
    return JSON.parse(localStorage.getItem('deletedProducts') || '[]');
  },

  isProductDeleted: (productId: number) => {
    const deletedProducts = JSON.parse(localStorage.getItem('deletedProducts') || '[]');
    return deletedProducts.some((item: any) => item.productId === productId);
  },
};

// cookie-discounted-price
interface PriceUpdateData {
  cartId: string;
  price: number;
  productId: string;
  quantity: number;
}

export async function callforMaxPriceRuleDiscountFunction(data: any) {
  try {
    const result = await updateCartItemMaxPriceRuleDisccount({
      cartId: data.cartId,
      price: data.price,
      productId: data.productId,
      quantity: data.quantity,
    });
    return result;
  } catch (error) {
    console.error('Error in max price rule update:', error);
    throw error;
  }
}
