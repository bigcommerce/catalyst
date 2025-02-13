import { getFormatter } from 'next-intl/server';
import Link from 'next/link';

import { FragmentOf, graphql } from '~/client/graphql';
import { BcImage } from '~/components/bc-image';

import { ItemQuantity } from './item-quantity';
import { RemoveItem } from './remove-item';
import { RemoveAccessoryItem } from '../../../../../components/product-card/remove-accessory-item';
import ProductPriceAdjuster from '../../sales-buddy/common-components/_components/ProductPriceAdjuster';
import { AccessoriesButton } from './accessories-button';
import { imageManagerImageUrl } from '~/lib/store-assets';
import { AccessoriesInputPlusMinus } from '~/components/form-fields/accessories-input-plus-minus';
import { get_product_by_entity_id_in_cart } from '../_actions/get-product-by-entityid';
import { Button } from '~/components/ui/button';
import { calculateProductPrice, retrieveMpnData } from '~/components/common-functions';
import { commonSettinngs } from '~/components/common-functions';
import { NoShipCanada } from '../../product/[slug]/_components/belami-product-no-shipping-canada';
import { FreeDelivery } from '../../product/[slug]/_components/belami-product-free-shipping-pdp';
import { getSessionUserDetails } from '~/auth';
import {
  CheckProductFreeShipping,
} from '~/components/management-apis';
import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getActivePromotions } from '~/belami/lib/fetch-promotions';
import { Promotion } from '../../product/[slug]/_components/promotion';

const PhysicalItemFragment = graphql(`
  fragment PhysicalItemFragment on CartPhysicalItem {
    name
    brand
    sku
    url
    image {
      url: urlTemplate(lossy: true)
    }
    entityId
    quantity
    productEntityId
    variantEntityId
    couponAmount {
      currencyCode
      formatted
      value
    }
    discountedAmount {
      currencyCode
      formatted
      value
    }
    discounts {
      discountedAmount {
        currencyCode
        formatted
        value
      }
    }
    baseCatalogProduct {
      brand {
        entityId
        id
      }
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
      categories {
        edges {
          node {
            breadcrumbs(depth: 10) {
              edges {
                node {
                  entityId
                  name
                }
              }
            }
          }
        }
      }
    }
    catalogProductWithOptionSelections {
      prices {
        retailPrice {
          currencyCode
          value
          formatted
          ...MoneyFields
        }
        salePrice {
          currencyCode
          value
        }
        basePrice {
          currencyCode
          value
        }
      }
    }
    extendedListPrice {
      currencyCode
      value
    }
    extendedSalePrice {
      currencyCode
      value
    }
    originalPrice {
      currencyCode
      value
    }
    listPrice {
      currencyCode
      value
    }
    selectedOptions {
      __typename
      entityId
      name
      ... on CartSelectedMultipleChoiceOption {
        value
        valueEntityId
      }
      ... on CartSelectedCheckboxOption {
        value
        valueEntityId
      }
      ... on CartSelectedNumberFieldOption {
        number
      }
      ... on CartSelectedMultiLineTextFieldOption {
        text
      }
      ... on CartSelectedTextFieldOption {
        text
      }
      ... on CartSelectedDateFieldOption {
        date {
          utc
        }
      }
    }
  }
`);
const CustomItemFragment = graphql(`
  fragment CustomItemFragment on CartCustomItem {
    name
    sku
    entityId
    quantity

    listPrice {
      currencyCode
      value
    }
  }
`);

const DigitalItemFragment = graphql(`
  fragment DigitalItemFragment on CartDigitalItem {
    name
    brand
    sku
    url
    image {
      url: urlTemplate(lossy: true)
    }
    entityId
    quantity
    productEntityId
    variantEntityId
    extendedListPrice {
      currencyCode
      value
    }
    extendedSalePrice {
      currencyCode
      value
    }
    originalPrice {
      currencyCode
      value
    }
    listPrice {
      currencyCode
      value
    }
    selectedOptions {
      __typename
      entityId
      name
      ... on CartSelectedMultipleChoiceOption {
        value
        valueEntityId
      }
      ... on CartSelectedCheckboxOption {
        value
        valueEntityId
      }
      ... on CartSelectedNumberFieldOption {
        number
      }
      ... on CartSelectedMultiLineTextFieldOption {
        text
      }
      ... on CartSelectedTextFieldOption {
        text
      }
      ... on CartSelectedDateFieldOption {
        date {
          utc
        }
      }
    }
  }
`);

export const CartItemFragment = graphql(
  `
    fragment CartItemFragment on CartLineItems {
      physicalItems {
        ...PhysicalItemFragment
      }
      digitalItems {
        ...DigitalItemFragment
      }
      customItems {
        ...CustomItemFragment
      }
    }
  `,
  [PhysicalItemFragment, DigitalItemFragment, CustomItemFragment],
);

type FragmentResult = FragmentOf<typeof CartItemFragment>;
type PhysicalItem = FragmentResult['physicalItems'][number];
type DigitalItem = FragmentResult['digitalItems'][number];
type CustomItem = FragmentResult['customItems'][number];
export type Product = PhysicalItem | DigitalItem | CustomItem;

interface Props {
  brandId: any;
  product: any;
  currencyCode: string;
  deleteIcon: string;
  cartId: string;
  priceAdjustData: string;
  ProductType: string;
  cookie_agent_login_status: boolean;
  getAllCommonSettinngsValues: any;
  discountRules: any;
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

function moveToTheEnd(arr: any, word: string) {
  arr?.map((elem: any, index: number) => {
    if (elem?.name?.toLowerCase() === word?.toLowerCase()) {
      arr?.splice(index, 1);
      arr?.push(elem);
    }
  });
  return arr;
}
export const CartItem = async ({
  brandId,
  currencyCode,
  product,
  deleteIcon,
  cartId,
  priceAdjustData,
  cookie_agent_login_status,
  getAllCommonSettinngsValues,
  discountRules,
}: Props) => {
  const closeIcon = imageManagerImageUrl('close.png', '14w');
  const blankAddImg = imageManagerImageUrl('notneeded-1.jpg', '150w');
  const fanPopup = imageManagerImageUrl('grey-image.png', '150w');

  const changeTheProtectedPosition = moveToTheEnd(
    product?.selectedOptions,
    'Protect Your Purchase',
  );
  const format = await getFormatter();
  let productSKU: string = retrieveMpnData(
    product,
    product?.productEntityId,
    product?.variantEntityId,
  );
  const updatedAccessories: any[][] = [];

  if (product?.accessories?.length > 0) {
    const promises = product.accessories.map(async (item: any, index: number) => {
      const categories = removeEdgesAndNodes(item.baseCatalogProduct.categories) as CategoryNode[];
      const categoryWithMostBreadcrumbs = categories.reduce((longest, current) => {
        const longestLength = longest?.breadcrumbs?.edges?.length || 0;
        const currentLength = current?.breadcrumbs?.edges?.length || 0;
        return currentLength > longestLength ? current : longest;
      }, categories[0]);

      const categoryIds =
        categoryWithMostBreadcrumbs?.breadcrumbs?.edges?.map((edge) => edge.node.entityId) || [];

      const details = await calculateProductPrice(
        item,
        'cartaccessory',
        discountRules,
        categoryIds,
      );
      updatedAccessories.push(...details);
    });

    // Wait for all promises to resolve
    await Promise.all(promises);
  }

  product = { ...product, updatedAccessories };

  const promotions = await getActivePromotions(true);

  const isFreeShipping = await CheckProductFreeShipping(product.entityId.toString());
  const categoryIds = product?.categories?.edges?.map((edge:any) => edge.node.entityId) || [];

  return (
    <li className="mb-[24px] border border-gray-200">
      {getAllCommonSettinngsValues.hasOwnProperty(brandId) &&
        getAllCommonSettinngsValues?.[brandId]?.no_ship_canada && (
          <div className="flex w-full justify-center bg-[#E7F5F8]">
            <NoShipCanada
              description={getAllCommonSettinngsValues?.[brandId]?.no_ship_canada_message}
            />
          </div>
        )}
      <div className="cart-products">
        <div className="mb-5 flex flex-col gap-4 p-4 py-4 sm:flex-row">
          <div className="cart-main-img mx-auto h-[295px] w-[295px] flex-none sm:h-[200px] sm:w-[200px] md:mx-0">
            {product.image?.url ? (
              <BcImage
                alt={product?.name}
                height={200}
                src={product?.image?.url}
                width={200}
                className="h-[295px] min-h-[9em] w-[295px] object-contain sm:h-[200px] sm:w-[200px]"
              />
            ) : (
              <div className="min-h-[300px] min-w-[300px]" />
            )}
          </div>

          <div className="flex-1">
            <p className="hidden text-base text-gray-500">{product?.brand}</p>
            <div
              className={`grid grid-cols-1 gap-1 sm:grid-cols-[auto_auto] ${
                cookie_agent_login_status == true
                  ? 'xl:grid-cols-[40%_20%_40%]'
                  : 'xl:grid-cols-[60%_40%]'
              }`}
            >
              <div className="">
                <Link href={product?.url}>
                  <p className="text-left text-[1rem] font-normal leading-[2rem] tracking-[0.009375rem] text-[#353535]">
                    {product?.name}
                  </p>
                </Link>
                {changeTheProtectedPosition?.length == 0 && (
                  <div className="modifier-options flex min-w-full max-w-[600px] flex-wrap gap-2 sm:min-w-[300px]">
                    <div className="cart-options flex flex-wrap gap-2">
                      <p className="text-left text-[0.875rem] font-bold uppercase leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                        SKU: {product?.sku}
                      </p>
                    </div>
                  </div>
                )}

                {/* promotion */}

                {/* <Promotion
                  promotions={promotions}
                  product_id={product.entityId}
                  brand_id={brandId}
                  category_ids={categoryIds}
                  free_shipping={isFreeShipping}
                /> */}
                
                {changeTheProtectedPosition?.length > 0 && (
                  <div className="modifier-options flex min-w-full max-w-[600px] flex-wrap gap-2">
                    <div className="cart-options">
                      <p className="inline text-left text-[0.875rem] font-bold uppercase leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                        SKU: {product.sku}
                        {changeTheProtectedPosition.length > 0 && (
                          <span className="text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                            |
                          </span>
                        )}
                      </p>
                      {changeTheProtectedPosition?.map((selectedOption: any, index: number) => {
                        let pipeLineData = '';
                        if (index < changeTheProtectedPosition.length - 1) {
                          pipeLineData = '|';
                        }
                        let displayValue = selectedOption.value;
                        if (selectedOption.name === 'Fabric Color') {
                          displayValue = selectedOption.value.split('|')[0]?.trim();
                        }
                        switch (selectedOption.__typename) {
                          case 'CartSelectedMultipleChoiceOption':
                            return (
                              <div key={selectedOption.entityId} className="inline">
                                <span className="text-left text-[0.875rem] font-bold leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                                  {`${selectedOption?.name}: `}
                                </span>
                                <span className="ml-1.5 mr-1.5 text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#7F7F7F]">
                                  {displayValue}
                                </span>

                                {pipeLineData && (
                                  <span className="text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                                    {pipeLineData}
                                  </span>
                                )}
                              </div>
                            );
                          case 'CartSelectedCheckboxOption':
                            return (
                              <div key={selectedOption.entityId} className="inline">
                                <span className="text-left text-[0.875rem] font-bold leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                                {`${selectedOption?.name}: `}
                                </span>
                                <span className="ml-1.5 mr-1.5 text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#7F7F7F]">
                                  {displayValue}
                                </span>

                                {pipeLineData && (
                                  <span className="text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                                    {pipeLineData}
                                  </span>
                                )}
                              </div>
                            );

                          case 'CartSelectedNumberFieldOption':
                            return (
                              <div key={selectedOption.entityId} className="inline">
                                <span className="font-semibold"> {`${selectedOption?.name}: `}</span>
                                <span>{selectedOption?.number}</span>
                                {pipeLineData && (
                                  <span className="text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                                    {pipeLineData}
                                  </span>
                                )}
                              </div>
                            );

                          case 'CartSelectedMultiLineTextFieldOption':
                          case 'CartSelectedTextFieldOption':
                            return (
                              <div key={selectedOption.entityId} className="flex items-center">
                                <span className="font-semibold"> {`${selectedOption?.name}: `}</span>
                                <span>{selectedOption?.text}</span>
                                {pipeLineData && (
                                  <span className="text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                                    {pipeLineData}
                                  </span>
                                )}
                              </div>
                            );

                          case 'CartSelectedDateFieldOption':
                            return (
                              <div key={selectedOption?.entityId} className="flex items-center">
                                <span className="font-semibold"> {`${selectedOption?.name}: `}</span>
                                <span>{format.dateTime(new Date(selectedOption?.date.utc))}</span>
                                {pipeLineData && (
                                  <span className="text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                                    {pipeLineData}
                                  </span>
                                )}
                              </div>
                            );

                          default:
                            return null;
                        }
                      })}

                      {product.variantEntityId && (
                        <FreeDelivery
                          entityId={product.productEntityId}
                          variantId={product.variantEntityId}
                          isFromPDP={false}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="">
                <div className="cart-deleteIcon relative flex flex-col gap-0 text-right sm:gap-2 md:items-end [&_.cart-item-delete]:absolute [&_.cart-item-delete]:right-0 [&_.cart-item-delete]:top-[50px] [&_.cart-item-delete]:sm:static [&_.cart-item-quantity]:mt-5 [&_.cart-item-quantity]:sm:mt-0">
                  <RemoveItem currency={currencyCode} product={product} />
                  {cookie_agent_login_status == true ? (
                    <div className="mb-0">
                      <div className="flex items-center gap-[3px] text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#353535]">
                        {product?.originalPrice.value &&
                        product?.originalPrice.value !== product?.listPrice.value ? (
                          <p className="line-through">
                            {format.number(product?.originalPrice?.value * product?.quantity, {
                              style: 'currency',
                              currency: currencyCode,
                            })}
                          </p>
                        ) : null}
                        {/* <p className="text-[12px] font-normal leading-[18px] tracking-[0.4px] text-[#5C5C5C]">
                          {discountPriceText}
                        </p> */}
                      </div>
                      <p className="text-left sm:text-right">
                        {format.number(product?.extendedSalePrice?.value, {
                          style: 'currency',
                          currency: currencyCode,
                        })}
                      </p>
                    </div>
                  ) : (
                    <div className="mb-0">
                      {product?.UpdatePriceForMSRP && product?.listPrice &&
                        (product?.UpdatePriceForMSRP?.warrantyApplied ? (
                          <p className="text-left sm:text-right">
                            {format.number(product.listPrice.value, {
                              style: 'currency',
                              currency: currencyCode,
                            })}
                          </p>
                        ) : product?.UpdatePriceForMSRP.hasDiscount === true ? (
                          <>
                            <p className="text-left sm:text-right">
                              {format.number(product.listPrice.value, {
                                style: 'currency',
                                currency: currencyCode,
                              })}
                            </p>
                            <div className="flex items-center gap-[3px] text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#353535]">
                              <p className="line-through">
                                {format.number(product.UpdatePriceForMSRP.originalPrice, {
                                  style: 'currency',
                                  currency: currencyCode,
                                })}
                              </p>
                              <p className="text-[12px] font-normal leading-[18px] tracking-[0.4px] text-[#5C5C5C]">
                                {product.UpdatePriceForMSRP.discount}% Off
                              </p>
                            </div>
                          </>
                        ) : (
                          <p className="text-left sm:text-right">
                            {format.number(product.UpdatePriceForMSRP.originalPrice, {
                              style: 'currency',
                              currency: currencyCode,
                            })}
                          </p>
                        ))}
                    </div>
                  )}

                  <ItemQuantity product={product} />
                </div>
              </div>
              {cookie_agent_login_status == true && (
                <div className="overflow-x-hidden xl:pl-[10px]">
                  <ProductPriceAdjuster
                    parentSku={priceAdjustData?.parent_sku}
                    sku={priceAdjustData?.sku}
                    oem_sku={priceAdjustData?.oem_sku}
                    productPrice={Number(product?.listPrice?.value)}
                    initialCost={Number(priceAdjustData?.cost)}
                    initialFloor={Number(priceAdjustData?.floor_percentage)}
                    initialMarkup={Number(product?.listPrice?.value)}
                    productId={product?.productEntityId}
                    cartId={cartId}
                    ProductType={'product'}
                    accessoriesData={product.updatedAccessories}
                    quantity={product?.quantity}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {product?.updatedAccessories?.length > 0 && (
        <div>
          {product?.updatedAccessories &&
            product?.updatedAccessories?.map((item: any, index: number) => {
              let oldPriceAccess = item?.UpdatePriceForMSRP?.originalPrice;
              let salePriceAccess = item?.listPrice.value;
              let discountedPrice: any = Number(
                100 - (salePriceAccess * 100) / oldPriceAccess,
              )?.toFixed(2);
              let discountPriceText: string = '';
              if (discountedPrice > 0) {
                discountPriceText = Math.round(discountedPrice) + '% Off';
              }
              return (
                <div
                  className="cart-accessories m-5 flex gap-4 bg-[#F3F4F5] p-[15px_20px]"
                  key={`${index}-${item?.entityId}`}
                >
                  <div className="flex w-full flex-col items-center md:flex-row">
                    <div className="g-[17px] flex w-full flex-shrink-[100] flex-row items-center p-0 md:w-[90%]">
                      <BcImage
                        alt={item.name}
                        height={75}
                        src={item?.image?.url}
                        width={75}
                        className="mr-[20px] h-[75px] w-[75px]"
                      />
                      <div className="flex flex-col items-start p-0">
                        <div>{item.name}</div>
                        <div className="flex flex-wrap items-center gap-[0px_10px] text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#7F7F7F]">
                          {item?.UpdatePriceForMSRP?.originalPrice &&
                          item?.UpdatePriceForMSRP?.originalPrice !==
                            item?.listPrice ? (
                            <p className="flex items-center tracking-[0.25px] line-through">
                                {format.number(oldPriceAccess * item.quantity, {
                                style: 'currency',
                                currency: currencyCode,
                              })}
                            </p>
                          ) : null}
                          <p className="text-[#353535]">
                            {format.number(salePriceAccess, {
                              style: 'currency',
                              currency: currencyCode,
                            })}
                          </p>
                          <p>{discountPriceText}</p>
                        </div>
                      </div>
                    </div>
                    <div className="cart-deleteIcon mt-[5px] flex w-full flex-row items-center justify-between gap-[20px] p-0 md:mt-0 md:w-auto md:justify-start [&_.cart-item-quantity]:static [&_.cart-item-quantity]:order-[0]">
                      <AccessoriesInputPlusMinus
                        key={item?.variantEntityId}
                        accessories={item}
                        data={product}
                      />
                      <div className="flex items-center">
                        <div className="flex items-center text-right text-[12px] font-normal leading-[18px] tracking-[0.4px] text-[#353535] sm:hidden">
                          QTY: {item.prodQuantity}
                        </div>
                        <RemoveAccessoryItem
                          currency={currencyCode}
                          cartId={cartId}
                          lineItemId={product?.entityId}
                          product={item}
                          deleteIcon={deleteIcon}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {getAllCommonSettinngsValues.hasOwnProperty(brandId) &&
        getAllCommonSettinngsValues?.[brandId]?.use_accessories && (
          <AccessoriesButton
            key={product?.entityId}
            closeIcon={closeIcon}
            blankAddImg={blankAddImg}
            fanPopup={fanPopup}
            discountRules={discountRules}
            product={product}
          />
        )}
    </li>
  );
};
