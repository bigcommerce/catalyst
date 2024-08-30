import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter, getLocale, getTranslations } from 'next-intl/server';

import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

import { OrderDetailsDataType } from '../page-data';

import { assembleProductData, ProductSnippet } from './product-snippet';

const OrderState = async ({ orderState }: { orderState: OrderDetailsDataType['orderState'] }) => {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'Account.Orders' });
  const format = await getFormatter();
  const { orderId, orderDate, status } = orderState;

  return (
    <div className="mb-6 flex flex-col gap-6 md:flex-row">
      <div>
        <h2 className="mb-2 text-3xl font-bold lg:text-4xl">
          {t('orderNumber')}
          {orderId}
        </h2>
        <p>
          {format.dateTime(new Date(orderDate.utc), {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>
      <p className="align-center flex h-fit justify-center gap-2.5 rounded-3xl bg-secondary/10 px-4 py-1.5 font-semibold text-primary">
        {status.label}
      </p>
    </div>
  );
};

const OrderSummaryInfo = async ({
  summaryInfo,
}: {
  summaryInfo: OrderDetailsDataType['summaryInfo'];
}) => {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'Account.Orders' });
  const format = await getFormatter();
  const { subtotal, shipping, tax, discounts, grandTotal } = summaryInfo;
  const totalDiscountSum = discounts.couponDiscounts.reduce((sum, discount) => {
    let totalDiscount = sum;

    totalDiscount += discount.discountedAmount.value;

    return totalDiscount;
  }, 0);

  return (
    <div className="border border-gray-200 p-6">
      <p className="pb-4 text-lg font-semibold">{t('orderSummary')}</p>
      <div className="flex border-collapse flex-col gap-2 border-y border-gray-200 py-4">
        <p className="flex justify-between">
          <span>{t('orderSubtotal')}</span>
          <span>
            {format.number(subtotal.value, {
              style: 'currency',
              currency: subtotal.currencyCode,
            })}
          </span>
        </p>
        <p className="flex justify-between">
          <span>{t('orderDiscount')}</span>
          <span>
            {discounts.couponDiscounts.length > 0
              ? format.number(totalDiscountSum, {
                  style: 'currency',
                  currency: discounts.couponDiscounts[0]?.discountedAmount.currencyCode,
                })
              : format.number(0, {
                  style: 'currency',
                  currency: subtotal.currencyCode,
                })}
          </span>
        </p>
        <p className="flex justify-between">
          <span>{t('orderShipping')}</span>
          <span>
            {format.number(shipping.value, {
              style: 'currency',
              currency: shipping.currencyCode,
            })}
          </span>
        </p>
        <p className="flex justify-between">
          <span>{t('orderTax')}</span>
          <span>
            {format.number(tax.value, {
              style: 'currency',
              currency: tax.currencyCode,
            })}
          </span>
        </p>
      </div>
      <div className="pt-4 text-base font-semibold">
        <p className="flex justify-between">
          <span>{t('orderGrandtotal')}</span>
          <span>
            {format.number(grandTotal.value, {
              style: 'currency',
              currency: grandTotal.currencyCode,
            })}
          </span>
        </p>
      </div>
      {/* NOTE: it is temporary disabled since not supported yet */}
      <div className="mt-4 flex flex-col gap-2 md:flex-row lg:flex-col">
        <Button aria-label={t('printInvoice')} className="w-full" disabled variant="secondary">
          {t('printInvoice')}
        </Button>
        <Button aria-label={t('repurchaseOrder')} className="w-full" disabled variant="secondary">
          {t('repurchaseOrder')}
        </Button>
        <Button aria-label={t('return')} className="w-full" disabled variant="secondary">
          {t('return')}
        </Button>
      </div>
    </div>
  );
};
const combineAddressInfo = (
  address: NonNullable<OrderDetailsDataType['consignments']['shipping']>[number]['shippingAddress'],
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
    NonNullable<OrderDetailsDataType['consignments']['shipping']>[number]['shipments']['edges']
  >[number]['node'],
) => {
  if (!shipment) {
    return [];
  }

  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'Account.Orders' });
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
  isMutiConsignments,
  shippingNumber,
}: {
  consignments: OrderDetailsDataType['consignments'];
  isMutiConsignments: boolean;
  shippingNumber?: number;
}) => {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'Account.Orders' });
  const orderShipments = consignments.shipping
    ? consignments.shipping.map(({ shipments, shippingAddress }) => ({
        shipments: removeEdgesAndNodes(shipments),
        shippingAddress,
      }))
    : null;

  if (!orderShipments) {
    return;
  }

  let customerShippingAddress: string[] = [];
  let customerShippingMethod: string[] = [];
  let trackingData;

  if (!isMutiConsignments && orderShipments[0]?.shippingAddress) {
    trackingData = orderShipments[0].shipments[0]?.tracking;
    customerShippingAddress = combineAddressInfo(orderShipments[0].shippingAddress);
    customerShippingMethod = await combineShippingMethodInfo(orderShipments[0].shipments[0]);
  }

  if (isMutiConsignments && shippingNumber !== undefined && orderShipments[shippingNumber]) {
    trackingData = orderShipments[shippingNumber].shipments[0]?.tracking;
    customerShippingAddress = combineAddressInfo(orderShipments[shippingNumber].shippingAddress);
    customerShippingMethod = await combineShippingMethodInfo(
      orderShipments[shippingNumber].shipments[0],
    );
  }

  const trackingUrl =
    trackingData && trackingData.__typename !== 'OrderShipmentNumberOnlyTracking'
      ? trackingData.url
      : null;
  const trackingNumber =
    trackingData && trackingData.__typename !== 'OrderShipmentUrlOnlyTracking'
      ? trackingData.number
      : null;

  return (
    <div
      className={cn(
        'border border-gray-200 p-6',
        isMutiConsignments && 'flex flex-col gap-4 border-none md:flex-row md:gap-16',
      )}
    >
      {!isMutiConsignments ? (
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
          isMutiConsignments && 'border-0',
        )}
      >
        <p className="font-semibold">{t('shippingMethod')}</p>
        {customerShippingMethod.map((line) => (
          <p key={line}>{line}</p>
        ))}
        {typeof trackingUrl === 'string' && Boolean(trackingNumber) && (
          <Button aria-label={t('trackOrder')} asChild className="w-full" variant="subtle">
            <Link href={trackingUrl}>{trackingNumber}</Link>
          </Button>
        )}
      </div>
    </div>
  );
};

const PaymentInfo = async ({
  paymentData,
}: {
  paymentData: OrderDetailsDataType['paymentInfo'];
}) => {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'Account.Orders' });
  const { billingAddress } = paymentData;
  const customerBillingAddress = combineAddressInfo(billingAddress);

  return (
    <div className="border border-gray-200 p-6">
      <p className="border-b border-gray-200 pb-4 text-lg font-semibold">{t('shippingPayment')}</p>
      {/* <div className="flex flex-col gap-2 py-4">
        <p className="font-semibold">{t('shippingPaymentMethod')}</p>
        <p>TODO: add payments info</p>
      </div> */}
      <div className="flex flex-col gap-2 border-0 border-gray-200 pt-4 text-base">
        <p className="font-semibold">{t('billingAddress')}</p>
        {customerBillingAddress.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
};

export const OrderDetails = async ({ data }: { data: OrderDetailsDataType }) => {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'Account.Orders' });
  const { orderState, summaryInfo, consignments, paymentInfo } = data;
  const isMultiShippingConsignments = consignments.shipping && consignments.shipping.length > 1;

  const orderContent = consignments.shipping
    ? consignments.shipping.map(({ lineItems }) => ({
        lineItems: removeEdgesAndNodes(lineItems),
      }))
    : null;

  return (
    <div className="mb-14">
      <OrderState orderState={orderState} />
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex flex-col gap-8 lg:w-2/3">
          {orderContent?.map((consignment, idx) => {
            const { lineItems } = consignment;

            return (
              <div className="w-full border border-gray-200 p-6" key={idx}>
                <p className="border-b border-gray-200 pb-4 text-xl font-semibold lg:text-2xl">
                  {isMultiShippingConsignments
                    ? `${t('shipmentTitle')} ${idx + 1}/${orderContent.length}`
                    : t('orderContents')}
                </p>
                {isMultiShippingConsignments && (
                  <ShippingInfo
                    consignments={consignments}
                    isMutiConsignments={true}
                    shippingNumber={idx}
                  />
                )}
                <ul className="my-6 flex flex-col gap-6">
                  {lineItems.map((shipment) => {
                    return (
                      <li key={shipment.entityId}>
                        <ProductSnippet
                          imagePriority={true}
                          imageSize="square"
                          isExtended={true}
                          product={assembleProductData(shipment)}
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
        <div className="flex grow flex-col gap-8">
          <OrderSummaryInfo summaryInfo={summaryInfo} />
          {!isMultiShippingConsignments && (
            <ShippingInfo consignments={consignments} isMutiConsignments={false} />
          )}
          <PaymentInfo paymentData={paymentInfo} />
        </div>
      </div>
    </div>
  );
};
