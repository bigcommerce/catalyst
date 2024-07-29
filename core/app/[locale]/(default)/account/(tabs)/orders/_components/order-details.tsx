import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter } from 'next-intl/server';

import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

import { OrderDetailsDataType } from '../page-data';

import { assembleProductData, ProductSnippet } from './product-snippet';

const OrderState = async ({ orderState }: { orderState: OrderDetailsDataType['orderState'] }) => {
  const format = await getFormatter();
  const { orderId, orderDate, status } = orderState;

  return (
    <div className="mb-6 flex flex-col gap-6 md:flex-row">
      <div>
        <h2 className="mb-2 text-3xl font-bold lg:text-4xl">Order #{orderId}</h2>
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
  const format = await getFormatter();
  const { subtotal, shipping, tax, discounts, grandTotal } = summaryInfo;
  const totalDiscountSum = discounts.couponDiscounts.reduce((sum, discount) => {
    let totalDiscount = sum;

    totalDiscount += discount.discountedAmount.value;

    return totalDiscount;
  }, 0);

  return (
    <div className="border border-gray-200 p-6">
      <p className="pb-4 text-lg font-semibold">Order Summary</p>
      <div className="flex border-collapse flex-col gap-2 border-y border-gray-200 py-4">
        <p className="flex justify-between">
          <span>Subtotal:</span>
          <span>
            {format.number(subtotal.value, {
              style: 'currency',
              currency: subtotal.currencyCode,
            })}
          </span>
        </p>
        <p className="flex justify-between">
          <span>Discount:</span>
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
          <span>Shipping:</span>
          <span>
            {format.number(shipping.value, {
              style: 'currency',
              currency: shipping.currencyCode,
            })}
          </span>
        </p>
        <p className="flex justify-between">
          <span>Tax:</span>
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
          <span>Grand total:</span>
          <span>
            {format.number(grandTotal.value, {
              style: 'currency',
              currency: grandTotal.currencyCode,
            })}
          </span>
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-2 md:flex-row lg:flex-col">
        <Button aria-label="Print Invoice" asChild className="w-full" variant="secondary">
          <Link href="TODO:add_path_later">Print Invoice</Link>
        </Button>
        <Button aria-label="Repurchase" asChild className="w-full" variant="secondary">
          <Link href="TODO:add_path_later">Repurchase</Link>
        </Button>
        <Button aria-label="Return" asChild className="w-full" variant="secondary">
          <Link href={{ pathname: 'TODO:ADD_PATH_LATER' }}>Return</Link>
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

  const format = await getFormatter();
  const { shippingProviderName, shippingMethodName, shippedAt } = shipment;
  const providerWithMethod = `${shippingProviderName} - ${shippingMethodName}`;
  const shippedDate = `Shipped on ${format.dateTime(new Date(shippedAt.utc), {
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

  if (isMutiConsignments && shippingNumber && orderShipments[shippingNumber]) {
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
    <div className="border border-gray-200 p-6">
      <p className="border-b border-gray-200 pb-4 text-lg font-semibold">
        {isMutiConsignments ? `Shipment ${shippingNumber}/${orderShipments.length}` : 'Shipping'}
      </p>
      <div className="flex flex-col gap-2 py-4">
        <p className="font-semibold">Shipping address</p>
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
        <p className="font-semibold">Shipping method</p>
        {customerShippingMethod.map((line) => (
          <p key={line}>{line}</p>
        ))}
        {typeof trackingUrl === 'string' && Boolean(trackingNumber) && (
          <Button aria-label="track order" asChild className="w-full" variant="subtle">
            <Link href={trackingUrl}>{trackingNumber}</Link>
          </Button>
        )}
      </div>
    </div>
  );
};

const PaymentInfo = ({ paymentData }: { paymentData: OrderDetailsDataType['paymentInfo'] }) => {
  const { billingAddress } = paymentData;
  const customerBillingAddress = combineAddressInfo(billingAddress);

  return (
    <div className="border border-gray-200 p-6">
      <p className="border-b border-gray-200 pb-4 text-lg font-semibold">Payment</p>
      <div className="flex flex-col gap-2 py-4">
        <p className="font-semibold">Payment method</p>
        <p>TBD</p>
      </div>
      <div className="flex flex-col gap-2 border-t border-gray-200 pt-4 text-base">
        <p className="font-semibold">Billing address</p>
        {customerBillingAddress.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
};

interface OrderDetailsProps {
  data: OrderDetailsDataType;
}

export const OrderDetails = ({ data }: OrderDetailsProps) => {
  const { orderState, summaryInfo, consignments, paymentInfo } = data;
  const isMultiShippingConsignments =
    (consignments.shipping && consignments.shipping.length > 1) || false;

  const orderContent = consignments.shipping
    ? consignments.shipping.map(({ lineItems }) => ({
        lineItems: removeEdgesAndNodes(lineItems),
      }))
    : null;

  return (
    <div className="mb-14">
      {/* NOTE: state of order */}
      <OrderState orderState={orderState} />
      {/* NOTE: order details grid */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* TODO: Shipments Content */}
        <div className="flex flex-col lg:w-2/3">
          {orderContent?.map((consignment, idx) => {
            const { lineItems } = consignment;

            return (
              <div className="w-full border border-gray-200 p-6" key={idx}>
                <p className="border-b border-gray-200 pb-4 text-xl font-semibold lg:text-2xl">
                  {isMultiShippingConsignments
                    ? `Shipping ${idx + 1}/${orderContent.length}`
                    : 'Order content'}
                </p>
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
        {/* Payments & Price Sub-block */}
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
