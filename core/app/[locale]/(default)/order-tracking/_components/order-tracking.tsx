'use client';
import { Suspense, useEffect, useState } from 'react';
import { StillNeedContactUs } from '../../account/(tabs)/orders/_components/stillneed-contactus';
import { getGuestOrderDetails, getOrderDetails } from '~/components/graphql-apis';
import { getGuestOrderDetailsFromAPI } from '~/components/management-apis';
import { useFormatter, useTranslations } from 'next-intl';
import { Button } from '~/components/ui/button';
import { Link } from '~/i18n/routing';
import { BcImage } from '~/components/bc-image';
import { PrintOrder } from '../../checkout/print/print-order';
import { Breadcrumbs as ComponentsBreadcrumbs } from '~/components/ui/breadcrumbs';
import chevronRight from '~/public/orders/chevronRight.svg';

interface ManageOrderButtonsProps {
  className: string;
  orderId: number;
  orderTrackingUrl?: string;
  orderStatus: string | null;
  orderData: any;
  setShowOrderSummary: any;
}

const OrderDetails = ({
  orderId,
  orderDate,
  orderPrice,
  orderStatus,
  cartId,
  guestUserCheck,
}: {
  orderId: number;
  orderDate: string;
  orderPrice: {
    value: number;
    currencyCode: string;
  };
  orderStatus: string;
  cartId: string;
  guestUserCheck: any;
}) => {
  const t = useTranslations('Account.Orders');
  const format = useFormatter();

  const statusBgClassMap: { [key: string]: string } = {
    processed: 'bg-[#E7F5F8]',
    delayed: 'bg-[#E5BFBC]',
    processing: 'bg-[#F3F4F5]',
    shipped: 'bg-[#008BB7]',
    delivered: 'bg-[#1DB14B]',
    'return started': 'bg-[#FBF4E9]',
    returned: 'bg-[#002A37]',
  };

  const statusTextClassMap: { [key: string]: string } = {
    'return started': 'text-[#6A4C1E]',
    shipped: 'text-white',
    delivered: 'text-white',
    returned: 'text-white',
  };

  const buttonBgClass = statusBgClassMap[orderStatus.toLowerCase()] || 'bg-[#E7F5F8]';
  const buttonTextClass = statusTextClassMap[orderStatus.toLowerCase()] || 'text-[#353535]';

  return (
    <>
      <div className="w-full bg-[#03465C] p-[10px]">
        <button
          className={`flex h-[32px] flex-row items-center justify-center gap-[10px] rounded-full p-[0px_10px] text-[16px] font-normal leading-[32px] ${buttonBgClass} ${buttonTextClass}`}
        >
          {orderStatus}
        </button>
      </div>
      <div className="flex w-full flex-col items-start gap-[15px] p-[0px_20px]">
        <div className="flex w-full flex-col justify-between sm:flex-row">
          <div className="sm:justify-[unset] inline flex-row items-center justify-center gap-[5px] text-center text-[16px] font-normal leading-[32px] tracking-[0.15px] sm:flex">
            <span>
              {format.dateTime(new Date(orderDate), {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span>
              {' '}
              | {t('orderNumber')}
              {orderId}
            </span>
          </div>
          <div className="sm:justify-[unset] inline flex-row items-center justify-center gap-[5px] text-center text-[16px] font-normal leading-[32px] tracking-[0.15px] sm:flex [&>button]:ml-[5px] [&>button]:inline [&>button]:sm:ml-0 [&>span]:inline [&>svg]:ml-[5px] [&>svg]:inline [&>svg]:sm:ml-0">
            <span>
              {t('orderTotal')}:
              {format.number(orderPrice.value, {
                style: 'currency',
                currency: orderPrice.currencyCode,
              })}{' '}
              |
            </span>
            <PrintOrder
              from="order"
              orderId={orderId}
              guestUser={guestUserCheck}
              cartId={cartId}
              key={orderId}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const ManageOrderButtons = ({
  className,
  orderId,
  orderStatus,
  orderTrackingUrl,
  orderData,
  setShowOrderSummary,
}: ManageOrderButtonsProps) => {
  const t = useTranslations('Account.Orders');
  const getOrderDetails = () => {
    setShowOrderSummary(1);
  };

  return (
    <div className="flex w-full flex-[0.5] flex-col gap-[5px] xl:w-[unset]">
      {Boolean(orderTrackingUrl) && (
        <Button
          aria-label={t('trackOrder')}
          asChild
          className="flex min-h-[42px] w-full flex-row items-center justify-center rounded-[3px] bg-[#008BB7] p-[5px_10px] text-[14px] font-medium uppercase leading-[32px] tracking-[1.25px] text-[#fff]"
          variant="secondary"
        >
          <Link href={{ pathname: orderTrackingUrl }}>{t('trackOrder')}</Link>
        </Button>
      )}
      <Button
        className="flex min-h-[42px] w-full flex-row items-center justify-center rounded-[3px] border border-[#B4DDE9] bg-white p-[5px_10px] text-[14px] font-medium uppercase leading-[32px] tracking-[1.25px] text-[#002A37] hover:bg-brand-50"
        aria-label={t('viewOrderDetails')}
        onClick={() => getOrderDetails()}
      >
        {t('viewOrderDetails')}
      </Button>
      {Boolean(orderStatus) && orderStatus === 'SHIPPED' && (
        <Button
          aria-label={t('returnOrder')}
          asChild
          className="flex min-h-[42px] w-full flex-row items-center justify-center rounded-[3px] border border-[#B4DDE9] bg-white p-[5px_10px] text-[14px] font-medium uppercase leading-[32px] tracking-[1.25px] text-[#002A37] hover:bg-brand-50"
          variant="secondary"
        >
          <Link href={{ pathname: '' }}>{t('returnOrder')}</Link>
        </Button>
      )}
    </div>
  );
};

const OrderList = ({
  orderData,
  cartId,
  setShowOrderSummary,
  guestUserCheck,
}: {
  orderData: any;
  cartId: string;
  setShowOrderSummary: any;
  guestUserCheck: Number;
}) => {
  let { orderState, paymentInfo, summaryInfo, consignments } = orderData;
  const shippingConsignments = consignments?.shipping;
  // NOTE: tracking url will be supported later
  const trackingUrl = shippingConsignments
    ? shippingConsignments
        .flatMap(({ shipments }) =>
          shipments.map((shipment) => {
            if (
              shipment.tracking?.__typename === 'OrderShipmentNumberAndUrlTracking' ||
              shipment.tracking?.__typename === 'OrderShipmentUrlOnlyTracking'
            ) {
              return shipment.tracking.url;
            }

            return null;
          }),
        )
        .find((url: any) => url !== null)
    : undefined;
  return (
    <>
      {
        <div
          className="flex flex-col items-start gap-[15px] border border-[#CCCBCB] p-0"
          key={orderState?.orderId}
        >
          <OrderDetails
            orderDate={orderState?.orderDate.utc}
            orderId={orderState?.orderId}
            orderPrice={summaryInfo?.grandTotal}
            orderStatus={orderState?.status.label}
            cartId={cartId}
            guestUserCheck={guestUserCheck}
          />
          <div className="flex w-full flex-col items-center justify-between gap-5 p-[0px_20px_20px_20px] xl:flex-row xl:gap-0">
            <div
              className="flex w-full flex-1 flex-row items-center gap-[40px] p-0 has-[.product-count-1]:flex-col sm:has-[.product-count-1]:flex-row xl:w-[unset]"
              key={`order-${orderState?.orderId}`}
            >
              {(shippingConsignments ?? []).map(({ lineItems }) => {
                let sumWithInitial: any = 0;
                let itemsCount = shippingConsignments?.[0]?.lineItems?.reduce(
                  (accumulator, item) => accumulator + item?.quantity,
                  sumWithInitial,
                );
                let className = '',
                  imageClass = '';
                let productCount = 1;
                let width = 150,
                  height = 150;
                if (itemsCount >= 3) {
                  className = 'flex h-[150px] w-[150px] flex-row flex-wrap gap-[10px] py-[5px]';
                  imageClass = 'h-[65px] w-[70px]';
                  width = 70;
                  height = 65;
                  productCount = 4;
                } else if (itemsCount == 2) {
                  className =
                    'flex h-[150px] w-[150px] [&>img]:w-[70px] xl:[&>img]:w-[150px] xl:w-[310px] flex-row gap-[10px]';
                  width = 150;
                  productCount = 2;
                } else if (itemsCount == 1) {
                  className =
                    'product-count-1 flex h-[150px] sm:w-[150px] flex-row gap-[10px] w-full';
                  width = 150;
                }
                return (
                  <>
                    <div className={className}>
                      {lineItems?.slice(0, productCount).map((shippedProduct: any) => {
                        return (
                          <BcImage
                            className={imageClass}
                            width={width}
                            height={height}
                            src={shippedProduct?.image?.url || undefined}
                            unoptimized={true}
                            alt={shippedProduct?.name}
                            key={`order-${orderState?.orderId}-${shippedProduct?.entityId}`}
                          />
                        );
                      })}
                    </div>
                    {itemsCount > 1 ? (
                      <div className="text-[20px] font-medium leading-[32px] tracking-[0.15px] text-[#000000]">
                        {itemsCount} Item{itemsCount > 1 ? 's' : ''}
                      </div>
                    ) : (
                      <div className="flex flex-1 flex-col items-start justify-center gap-[5px] p-0 xl:flex-[0.7]">
                        <div className="text-[16px] font-normal leading-[32px] tracking-[0.15px] text-black">
                          {lineItems?.[0]?.name}
                        </div>
                        <div className="text-[14px] font-bold leading-[24px] tracking-[0.25px] text-[#7f7f7f]">
                          <span>SKU: {lineItems?.[0]?.sku}</span>
                          {lineItems?.[0]?.productOptions?.length > 0 &&
                            lineItems?.[0]?.productOptions?.map(
                              (lineData: { name: string; value: string }, index: number) => {
                                let pipeLineData = ' | ';
                                if (index === lineItems[0].productOptions.length - 1) {
                                  pipeLineData = '';
                                }
                                const updatedValue =
                                  lineData?.name === "Fabric Color" || "Select Fabric Color"
                                    ? lineData?.value.split('|')[0]?.trim()
                                    : lineData?.value;
                                return (
                                  <span>
                                    {pipeLineData}
                                    {`${lineData?.name}: `}
                                    <span className="font-[400]">{updatedValue}</span>
                                  </span>
                                );
                              },
                            )}
                        </div>
                        <div className="text-[14px] font-bold leading-[24px] tracking-[0.25px] text-[#353535]">
                          QTY: {lineItems?.[0]?.quantity}
                        </div>
                      </div>
                    )}
                  </>
                );
              })}
            </div>
            <ManageOrderButtons
              className=""
              orderId={orderState?.orderId}
              orderStatus={orderState?.status.value}
              orderTrackingUrl={trackingUrl}
              orderData={orderData}
              setShowOrderSummary={setShowOrderSummary}
            />
          </div>
        </div>
      }
    </>
  );
};

const OrderSummaryInfo = ({ orderData }: { orderData: any }) => {
  const { orderState, summaryInfo, consignments, paymentInfo } = orderData;
  const t = useTranslations('Account.Orders');
  const format = useFormatter();
  const { subtotal, shipping, tax, discounts, grandTotal, handlingCost } = summaryInfo;
  const { nonCouponDiscountTotal, couponDiscounts } = discounts;
  const shippingConsignments = consignments.shipping;
  const sumWithInitial: any = 0;
  const noOfItems = shippingConsignments?.[0]?.lineItems?.reduce(
    (accumulator, item) => accumulator + item?.quantity,
    sumWithInitial,
  );
  let shippingAddressData = shippingConsignments?.[0]?.shippingAddress;
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
    <>
      <div className="border-b border-b-[#E8E7E7]">
        <div className="pb-1 text-[24px] font-normal leading-[32px] text-black">
          {t('orderSummary')}
        </div>
      </div>
      <div className="flex justify-between gap-[30px]">
        <div className="flex w-1/2 flex-col gap-[30px]">
          <div className="text-[16px] font-normal leading-[32px] tracking-[0.15px] text-black">
            <div>
              {t('confirmationNumber')}: <span className="font-[700]">{orderState?.orderId}</span>
            </div>
            <div>
              Order Date:{' '}
              <span className="font-[700]">
                {format.dateTime(new Date(orderState?.orderDate?.utc), {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-[20px]">
            <div>
              <div className="text-[16px] font-normal leading-[32px] tracking-[0.15px] text-black">
                Customer Contact
              </div>
              <div className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-black">
                {paymentInfo?.billingAddress?.email}
              </div>
            </div>
            <div className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-black">
              <div className="text-[16px] font-normal leading-[32px] tracking-[0.15px] text-black">
                {t('shippingAddress')}
              </div>
              <div>
                <div>
                  {shippingAddressData?.firstName} {shippingAddressData?.lastName}
                </div>
                <div>{shippingAddressData?.address1}</div>
                <div>{shippingAddressData?.city}</div>
                <div>
                  {shippingAddressData?.stateOrProvince}, {shippingAddressData?.countryCode}{' '}
                  {shippingAddressData?.postalCode}
                </div>
              </div>
            </div>
            <div className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-black">
              <div className="text-[16px] font-normal leading-[32px] tracking-[0.15px] text-black">
                {t('billingAddress')}
              </div>
              <div>
                <div>
                  {paymentInfo?.billingAddress?.firstName} {paymentInfo?.billingAddress?.lastName}
                </div>
                <div>{paymentInfo?.billingAddress?.address1}</div>
                <div>{paymentInfo?.billingAddress?.city}</div>
                <div>
                  {paymentInfo?.billingAddress?.stateOrProvince},{' '}
                  {paymentInfo?.billingAddress?.countryCode}{' '}
                  {paymentInfo?.billingAddress?.postalCode}
                </div>
              </div>
            </div>
            {/*<div className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-black">
                  <div className="text-[16px] font-normal leading-[32px] tracking-[0.15px] text-black">
                    Payment
                  </div>
                  <div>*** *** *** 1234</div>
                </div> */}
          </div>
        </div>
        <div className="flex w-1/2 flex-col gap-[3px] text-[16px] font-normal leading-[32px] tracking-[0.5px]">
          <div className="text-[20px] font-medium leading-[32px] tracking-[0.15px] text-[#002A37]">
            {t('orderTotal')}:{' '}
            {format.number(grandTotal.value, {
              style: 'currency',
              currency: grandTotal.currencyCode,
            })}
          </div>
          <div>
            <div className="flex justify-between border-b border-b-[#E8E7E7]">
              <div>{t('subTotalReg')}</div>
              <div>
                {format.number(subtotal.value, {
                  style: 'currency',
                  currency: subtotal.currencyCode,
                })}
              </div>
            </div>
            {nonCouponDiscountTotal.value > 0 && (
              <div className="flex justify-between border-b border-b-[#E8E7E7]">
                <div>{t('orderDiscount')}</div>
                <div className="text-[#008BB7]">
                  -
                  {format.number(nonCouponDiscountTotal.value, {
                    style: 'currency',
                    currency: nonCouponDiscountTotal.currencyCode,
                  })}
                </div>
              </div>
            )}
            {couponDiscounts.map(({ couponCode, discountedAmount }, index) => (
              <div className="flex justify-between border-b border-b-[#E8E7E7]" key={index}>
                <div>{t('orderAppliedCoupon', { code: couponCode })}</div>
                <div>
                  -
                  {format.number(discountedAmount.value, {
                    style: 'currency',
                    currency: discountedAmount.currencyCode,
                  })}
                </div>
              </div>
            ))}
            {youSave > 0 && (
              <div className="flex justify-between border-b border-b-[#E8E7E7]">
                <div>You Save</div>
                <div className="text-[#008BB7]">
                  {format.number(youSave, {
                    style: 'currency',
                    currency: subtotal.currencyCode,
                  })}
                </div>
              </div>
            )}
            <div className="flex justify-between border-b border-b-[#E8E7E7]">
              <div>{t('orderSubtotal')}</div>
              <div>
                {format.number(regSubTotal, {
                  style: 'currency',
                  currency: subtotal.currencyCode,
                })}
              </div>
            </div>
            <div className="flex justify-between border-b border-b-[#E8E7E7]">
              <div>{t('orderShipping')}</div>
              <div>
                {shipping.value > 0
                  ? format.number(shipping.value, {
                      style: 'currency',
                      currency: shipping.currencyCode,
                    })
                  : 'FREE'}
              </div>
            </div>
            {handlingCost.value > 0 && (
              <div className="flex justify-between border-b border-b-[#E8E7E7]">
                <div>{t('surcharge')}</div>
                <div>
                  {format.number(handlingCost.value, {
                    style: 'currency',
                    currency: handlingCost.currencyCode,
                  })}
                </div>
              </div>
            )}
            <div className="flex justify-between border-b border-b-[#E8E7E7]">
              <div>{t('orderTax')}</div>
              <div>
                {format.number(tax.value, {
                  style: 'currency',
                  currency: tax.currencyCode,
                })}
              </div>
            </div>
            <div className="flex justify-between border-b border-b-[#E8E7E7]">
              <div>{t('orderGrandtotal')}</div>
              <div>
                {format.number(grandTotal.value, {
                  style: 'currency',
                  currency: grandTotal.currencyCode,
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-[30px]">
        <div className="text-[20px] font-[500] leading-[32px] tracking-[0.15px] text-black">
          Items In This Order ({noOfItems})
        </div>
        <div className="flex flex-col gap-[30px]">
          <div className="flex flex-col gap-[30px]">
            {shippingConsignments?.map((consignment, idx) => {
              const { lineItems } = consignment;
              return (
                <>
                  {lineItems.map((shipment) => {
                    const isImageAvailable = shipment?.defaultImage !== null;
                    return (
                      <div
                        className="border border-[#cccbcb] p-[20px] [@media_print]:break-inside-avoid [@media_print]:[page-break-inside:avoid]"
                        key={shipment?.entityId}
                      >
                        <div className="flex items-center justify-between gap-[20px]">
                          <div className="flex flex-1 items-center gap-[20px]">
                            <div className="bg-[#d9d9d9]">
                              {isImageAvailable && (
                                <BcImage
                                  alt={shipment?.image?.altText || shipment?.name}
                                  className="h-[150px] w-[150px]"
                                  width={150}
                                  height={150}
                                  priority={true}
                                  src={shipment?.image?.url}
                                />
                              )}
                              {!isImageAvailable && (
                                <div className="h-[150px] w-[150px]">
                                  <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
                                    <span className="text-center text-sm md:text-base">
                                      {t('comingSoon')}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-shrink-[50] flex-col gap-[3px]">
                              <div className="text-[16px] font-normal leading-[32px] tracking-[0.15px] text-black">
                                {shipment?.name}
                              </div>
                              <div className="text-[14px] font-bold leading-[24px] tracking-[0.25px] text-[#7f7f7f]">
                                <span>SKU: ABC-1234DE</span>{' '}
                                {shipment?.productOptions?.map(
                                  ({ name: optionName, value }, idx) => {
                                    let pipeLineData = ' | ';
                                    if (idx === shipment.productOptions.length - 1) {
                                      pipeLineData = '';
                                    }
                                    const updatedValue =
                                      optionName === "Fabric Color" || "Select Fabric Color"
                                        ? value.split('|')[0].trim()
                                        : value;
                                    return (
                                      <>
                                        <span
                                          className="text-[14px] font-bold leading-[24px] tracking-[0.25px] text-[#7F7F7F]"
                                          key={idx}
                                        >
                                          {`${optionName}: `}
                                        </span>
                                        <span className="text-[14px] font-[400] leading-[24px] tracking-[0.25px] text-[#7F7F7F]">
                                          {updatedValue}
                                        </span>
                                        <span className="text-[14px] font-[400] leading-[24px] tracking-[0.25px] text-[#7F7F7F]">
                                          {pipeLineData}
                                        </span>
                                      </>
                                    );
                                  },
                                )}
                              </div>
                              <div className="text-[14px] font-normal leading-[24px] tracking-[0.25px]">
                                QTY: {shipment?.quantity}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-1 flex-col gap-[3px] text-right">
                            {/*<div className="font-normal text-[14px] leading-[24px] tracking-[0.25px] text-[#1DB14B]">
                                10% Coupon: <span>$81.17</span>
                              </div>*/}
                            <div className="text-[14px] font-normal leading-[24px] tracking-[0.25px]">
                              {format.number(shipment?.subTotalListPrice.value, {
                                style: 'currency',
                                currency: shipment?.subTotalListPrice.currencyCode,
                              })}
                            </div>
                            {/*
                              <div>
                                <span className="font-normal text-[14px] leading-[24px] tracking-[0.25px] line-through ">$100.20</span> <span className="font-normal text-[12px] leading-[18px] tracking-[0.4px] text-[#5c5c5c]">10% Off</span>
                              </div>*/}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default function OrderTracking({
  icon,
  guestUserCheck,
}: {
  icon: any;
  guestUserCheck: Number;
}) {
  const [number, setNumber] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [orderData, setOrderData] = useState([]);
  const [showOrderInfo, setShowOrderInfo] = useState(0);
  const [cartId, setCartId] = useState('');
  const [showOrderSummary, setShowOrderSummary] = useState(0);
  const [guestFlow, setGuestFlow] = useState(1);

  const onNumberChange = (e: any) => {
    setNumber(e.target.value);
    validateForm();
  };

  const onEmailChange = (e: any) => {
    setEmail(e.target.value);
    validateForm();
  };

  // Validate form
  const validateForm = () => {
    let errors: any = {};

    if (!number) {
      errors.number = 'Order Number is required.';
    }

    if (!email) {
      errors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid.';
    }

    setErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  };
  // Submit
  const handleSubmit = () => {
    setShowOrderSummary(0);
    setShowOrderInfo(0);
    if (isFormValid) {
      const getOrderData = async (orderId: any, cartId: string, guestUserCheck: Number) => {
        let orderInfo: any = {};
        if (guestUserCheck == 1) {
          orderInfo = await getGuestOrderDetails({
            filter: {
              entityId: orderId,
              cartEntityId: cartId,
            },
          });
        } else {
          orderInfo = await getOrderDetails({
            filter: {
              entityId: orderId,
            },
          });
        }
        if (!orderData) {
          setErrors({
            orderError: 'Order is not available.',
          });
        }
        setShowOrderInfo(1);
        setOrderData(orderInfo);
        return orderInfo;
      };
      const getOrderIsValid = async (orderId: Number) => {
        let orderInfoData: any = {};
        orderInfoData = await getGuestOrderDetailsFromAPI(orderId);
        if (orderInfoData?.billing_address?.email == email) {
          setCartId(orderInfoData?.cart_id);
          let guestFlowCheck = orderInfoData?.customer_id > 0 ? 0 : 1;
          setGuestFlow(guestFlowCheck);
          await getOrderData(Number(orderId), orderInfoData?.cart_id, guestFlowCheck);
        } else {
          setErrors({
            orderError: 'Order is not available.',
          });
        }
      };
      getOrderIsValid(number);
    } else {
      console.log('Form has errors. Please correct them.');
    }
  };

  const breadcrumbs: any = [
    {
      label: 'Find an Order',
      href: '#',
    },
  ];

  return (
    <div className="flex justify-center">
      <div className="w-full px-5 xl:w-[70%] xl:p-0">
        <div className="my-[2rem] flex flex-col gap-[20px] text-[#353535]">
          <div className="flex flex-col gap-[20px] p-0">
            <div className="flex items-center justify-center gap-[5px] xl:hidden">
              <div>
                <BcImage
                  src={chevronRight}
                  width={8}
                  height={12}
                  alt="Chevron Right"
                  unoptimized={true}
                />
              </div>
              <Link
                href="/"
                className="text-[16px] font-normal leading-[32px] tracking-[0.15px] text-[#006380]"
              >
                Account Center
              </Link>
            </div>
            <ComponentsBreadcrumbs className="hidden xl:block" breadcrumbs={breadcrumbs} />
            <div className="text-center text-[24px] font-[400] leading-[32px] text-[#000] xl:text-left">
              Find Your Order
            </div>
            <StillNeedContactUs icon={icon} />
            <div className="flex flex-col gap-[20px] p-0 text-center xl:flex-row xl:items-end xl:text-left">
              <div className="flex flex-1 flex-col gap-[20px]">
                <div className="text-[20px] font-[500] leading-[32px] tracking-[0.15px] text-[#008BB7]">
                  Order Number (Required)
                </div>
                <div className="relative">
                  <input
                    type="text"
                    className={`mb-[30px] flex h-[44px] w-full flex-col items-start justify-center gap-[10px] rounded-[3px] border border-[#CCCBCB] bg-white p-[6px_10px] focus-visible:outline-none disabled:bg-gray-100 disabled:hover:border-gray-200 ${errors.number ? 'hover:border hover:border-[#A71F23] focus:border focus:border-[#A71F23] focus-visible:border focus-visible:border-[#A71F23]' : 'hover:border hover:border-[#008bb7] focus:border focus:border-[#008bb7] focus-visible:border focus-visible:border-[#008bb7]'}`}
                    onChange={(e) => onNumberChange(e)}
                  />

                  {errors.number && (
                    <p className="absolute bottom-0 text-sm text-[#A71F23]">{errors.number} </p>
                  )}
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-[20px]">
                <div className="text-[20px] font-[500] leading-[32px] tracking-[0.15px] text-[#008BB7]">
                  Email (Required)
                </div>
                <div className="relative">
                  <input
                    type="text"
                    className={`mb-[30px] flex h-[44px] w-full flex-col items-start justify-center gap-[10px] rounded-[3px] border border-[#CCCBCB] bg-white p-[6px_10px] focus-visible:outline-none disabled:bg-gray-100 disabled:hover:border-gray-200 ${errors.email ? 'hover:border hover:border-[#A71F23] focus:border focus:border-[#A71F23] focus-visible:border focus-visible:border-[#A71F23]' : 'hover:border hover:border-[#008bb7] focus:border focus:border-[#008bb7] focus-visible:border focus-visible:border-[#008bb7]'}`}
                    onChange={(e) => onEmailChange(e)}
                  />

                  {errors.email && (
                    <p className="absolute bottom-0 text-sm text-[#A71F23]">{errors.email} </p>
                  )}
                </div>
              </div>
              <div>
                <button
                  className="mb-[30px] flex h-[42px] w-full cursor-pointer flex-row items-center justify-center gap-[5px] rounded bg-[#03465C] p-[5px_10px] text-sm font-[500] leading-8 tracking-[1.25px] text-[#ffffff] hover:bg-[#03465C]/90 xl:w-[unset]"
                  disabled={!isFormValid}
                  onClick={handleSubmit}
                >
                  FIND ORDER
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-[20px] p-0">
            {errors.orderError || showOrderInfo || showOrderSummary ? (
              <div className="text-center text-[24px] font-normal leading-[32px] text-[#000] xl:text-left">
                Results
              </div>
            ) : null}
            {errors.orderError && (
              <p className="text-center text-sm leading-[32px] text-[#353535] xl:text-left">
                {errors.orderError}{' '}
              </p>
            )}
            {showOrderInfo && orderData?.orderState?.orderId ? (
              <OrderList
                setShowOrderSummary={setShowOrderSummary}
                orderData={orderData}
                cartId={cartId}
                guestUserCheck={guestFlow}
              />
            ) : null}
            {showOrderSummary && orderData?.orderState?.orderId ? (
              <OrderSummaryInfo orderData={orderData} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
