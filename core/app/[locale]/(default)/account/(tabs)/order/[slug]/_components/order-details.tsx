import { getFormatter, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

import {
  assembleProductData,
  ProductSnippet,
  ProductSnippetSkeleton,
} from '../../../orders/_components/product-snippet';
import { OrderDataType } from '../page';
import { Breadcrumbs as ComponentsBreadcrumbs } from '~/components/ui/breadcrumbs';
import { PrintInvoice } from '../../../print-invoice/print-invoice';
import { StillNeedContactUs } from '../../../orders/_components/stillneed-contactus';

const OrderSummaryInfo = async ({ summaryInfo }: { summaryInfo: OrderDataType['summaryInfo'] }) => {
  const t = await getTranslations('Account.Orders');
  const format = await getFormatter();
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
    <>
      <div className="flex w-1/2 flex-col gap-[3px] text-[16px] font-normal leading-[32px] tracking-[0.5px]">
        <div className="text-[20px] font-medium leading-[32px] tracking-[0.15px] text-[#002A37]">
          {t('orderTotal')}: {format.number(grandTotal.value, {
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
              })}</div>
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
          </div>)}
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
            <div>{shipping.value > 0 ? format.number(shipping.value, {
              style: 'currency',
              currency: shipping.currencyCode,
            }) : 'FREE'}
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
    </>
  );
};
const combineAddressInfo = (
  address: NonNullable<OrderDataType['consignments']['shipping']>[number]['shippingAddress'],
) => {
  const { firstName, lastName, address1, city, stateOrProvince, postalCode, country } = address;
  const fullName = `${firstName ?? ''} ${lastName ?? ''}`;
  const addressLine = address1 ?? '';
  const cityWithZipCode = `${city ?? ''}, ${stateOrProvince} ${postalCode}`;
  const shippingCountry = country;

  return [fullName, addressLine, cityWithZipCode, shippingCountry];
};
const combineShippingMethodInfo = async (
  shipment?: NonNullable<
    NonNullable<OrderDataType['consignments']['shipping']>[number]['shipments']
  >[number],
) => {
  if (!shipment) {
    return [];
  }

  const t = await getTranslations('Account.Orders');
  const format = await getFormatter();
  const { shippingProviderName, shippingMethodName, shippedAt } = shipment;
  const providerWithMethod = `${shippingProviderName} - ${shippingMethodName}`;
  const shippedDate = `${t('shippedDate')} ${format.dateTime(new Date(shippedAt.utc), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}`;

  return [providerWithMethod, shippedDate];
};

const ShippingInfo = async ({
  consignments,
  isMultiConsignments,
  shippingNumber,
}: {
  consignments: OrderDataType['consignments'];
  isMultiConsignments: boolean;
  shippingNumber?: number;
}) => {
  const t = await getTranslations('Account.Orders');
  const shippingConsignments = consignments.shipping;

  if (!shippingConsignments) {
    return;
  }

  let customerShippingAddress: string[] = [];
  let customerShippingMethod: string[] = [];
  let trackingData;

  if (!isMultiConsignments && shippingConsignments[0]?.shippingAddress) {
    trackingData = shippingConsignments[0].shipments[0]?.tracking;
    customerShippingAddress = combineAddressInfo(shippingConsignments[0].shippingAddress);
    customerShippingMethod = await combineShippingMethodInfo(shippingConsignments[0].shipments[0]);
  }

  if (isMultiConsignments && shippingNumber !== undefined && shippingConsignments[shippingNumber]) {
    trackingData = shippingConsignments[shippingNumber].shipments[0]?.tracking;
    customerShippingAddress = combineAddressInfo(
      shippingConsignments[shippingNumber].shippingAddress,
    );
    customerShippingMethod = await combineShippingMethodInfo(
      shippingConsignments[shippingNumber].shipments[0],
    );
  }

  const trackingNumber =
    trackingData && trackingData.__typename !== 'OrderShipmentUrlOnlyTracking'
      ? trackingData.number
      : null;

  return (
    <div
      className={cn(
        'border border-gray-200 p-6',
        isMultiConsignments && 'flex flex-col gap-4 border-none md:flex-row md:gap-16',
      )}
    >
      {!isMultiConsignments ? (
        <p className="border-b border-gray-200 pb-4 text-lg font-semibold">{t('shippingTitle')}</p>
      ) : null}
      <div className="flex flex-col gap-2 py-4">
        <p className="font-semibold">{t('shippingAddress')}</p>
        {customerShippingAddress.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <div
        className={cn(
          'flex flex-col gap-2 border-t border-gray-200 pt-4 text-base',
          isMultiConsignments && 'border-0',
        )}
      >
        <p className="font-semibold">{t('shippingMethod')}</p>
        {customerShippingMethod.map((line) => (
          <p key={line}>{line}</p>
        ))}
        {Boolean(trackingNumber) && (
          <Button
            aria-label={t('trackOrder')}
            asChild
            className="justify-start p-0"
            variant="subtle"
          >
            {/* TODO: add link when tracking url available */}
            <Link href="#">{trackingNumber}</Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export const OrderDetails = async ({ data, icon }: { data: OrderDataType, icon:any }) => {
  const t = await getTranslations('Account.Orders');
  const format = await getFormatter();
  const { orderState, summaryInfo, consignments, paymentInfo } = data;
  const shippingConsignments = consignments.shipping;
  const isMultiShippingConsignments = shippingConsignments && shippingConsignments.length > 1;
  const noOfItems: number = shippingConsignments?.[0]?.lineItems?.length || 0;
  const breadcrumbs: any = [{
    label: "Orders",
    href: '/account/orders'
  }, {
    label: "Order #" + orderState?.orderId,
    href: "#"
  }];
  let shippingAddressData = shippingConsignments?.[0]?.shippingAddress;

  return (
    <div className="mt-[1rem] mb-[2rem] w-[100%] flex justify-center text-[#353535]">
      <div className="flex w-[88%] flex-col gap-[20px]">
        <div>
          <ComponentsBreadcrumbs breadcrumbs={breadcrumbs} />
        </div>
        <div className="flex flex-col gap-[30px]">
          <div className="flex items-center justify-between">
            <div className="text-[24px] font-normal leading-[32px]">Order #{orderState?.orderId}</div>
            <div className="text-[16px] font-normal leading-[32px] tracking-[0.15px] text-[#008BB7] flex gap-[10px] items-center">
              <PrintInvoice orderId={orderState?.orderId} key={orderState?.orderId} />
            </div>
          </div>
          <StillNeedContactUs icon={icon} />
          <div className="flex flex-col gap-[30px]">
            <div>
              <p className="text-[20px] font-medium leading-[32px] tracking-[0.15px] text-[#000000]">
                Items In This Order ({noOfItems})
              </p>
            </div>
            <div className="flex flex-col gap-[30px]">
              {shippingConsignments?.map((consignment, idx) => {
                const { lineItems } = consignment;
                return (
                  <>
                    {isMultiShippingConsignments && (
                      <ShippingInfo
                        consignments={consignments}
                        isMultiConsignments={true}
                        shippingNumber={idx}
                      />
                    )}
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
                  Order Date: <span className="font-[700]">
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
                    <div>{shippingAddressData?.firstName} {shippingAddressData?.lastName}</div>
                    <div>{shippingAddressData?.address1}</div>
                    <div>{shippingAddressData?.city}</div>
                    <div>{shippingAddressData?.stateOrProvince}, {shippingAddressData?.countryCode} {shippingAddressData?.postalCode}</div>
                  </div>
                </div>
                <div className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-black">
                  <div className="text-[16px] font-normal leading-[32px] tracking-[0.15px] text-black">
                    {t('billingAddress')}
                  </div>
                  <div>
                    <div>{paymentInfo?.billingAddress?.firstName} {paymentInfo?.billingAddress?.lastName}</div>
                    <div>{paymentInfo?.billingAddress?.address1}</div>
                    <div>{paymentInfo?.billingAddress?.city}</div>
                    <div>{paymentInfo?.billingAddress?.stateOrProvince}, {paymentInfo?.billingAddress?.countryCode} {paymentInfo?.billingAddress?.postalCode}</div>
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
            <OrderSummaryInfo summaryInfo={summaryInfo} />
          </div>
        </div>
      </div>
    </div>
  );
};
