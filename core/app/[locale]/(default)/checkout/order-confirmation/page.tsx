'use server';

import { cookies } from 'next/headers';
import { imageManagerImageUrl } from '~/lib/store-assets';
import { getGuestOrderDetails, getOrderDetails } from './page-data';
import { OrderDetailsType } from '../../account/(tabs)/order/[slug]/page-data';
import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter, getTranslations } from 'next-intl/server';
import { PrintOrder } from '../print/print-order';
import { Suspense } from 'react';
import { GetCustomerGroupById } from '~/components/management-apis';
import {
  assembleProductData,
  ProductSnippet,
  ProductSnippetSkeleton,
} from '../../account/(tabs)/orders/_components/product-snippet';
import { getSessionCustomerAccessToken, getSessionUserDetails } from '~/auth';
import { UpdateCustomerId } from '../../sales-buddy/_actions/update-customer-id';
import { SendOrderToAlgolia } from './send-order-to-algolia';
import {
  CreateOrderMetaFields,
  GetCartMetaFields,
  GetOrderDetailsFromAPI,
  GetOrderMetaFields,
} from '~/components/management-apis';
import { KlaviyoIdentifyUser } from '~/belami/components/klaviyo/klaviyo-identify-user';

const emailImg = imageManagerImageUrl('emailicon.png', '16w');
const facebookImg = imageManagerImageUrl('facebook.png', '23w');
const googleImg = imageManagerImageUrl('google-logo.png', '23w');
const appleImg = imageManagerImageUrl('apple-logo.png', '24w');
const tikGreenImg = imageManagerImageUrl('tikgreen.png', '20w');

const mapOrderData = (order: OrderDetailsType) => {
  const shipping = order.consignments?.shipping
    ? removeEdgesAndNodes(order.consignments.shipping).map(
        ({ shipments, lineItems, ...otherItems }) => ({
          ...otherItems,
          lineItems: lineItems && removeEdgesAndNodes(lineItems),
          shipments: shipments && removeEdgesAndNodes(shipments),
        }),
      )
    : undefined;

  return {
    orderState: {
      orderId: order.entityId,
      status: order.status,
      orderDate: order.orderedAt,
    },
    summaryInfo: {
      subtotal: order.subTotal,
      discounts: order.discounts,
      shipping: order.shippingCostTotal,
      tax: order.taxTotal,
      grandTotal: order.totalIncTax,
      handlingCost: order.handlingCostTotal,
    },
    paymentInfo: {
      billingAddress: order.billingAddress,
      // TODO: add payments data
    },
    consignments: {
      shipping,
    },
  };
};

export default async function OrderConfirmation(request:any) {
  const cookieStore = await cookies();
  const orderId: number = Number(cookieStore.get('orderId')?.value);
  const cartId: any = cookieStore.get('cartId')?.value;
  const getCustomerIdfromCookie = cookieStore?.get('customer_id_for_agent')?.value;
  const domainName: any = cookieStore.get('domainName')?.value;

  let customerAccessToken = await getSessionCustomerAccessToken();

  const sessionUser = await getSessionUserDetails();
  let customerGroup;
  if (sessionUser) {
    const customerGroupId = sessionUser?.customerGroupId;
    const customerGroupDetails = await GetCustomerGroupById(customerGroupId);
    const parsedData = JSON.parse(customerGroupDetails);
    customerGroup = parsedData.name;
  }else{
    customerGroup = "Guest";
  }
  
  let guestUserCheck = 0;

  if (orderId) {
    let data: any = [];
    if (customerAccessToken) {
      data = await getOrderDetails({ filter: { entityId: orderId } });
    } else {
      data = await getGuestOrderDetails({ filter: { entityId: orderId, cartEntityId: cartId } });
      guestUserCheck = 1;
    }

    if (!data) {
      return null;
    }
    const orderData = mapOrderData(data);
    const t = await getTranslations('Account.Orders');
    const format = await getFormatter();
    const { orderState, summaryInfo, consignments, paymentInfo } = orderData;
    const shippingConsignments = consignments.shipping;
    const sumWithInitial: any = 0;
    const noOfItems = shippingConsignments?.[0]?.lineItems?.reduce(
      (accumulator, item) => accumulator + item?.quantity,
      sumWithInitial,
    );

    let shippingAddressData = shippingConsignments?.[0]?.shippingAddress;
    const { subtotal, shipping, tax, discounts, grandTotal, handlingCost } = summaryInfo;
    const { nonCouponDiscountTotal, couponDiscounts } = discounts;
    let regSubTotal = subtotal?.value;
    let youSave = 0;
    if (nonCouponDiscountTotal?.value > 0) {
      regSubTotal -= nonCouponDiscountTotal.value;
      youSave += nonCouponDiscountTotal.value;
    }
    couponDiscounts.map(({ discountedAmount }) => {
      regSubTotal -= discountedAmount.value;
      youSave += discountedAmount.value;
    });

    const updateCustomerApi =
      getCustomerIdfromCookie !== undefined &&
      (await UpdateCustomerId(getCustomerIdfromCookie, orderState?.orderId));  
    const lineItems = shippingConsignments?.map((consignment: any) => consignment.lineItems) || [];

    let getCartMetaFields: any = await GetCartMetaFields(cartId);
    const accessoriesMetaField = getCartMetaFields.filter(
      (metaField: any) => metaField.namespace === 'accessories_data',
    );
    const referrerId = cookieStore.get('referrerId')?.value;

    const OrderCommentsByAgent = getCartMetaFields.filter((metaField: any) => metaField.namespace === 'order_comments_by_agent')
    .map((metaField: any)=> metaField.value)[0];

    const agentInfo = JSON.parse(getCartMetaFields.filter((metaField: any)=> metaField.namespace === 'agent_cart_information')
    .map((metaField: any)=> metaField.value)[0]);

    const orderDetails = await GetOrderDetailsFromAPI(orderId);
    const shippingDetails = orderDetails?.consignments[0]?.shipping[0];
    const lineItemDetails = shippingDetails.line_items;
  
    const orderPageData = {
      OrderNumber: orderData?.orderState?.orderId,
      ExternalOrderID: null,
      CustomerID: orderDetails?.customer_id,
      OrderDateUTC: orderData?.orderState?.orderDate.utc,
      GiftRecipt: false,
      ShippingMethod: shippingDetails?.shipping_method,
      ShippingInstructions: null,
      OrderSource: domainName+"/"+orderDetails?.channel_id,
      Custom1: customerGroup,
      Custom2: agentInfo?.name,
      Custom3: null,
      Custom4: 'quote id',
      Custom5: 'vertical name',
      Custom6: 'who placed the order',
      Custom7: referrerId,
      Custom8: '',
      Custom9: '',
      Custom10: '',
      accessoriesData: accessoriesMetaField.map((eachAccessory: any) => ({
        key: eachAccessory.key,
        value: eachAccessory.value,
      })),
      OrderComments: OrderCommentsByAgent,
      OrderItems: lineItemDetails.map((item: any) => {
        let custom2Value = item?.variant_id || ''; 
        item.product_options?.forEach((option: any) => {
          if (option.display_name === "Finish Color") {
            custom2Value += (custom2Value ? '/' : '') + option.display_value;
          }
        });
        return {
          ExternalItemID: null,
          OrderItemTypeID: item.product_id === 0 ? 'CustomItem' : 'Regular Item',
          GTIN: null,
          SKU: item?.sku,
          Price: Number(item?.price_ex_tax).toFixed(2),
          Custom1: item.name,
          Custom2: custom2Value,  
          Custom3: item.brand,
          Custom4: 'extimated delivery date',
          Custom5: 'closeout',
        };
      }),
    };   

    let existingOrderMeta: any = await GetOrderMetaFields(orderId);

    if (!existingOrderMeta || existingOrderMeta.length === 0) {
        const postData = {
          permission_set: 'write_and_sf_access',
          namespace: 'order_details',
          key: 'order_details',
          value: JSON.stringify(orderPageData),
          description: 'order_page_details',
        };
        try {
          await CreateOrderMetaFields(orderId, postData);
        } catch (error) {
          console.error("Error creating order meta field:", error);
        }
      }

    let updatedLineItemInfo: any = [];
    let updatedLineItemWithoutAccessories: any = [];
    let accessoriesSkuArray: any = [];
    let productId: any;

    if (getCartMetaFields?.length > 0) {
      lineItems.map((data: any) => {
        data?.forEach((item: any) => {
          let accessoriesData: any = [];
          let findAccessories = accessoriesMetaField?.find((acces: any) => {
            const description = JSON.parse(acces.description);
            productId = description?.[0]?.productId;
            return productId == item.productEntityId;
          });
          if (findAccessories) {
            let getAccessoriesInfo = findAccessories?.value
              ? JSON?.parse(findAccessories?.value)
              : [];
            if (getAccessoriesInfo?.length > 0) {
              getAccessoriesInfo?.forEach((getInfo: any) => {
                !accessoriesSkuArray?.includes(getInfo?.variantId)
                  ? accessoriesSkuArray.push(getInfo?.variantId)
                  : '';
                let accessoriesInfo = data.map((line: any) => {
                  const variants =
                    line?.baseCatalogProduct?.variants &&
                    removeEdgesAndNodes(line?.baseCatalogProduct?.variants);
                  if (variants) {
                    const matchingVariants = variants.filter(
                      (id: any) => id?.entityId == getInfo?.variantId,
                    );
                    if (matchingVariants.length > 0) {
                      return line;
                    }
                  }
                  return null;
                });
                accessoriesInfo = accessoriesInfo.filter(
                  (line: any) => line !== null && line !== undefined,
                );
                if (accessoriesInfo && accessoriesInfo.length > 0) {
                  accessoriesInfo.forEach((info: any) => {
                    let accessSpreadData: any = { ...info };
                    if (accessSpreadData) {
                      accessSpreadData.prodQuantity = getInfo.quantity;
                      accessSpreadData.cartId = cartId;
                      accessSpreadData.lineItemId = item?.productEntityId;
                      accessoriesData.push(accessSpreadData);
                    }
                    return '';
                  });
                }
              });
            }
          }

          if (accessoriesData?.length > 0) {
            const uniqueObjects = accessoriesData.filter(
              (item: any, index: any, self: any) =>
                index === self.findIndex((t: any) => t.entityId === item.entityId),
            );
            item.accessories = uniqueObjects;
          }
          const variants = item?.baseCatalogProduct?.variants?.edges;
          const foundVariant = variants?.find((id: any) => id?.node?.entityId);
          if (
            foundVariant &&
            !accessoriesSkuArray?.includes(foundVariant?.node?.entityId) &&
            item?.productEntityId === productId
          ) {
            updatedLineItemInfo.push(item);
          }
        });
      });
    } else {
      getCartMetaFields = [];
      updatedLineItemInfo = lineItems;
    }
    updatedLineItemInfo?.forEach((item: any) => {
      const variants = item?.baseCatalogProduct?.variants?.edges;
      const foundVariant = variants?.find((id: any) => id?.node?.entityId);
      if (
        foundVariant &&
        !accessoriesSkuArray?.includes(foundVariant?.node?.entityId) &&
        item?.productEntityId === productId
      ) {
        updatedLineItemWithoutAccessories.push(item);
      }
    });
    return (
      <div className="mb-[2rem] mt-[1rem] flex flex-col justify-around gap-[30px] px-[20px] lg:mt-[3rem] lg:flex-row lg:gap-[50px]">
        <div className="flex w-full flex-col items-start gap-[30px] p-[0px] lg:w-[calc((800/1600)*100vw)] lg:p-[0px_40px]">
          <div className="flex flex-col items-start gap-[10px] p-[0px]">
            <div className="flex w-full items-center justify-center gap-[7px] xsm:w-[unset] xsm:justify-normal">
              <img
                src={tikGreenImg}
                className="relative top-[6px] self-start"
                width={20}
                height={20}
                alt="Tik"
              />
              <p className="flex items-center text-[20px] font-[500] leading-[32px] tracking-[0.15px] text-[#353535] xsm:text-[24px] xsm:font-[400] xsm:-tracking-normal">
                Your order has been placed
              </p>
            </div>
            <SendOrderToAlgolia lineItems={shippingConsignments?.[0]?.lineItems} />
            <KlaviyoIdentifyUser
              user={
                sessionUser && sessionUser.user && sessionUser.user?.email
                  ? ({
                      email: sessionUser.user.email,
                      first_name: sessionUser.user?.firstName,
                      last_name: sessionUser.user?.lastName,
                    } as any)
                  : null
              }
            />
            <p className="flex flex-col">
              <span className="text-center text-[16px] font-[400] leading-[32px] tracking-[0.5px] text-[#353535] xsm:text-left xsm:tracking-[0.15px]">
                We have received your order. You will receive an email confirmation at
              </span>
              <span className="text-center text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#008BB7] xsm:text-left sm:tracking-[0.15px] lg:font-[700] lg:text-[#353535]">
                {paymentInfo?.billingAddress?.email}
              </span>
            </p>
          </div>
          <div className="flex min-h-[400px] w-full flex-row items-center justify-center gap-[10px] bg-[#F3F4F5] p-0 lg:hidden">
            <p className="text-center text-[34px] font-normal leading-[46px] tracking-[0.25px] text-[#353535]">
              Rewards Summary Placeholder
            </p>
          </div>
          <div className="mt-[-10px] flex w-full flex-col items-center justify-between gap-[20px] border-b border-[#d6d6d6] pb-[8px] xsm:mt-[0px] xsm:flex-row">
            <p className="text-[24px] font-[400] leading-[32px] text-[#353535]">Order Summary</p>
            <div className="flex items-center gap-[5px]">
              <PrintOrder
                from="order"
                orderId={orderState?.orderId}
                guestUser={guestUserCheck}
                cartId={cartId}
                key={orderState?.orderId}
              />
            </div>
          </div>
          <div className="flex flex-col items-start gap-[5px]">
            <p className="text-[16px] font-[400] leading-[32px] tracking-[0.15px] text-[#353535]">
              Confirmation Number:{' '}
              <span className="text-[16px] font-[600] leading-[32px] tracking-[0.15px] text-[#353535]">
                {orderState?.orderId}
              </span>
            </p>
            <p className="text-[16px] font-[400] leading-[32px] tracking-[0.15px] text-[#353535]">
              Order Date:{' '}
              <span className="text-[16px] font-[600] leading-[32px] tracking-[0.15px] text-[#353535]">
                {format.dateTime(new Date(orderState?.orderDate?.utc), {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                })}
              </span>
            </p>
          </div>
          <div className="flex flex-col items-start gap-[20px]">
            <div>
              <p className="text-[16px] font-normal leading-[32px] tracking-[0.15px] text-[#353535]">
                Customer Contact
              </p>
              <p className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#353535]">
                {paymentInfo?.billingAddress?.email}
              </p>
            </div>
            <div>
              <p className="text-[16px] font-normal leading-[32px] tracking-[0.15px] text-[#353535]">
                Shipping Address
              </p>
              <div>
                <p className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#353535]">
                  {shippingAddressData?.firstName} {shippingAddressData?.lastName}
                </p>
                <p className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#353535]">
                  {shippingAddressData?.address1}
                </p>
                <p className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#353535]">
                  {shippingAddressData?.city}
                </p>
                <p className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#353535]">
                  {shippingAddressData?.stateOrProvince}, {shippingAddressData?.countryCode}{' '}
                  {shippingAddressData?.postalCode}
                </p>
              </div>
            </div>
            <div>
              <p className="text-[16px] font-normal leading-[32px] tracking-[0.15px] text-[#353535]">
                Billing Address
              </p>
              <div>
                <p className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#353535]">
                  {paymentInfo?.billingAddress?.firstName} {paymentInfo?.billingAddress?.lastName}
                </p>
                <p className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#353535]">
                  {paymentInfo?.billingAddress?.address1}
                </p>
                <p className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#353535]">
                  {paymentInfo?.billingAddress?.city}
                </p>
                <p className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#353535]">
                  {paymentInfo?.billingAddress?.stateOrProvince},{' '}
                  {paymentInfo?.billingAddress?.countryCode}{' '}
                  {paymentInfo?.billingAddress?.postalCode}
                </p>
              </div>
            </div>
            {/*} <div className='flex items-start gap-[7px]'>
              <p className="text-[16px] font-normal leading-[32px] tracking-[0.15px] text-[#353535]">
                Payment
              </p>
              <img src={tikGreenImg} className='relative !top-[5px]' alt="Tik img" />
            </div>*/}
          </div>
          <div className="flex w-full flex-col">
            <p className="text-[20px] font-medium leading-[32px] tracking-[0.15px] text-[#002A37]">
              <span>Order Total: </span>
              <span>
                {format.number(grandTotal.value, {
                  style: 'currency',
                  currency: grandTotal.currencyCode,
                })}
              </span>
            </p>
            <p className="flex flex-row items-center justify-between border-b border-[#E8E7E7] text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
              <span>Reg. Subtotal </span>
              <span>
                {format.number(subtotal.value, {
                  style: 'currency',
                  currency: subtotal.currencyCode,
                })}
              </span>
            </p>
            {nonCouponDiscountTotal.value > 0 && (
              <p className="flex flex-row items-center justify-between border-b border-[#E8E7E7] text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
                <span>Discounts </span>
                <span className="text-[#008BB7]">
                  -
                  {format.number(nonCouponDiscountTotal.value, {
                    style: 'currency',
                    currency: nonCouponDiscountTotal.currencyCode,
                  })}
                </span>
              </p>
            )}
            {couponDiscounts.map(({ couponCode, discountedAmount }, index) => (
              <p
                className="flex flex-row items-center justify-between border-b border-[#E8E7E7] text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]"
                key={index}
              >
                <span>{t('orderAppliedCoupon', { code: couponCode })} </span>
                <span>
                  -
                  {format.number(discountedAmount.value, {
                    style: 'currency',
                    currency: discountedAmount.currencyCode,
                  })}
                </span>
              </p>
            ))}
            {youSave > 0 && (
              <p className="flex flex-row items-center justify-between border-b border-[#E8E7E7] text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
                <span>You Save </span>
                <span className="text-[#008BB7]">
                  {format.number(youSave, {
                    style: 'currency',
                    currency: subtotal.currencyCode,
                  })}
                </span>
              </p>
            )}
            <p className="flex flex-row items-center justify-between border-b border-[#E8E7E7] text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
              <span>Subtotal </span>
              <span>
                {format.number(regSubTotal, {
                  style: 'currency',
                  currency: subtotal.currencyCode,
                })}
              </span>
            </p>
            <p className="flex flex-row items-center justify-between border-b border-[#E8E7E7] text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
              <span>Shipping </span>
              <span>
                {shipping.value > 0
                  ? format.number(shipping.value, {
                      style: 'currency',
                      currency: shipping.currencyCode,
                    })
                  : 'FREE'}
              </span>
            </p>
            {handlingCost.value > 0 && (
              <p className="flex flex-row items-center justify-between border-b border-[#E8E7E7] text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
                <span>Freight & Handling </span>
                <span>
                  {format.number(handlingCost.value, {
                    style: 'currency',
                    currency: handlingCost.currencyCode,
                  })}
                </span>
              </p>
            )}
            <p className="flex flex-row items-center justify-between border-b border-[#E8E7E7] text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
              <span>Tax </span>
              <span>
                {format.number(tax.value, {
                  style: 'currency',
                  currency: tax.currencyCode,
                })}
              </span>
            </p>
            <p className="flex flex-row items-center justify-between border-b border-[#E8E7E7] text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
              <span>Total </span>
              <span>
                {format.number(grandTotal.value, {
                  style: 'currency',
                  currency: grandTotal.currencyCode,
                })}
              </span>
            </p>
          </div>
          <div>
            <p className="text-[24px] font-normal leading-[32px] text-[#353535]">
              Items In Your Order <span>({noOfItems})</span>
            </p>
          </div>
          <div className={`flex w-full flex-col items-start gap-[10px]`}>
            {shippingConsignments?.map((consignment, idx) => {
              const { lineItems } = consignment;
              const validLineItems = Array.isArray(lineItems)
                ? lineItems.filter((item) => item)
                : [];
              const accessoryProductEntityIds = new Set();
              validLineItems.forEach((lineItem) => {
                if (lineItem?.accessories && lineItem?.accessories?.length > 0) {
                  lineItem?.accessories.forEach((accessory: any) => {
                    accessoryProductEntityIds.add(accessory.productEntityId);
                  });
                }
              });
              const filteredLineItems = validLineItems.filter((lineItem) => {
                return !accessoryProductEntityIds.has(lineItem.productEntityId);
              });
              return (
                <div key={idx}>
                  <ul className="flex flex-col gap-[30px]">
                    {filteredLineItems.map((shipment) => {
                      return (
                        <li key={shipment.entityId}>
                          <Suspense fallback={<ProductSnippetSkeleton isExtended={true} />}>
                            <ProductSnippet
                              imagePriority={true}
                              imageSize="square"
                              isExtended={true}
                              product={assembleProductData(shipment)}
                              from="order"
                            />
                          </Suspense>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex w-full flex-col-reverse items-start gap-[40px] p-[0px] lg:w-[calc((500/1600)*100vw)] lg:flex-col lg:px-[40px]">
          {customerAccessToken && (
            <>
              <div className="hidden w-full flex-row items-center justify-center gap-[10px] bg-[#F3F4F5] p-0 lg:flex lg:min-h-[400px]">
                <p className="text-center text-[34px] font-normal leading-[46px] tracking-[0.25px] text-[#353535]">
                  Rewards Summary Placeholder
                </p>
              </div>
              <div className="flex flex-col gap-[3px]">
                <p className="text-[20px] font-[500] leading-[32px] tracking-[0.15px] text-[#353535]">
                  Something Wrong?
                </p>
                <p>
                  <a className="text-[20px] font-[400] leading-[32px] tracking-[0.15px] text-[#008db8] underline">
                    Update Contact or Delivery
                  </a>
                </p>
                <p>
                  <a className="text-[20px] font-[400] leading-[32px] tracking-[0.15px] text-[#008db8] underline">
                    Cancel Order
                  </a>
                </p>
                <p>
                  <a className="text-[20px] font-[400] leading-[32px] tracking-[0.15px] text-[#008db8] underline">
                    Contact an Agent
                  </a>
                </p>
              </div>
            </>
          )}
          {!customerAccessToken && (
            <div className="flex w-full flex-col items-start gap-[20px] p-0">
              <p className="w-full text-center text-[20px] font-[500] leading-[32px] tracking-[0.15px] text-[#353535] lg:text-left">
                Save Your Details for Next Time:
              </p>
              <div className="flex w-full flex-col gap-[20px] p-0">
                <button className="flex h-[54px] flex-row items-center justify-center gap-[10px] rounded-[5px] bg-[#002A37] shadow-[0px_0px_3px_rgba(0,0,0,0.084),0px_2px_3px_rgba(0,0,0,0.168)]">
                  <img src={emailImg} alt="e-mail" />
                  <p className="text-[20px] font-[500] leading-[32px] tracking-[0.15px] text-[#FFFFFF]">
                    Continue with Email
                  </p>
                </button>
                <p className="text-center text-[16px] font-[400] leading-[32px] tracking-[0.15px] text-[#353535] lg:text-left">
                  Or, Sign in with an Existing Account
                </p>
                <div className="flex flex-col gap-[20px]">
                  <button className="flex h-[54px] flex-row items-center justify-center gap-[10px] rounded-[5px] bg-[#1877F2]">
                    <img src={facebookImg} alt="facebook" />
                    <p className="text-[20px] font-[700] leading-[23px] text-[#FFFFFF]">
                      Log in with Facebook
                    </p>
                  </button>
                  <button className="flex h-[54px] flex-row items-center justify-center gap-[10px] rounded-[5px] bg-[#FFFFFF] shadow-[0px_0px_3px_rgba(0,0,0,0.084),0px_2px_3px_rgba(0,0,0,0.168)]">
                    <img src={googleImg} alt="google" />
                    <p className="text-[rgba(0,0,0,0.54) text-[20px] font-[500] leading-[23px]">
                      Log in with Google
                    </p>
                  </button>
                  <button className="flex h-[54px] flex-row items-center justify-center gap-[10px] rounded-[5px] bg-[#353535] shadow-[0px_0px_3px_rgba(0,0,0,0.084),0px_2px_3px_rgba(0,0,0,0.168)]">
                    <img src={appleImg} alt="apple" />
                    <p className="text-[20px] font-[500] leading-[24px] text-[#FFFFFF]">
                      Log in with Apple
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
