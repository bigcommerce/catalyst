'use server';

import { cookies } from 'next/headers';
import { imageManagerImageUrl } from '~/lib/store-assets';
import { getGuestOrderDetails, getOrderDetails } from './page-data';
import { OrderDetailsType } from '../../account/(tabs)/order/[slug]/page-data';
import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter, getTranslations } from 'next-intl/server';
import { PrintOrder } from '../print/print-order';
import { Suspense } from 'react';
import { assembleProductData, ProductSnippet, ProductSnippetSkeleton } from '../../account/(tabs)/orders/_components/product-snippet';
import { getSessionCustomerAccessToken } from '~/auth';

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
        lineItems: removeEdgesAndNodes(lineItems),
        shipments: removeEdgesAndNodes(shipments),
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
      handlingCost: order.handlingCostTotal
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

export default async function OrderConfirmation() {
  const cookieStore = await cookies();
  const orderId: number = Number(cookieStore.get('orderId')?.value);
  const cartId: any = cookieStore.get('cartId')?.value;
  const customerAccessToken = await getSessionCustomerAccessToken();
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

    return (
      <div className="lg:mt-[3rem] mt-[1rem] mb-[2rem] flex lg:flex-row justify-around gap-[30px] lg:gap-[50px] px-[20px] flex-col">
        <div className="flex w-full lg:w-[calc((800/1600)*100vw)] flex-col items-start gap-[30px] p-[0px] lg:p-[0px_40px]">
          <div className="flex flex-col items-start gap-[10px] p-[0px]">
            <div className="flex items-center gap-[7px] w-full justify-center xsm:justify-normal xsm:w-[unset]">
              <img src={tikGreenImg} className='relative self-start top-[6px]' width={20} height={20} alt="Tik" />
              <p className="flex items-center xsm:text-[24px] xsm:font-[400] xsm:-tracking-normal leading-[32px] text-[#353535] text-[20px] font-[500] tracking-[0.15px]">
                Your order has been placed
              </p>
            </div>
            <p className="flex flex-col">
              <span className="text-[16px] font-[400] leading-[32px] xsm:tracking-[0.15px] tracking-[0.5px] text-[#353535] text-center xsm:text-left">
                We have received your order. You will receive an email conformation at
              </span>
              <span className="text-[16px] lg:font-[700] font-normal text-[#008BB7] text-center xsm:text-left leading-[32px] sm:tracking-[0.15px] tracking-[0.5px] lg:text-[#353535]">
                {paymentInfo?.billingAddress?.email}
              </span>
            </p>
          </div>
          <div className='flex flex-row lg:hidden justify-center items-center p-0 gap-[10px] bg-[#F3F4F5] w-full min-h-[400px]'>
            <p className='font-normal text-[34px] leading-[46px] text-center tracking-[0.25px] text-[#353535]'>Rewards Summary Placeholder</p>
          </div>
          <div className="flex w-full mt-[-10px] xsm:mt-[0px] items-center flex-col xsm:flex-row justify-between gap-[20px] border-b border-[#d6d6d6] pb-[8px]">
            <p className="text-[24px] font-[400] leading-[32px] text-[#353535]">Order Summary</p>
            <div className="flex items-center gap-[5px]">
              <PrintOrder from='order' orderId={orderState?.orderId} guestUser={guestUserCheck} cartId={cartId} key={orderState?.orderId} />
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
                  {shippingAddressData?.stateOrProvince}, {shippingAddressData?.countryCode} {shippingAddressData?.postalCode}
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
                  {paymentInfo?.billingAddress?.stateOrProvince}, {paymentInfo?.billingAddress?.countryCode} {paymentInfo?.billingAddress?.postalCode}
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
              <span>{format.number(grandTotal.value, {
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
                <span className="text-[#008BB7]">-
                  {format.number(nonCouponDiscountTotal.value, {
                    style: 'currency',
                    currency: nonCouponDiscountTotal.currencyCode,
                  })}
                </span>
              </p>
            )}
            {couponDiscounts.map(({ couponCode, discountedAmount }, index) => (
              <p className="flex flex-row items-center justify-between border-b border-[#E8E7E7] text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]" key={index}>
                <span>{t('orderAppliedCoupon', { code: couponCode })} </span>
                <span>-
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
                {shipping.value > 0 ? format.number(shipping.value, {
                  style: 'currency',
                  currency: shipping.currencyCode,
                }) : 'FREE'}
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
              return (
                <>
                  <ul className="flex flex-col gap-[30px]">
                    {lineItems.map((shipment) => {
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
                </>
              )
            })}
          </div>
        </div>
        <div className="flex w-full lg:w-[calc((500/1600)*100vw)] lg:flex-col flex-col-reverse items-start gap-[40px] p-[0px] lg:px-[40px]">
          {customerAccessToken && (
            <>
              <div className='lg:flex flex-row hidden justify-center items-center p-0 gap-[10px] bg-[#F3F4F5] w-full lg:min-h-[400px]'>
                <p className='font-normal text-[34px] leading-[46px] text-center tracking-[0.25px] text-[#353535]'>Rewards Summary Placeholder</p>
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
              <p className="text-[20px] font-[500] text-center w-full lg:text-left leading-[32px] tracking-[0.15px] text-[#353535]">
                Save Your Details for Next Time:
              </p>
              <div className="flex w-full flex-col gap-[20px] p-0">
                <button className="flex h-[54px] flex-row items-center justify-center gap-[10px] rounded-[5px] bg-[#002A37] shadow-[0px_0px_3px_rgba(0,0,0,0.084),0px_2px_3px_rgba(0,0,0,0.168)]">
                  <img src={emailImg} alt="e-mail" />
                  <p className="text-[20px] font-[500] leading-[32px] tracking-[0.15px] text-[#FFFFFF]">
                    Continue with Email
                  </p>
                </button>
                <p className="text-[16px] font-[400] leading-[32px] text-center lg:text-left tracking-[0.15px] text-[#353535]">
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