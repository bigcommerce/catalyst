'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { Key } from 'react';
import { BcImage } from '~/components/bc-image';

export default function PrintOrderSummary({ data, innerRef }: { data: any, innerRef: any }) {
  const t = useTranslations('Account.Orders');
  const format = useFormatter();

  if (!data?.orderState) {
    return null; // Return null instead of undefined or nothing
  }

  const { orderState, summaryInfo, consignments, paymentInfo } = data;
  const shippingConsignments = consignments.shipping;
  const isMultiShippingConsignments = shippingConsignments && shippingConsignments.length > 1;
  const noOfItems: number = shippingConsignments?.[0]?.lineItems?.length || 0;
  let shippingAddressData = shippingConsignments?.[0]?.shippingAddress;
  const { subtotal, shipping, tax, discounts, grandTotal, handlingCost } = summaryInfo;
  const { nonCouponDiscountTotal, couponDiscounts } = discounts;
  let regSubTotal = subtotal?.value;
  let youSave = 0;

  if (nonCouponDiscountTotal?.value > 0) {
    regSubTotal -= nonCouponDiscountTotal.value;
    youSave += nonCouponDiscountTotal.value;
  }

  couponDiscounts.forEach(({ discountedAmount }: any) => {
    regSubTotal -= discountedAmount.value;
    youSave += discountedAmount.value;
  });

  return (
    <div className="flex justify-center pagebreak print-page-container" ref={innerRef}>
      <div className="flex w-[90%] flex-col gap-[30px]">
        <div className="flex flex-col gap-[30px]">
          <div className="border-b border-b-[#E8E7E7]">
            <div className="pb-1 text-[24px] font-normal leading-[32px] text-black">
              Order Summary
            </div>
          </div>
          <div className="flex justify-between gap-[0]">
            <div className="flex w-1/2 flex-col gap-[30px]">
              <div className="text-[16px] font-normal leading-[32px] tracking-[0.15px] text-black">
                <div>
                  Confirmation Number: <span className="font-[700]">{orderState?.orderId}</span>
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
              </div>
            </div>
            <div className="flex w-1/2 ml-[60px] flex-col gap-[3px] text-[16px] font-normal leading-[32px] tracking-[0.5px]">
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
                    })}
                  </div>
                </div>
                {nonCouponDiscountTotal.value > 0 && (
                  <div className="flex justify-between border-b border-b-[#E8E7E7]">
                    <div>Discounts</div>
                    <div className="text-[#008BB7]">-
                      {format.number(nonCouponDiscountTotal.value, {
                        style: 'currency',
                        currency: nonCouponDiscountTotal.currencyCode,
                      })}
                    </div>
                  </div>
                )}
                {couponDiscounts.map(({ couponCode, discountedAmount }: any, index: Key | null | undefined) => (
                  <div className="flex justify-between border-b border-b-[#E8E7E7]" key={index}>
                    <div>{t('orderAppliedCoupon', { code: couponCode })}</div>
                    <div>- {format.number(discountedAmount.value, {
                      style: 'currency',
                      currency: discountedAmount.currencyCode,
                    })}</div>
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
                  <div>{shipping.value > 0 ? format.number(shipping.value, {
                    style: 'currency',
                    currency: shipping.currencyCode,
                  }) : 'FREE'}</div>
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
        </div>

        <div className="flex flex-col gap-[30px]">
          <div className="font-[500] text-[20px] leading-[32px] tracking-[0.15px] text-black">
            Items In This Order ({noOfItems})
          </div>
          <div className="flex flex-col gap-[30px]">
            <div className="flex flex-col gap-[30px]">
              {shippingConsignments?.map((consignment: { lineItems: any; }, idx: any) => {
                const { lineItems } = consignment;
                return (
                  lineItems.map((shipment:any) => {
                    const isImageAvailable = shipment?.defaultImage !== null;
                    return (
                      <div className="border border-[#cccbcb] p-[20px] [@media_print]:break-inside-avoid [@media_print]:[page-break-inside:avoid]" key={shipment?.entityId}>
                        <div className="flex gap-[20px] justify-between items-center">
                          <div className="flex gap-[20px] items-center flex-1">
                            <div className="bg-[#d9d9d9]">
                              {isImageAvailable ? (
                                <BcImage
                                  alt={shipment?.image?.altText || shipment?.name}
                                  className="h-[150px] w-[150px]"
                                  width={150}
                                  height={150}
                                  priority={true}
                                  src={shipment?.image?.url}
                                />
                              ) : (
                                <div className="h-[150px] w-[150px]">
                                  <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
                                    <span className="text-center text-sm md:text-base">{t('comingSoon')}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex-shrink-[50] flex flex-col gap-[3px]">
                              <div className="font-normal text-[16px] leading-[32px] tracking-[0.15px] text-black">
                                {shipment?.name}
                              </div>
                              <div className="font-bold text-[14px] leading-[24px] tracking-[0.25px] text-[#7f7f7f]">
                                <span>SKU: ABC-1234DE</span>{' '}
                                {shipment?.productOptions?.map(({ name: optionName, value }: any, idx: Key | null | undefined) => (
                                  <span key={idx} className="text-[14px] font-bold leading-[24px] tracking-[0.25px] text-[#7F7F7F]">
                                    {optionName}: {value}
                                  </span>
                                ))}
                              </div>
                              <div className="font-normal text-[14px] leading-[24px] tracking-[0.25px]">QTY: {shipment?.quantity}</div>
                            </div>
                          </div>
                          <div className="flex-1 text-right flex flex-col gap-[3px]">
                            <div className="font-normal text-[14px] leading-[24px] tracking-[0.25px]">
                              {format.number(shipment?.subTotalListPrice.value, {
                                style: 'currency',
                                currency: shipment?.subTotalListPrice.currencyCode,
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

