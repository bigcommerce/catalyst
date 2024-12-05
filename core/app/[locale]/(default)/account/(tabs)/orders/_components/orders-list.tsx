'use client';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { useFormatter, useTranslations } from 'next-intl';

import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';

import { getCustomerOrders } from '../page-data';

import { assembleProductData, ProductSnippet } from './product-snippet';
import { PrinterIcon } from 'lucide-react';
import { BcImage } from '~/components/bc-image';

export type Orders = NonNullable<Awaited<ReturnType<typeof getCustomerOrders>>>['orders'];

interface OrdersListProps {
  customerOrders: Orders;
  ordersCount?: number;
}

enum VisibleListItemsPerDevice {
  xs = 1,
  md = 3,
  lg = 4,
  xl = 5,
}

const TruncatedCard = ({ itemsQuantity }: { itemsQuantity: number }) => {
  const smItems = itemsQuantity - VisibleListItemsPerDevice.xs;
  const mdItems = itemsQuantity - VisibleListItemsPerDevice.md;
  const lgItems = itemsQuantity - VisibleListItemsPerDevice.lg;
  const xlItems = itemsQuantity - VisibleListItemsPerDevice.xl;

  return (
    <>
      {smItems > 0 && (
        <div className="list-item w-36 md:!hidden">
          <div className="flex h-36 w-full items-center justify-center bg-gray-200 font-semibold text-gray-500">
            +{smItems}
          </div>
        </div>
      )}
      {mdItems > 0 && (
        <div className="hidden w-36 md:list-item lg:hidden">
          <div className="flex h-36 w-full items-center justify-center bg-gray-200 font-semibold text-gray-500">
            +{mdItems}
          </div>
        </div>
      )}
      {lgItems > 0 && (
        <div className="hidden w-36 lg:list-item xl:hidden">
          <div className="flex h-36 w-full items-center justify-center bg-gray-200 font-semibold text-gray-500">
            +{lgItems}
          </div>
        </div>
      )}
      {xlItems > 0 && (
        <div className="hidden w-36 xl:list-item">
          <div className="flex h-36 w-full items-center justify-center bg-gray-200 font-semibold text-gray-500">
            +{xlItems}
          </div>
        </div>
      )}
    </>
  );
};

interface ManageOrderButtonsProps {
  className: string;
  orderId: number;
  orderTrackingUrl?: string;
  orderStatus: string | null;
}

const ManageOrderButtons = ({
  className,
  orderId,
  orderStatus,
  orderTrackingUrl,
}: ManageOrderButtonsProps) => {
  const t = useTranslations('Account.Orders');

  return (
    <div className={className}>
      <Button aria-label={t('viewOrderDetails')} asChild className="w-full font-normal  md:w-fit" variant="secondary">
        <Link href={{ pathname: '/account/orders', query: { order: orderId } }} className='hover:text-black'>
          {t('viewOrderDetails')}
        </Link>
      </Button>
      {Boolean(orderTrackingUrl) && (
        <Button
          aria-label={t('trackOrder')}
          asChild
          className="w-full md:w-fit"
          variant="secondary"
        >
          <Link href={{ pathname: orderTrackingUrl }}>{t('trackOrder')}</Link>
        </Button>
      )}
      {Boolean(orderStatus) && orderStatus === 'SHIPPED' && (
        <Button
          aria-label={t('returnOrder')}
          asChild
          className="w-full md:w-fit"
          variant="secondary"
        >
          <Link href={{ pathname: '' }}>{t('returnOrder')}</Link>
        </Button>
      )}
    </div>
  );
};
const OrderDetails = ({
  orderId,
  orderDate,
  orderPrice,
  orderStatus
}: {
  orderId: number;
  orderDate: string;
  orderPrice: {
    value: number;
    currencyCode: string;

  };
  orderStatus: string;
}) => {
  const t = useTranslations('Account.Orders');
  const format = useFormatter();

  return (
    <>
      <div className="w-full bg-[#03465C] h-[52px] flex flex-row items-center">
        <p className="max-w-max h-[32px] content-center px-2 ml-2 rounded-3xl bg-[#E7F5F8] font-normal text-[#03465C]">
          {orderStatus}
        </p>
      </div>
      <div className="flex flex-row justify-between gap-2 pb-[20px] px-[20px] text-base md:flex-row md:gap-12">
        <div className='flex flex-row gap-[10px]'>
          <p className="flex justify-between md:flex-col">
            {/* <span>{t('placedDate')}</span> */}
            <span className="font-normal">
              {format.dateTime(new Date(orderDate), {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </p>
          <span> | </span>
          <Link href={{ pathname: '/account/orders', query: { order: orderId } }}>
            <p className="flex justify-between leading-[24px] md:flex-col">
              <span className="text-base font-normal">{t('orderNumber')} {orderId}</span>
            </p>
          </Link>
        </div>
        <div className='flex flex-row gap-[10px]'>
          <p className="flex justify-between md:flex-col">
            <span className="font-normal">{t('orderTotal')}
              {format.number(orderPrice.value, {
                style: 'currency',
                currency: orderPrice.currencyCode,
              })}
            </span>
          </p>
          <div className='flex flex-row '>
            <span className='mr-[10px]'> | </span>
            <PrinterIcon className='stroke-[#008bb7]' />
            <span className='text-[#008bb7] ml-[10px]'>{t('printInvoice')}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export const OrdersList = ({ customerOrders }: OrdersListProps) => {
  const ordersHistory = customerOrders.map((order) => ({
    ...order,
    consignments: {
      shipping: order.consignments.shipping
        ? order.consignments.shipping.map(({ lineItems, shipments }) => ({
          lineItems: removeEdgesAndNodes(lineItems),
          shipments: removeEdgesAndNodes(shipments),
        }))
        : null,
    },
  }));

  return (
    <ul className="flex w-full flex-col mt-[20px]">
      {ordersHistory.map(({ entityId, orderedAt, status, totalIncTax, consignments }) => {
        // NOTE: tracking url will be supported later
        const trackingUrl = consignments.shipping
          ? consignments.shipping
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
            .find((url) => url !== null)
          : undefined;

        return (
          <li
            className="inline-flex border-collapse flex-col gap-y-6 border border-[#CCCBCB] mb-[20px]"
            key={entityId}
          >
            <OrderDetails
              orderDate={orderedAt.utc}
              orderId={entityId}
              orderPrice={totalIncTax}
              orderStatus={status.label}
            />
            <div className="flex items-center gap-4 pb-[20px] px-[20px]">
              <ul className="inline-flex gap-4 [&>*:nth-child(n+2)]:hidden md:[&>*:nth-child(n+2)]:list-item md:[&>*:nth-child(n+4)]:hidden lg:[&>*:nth-child(n+4)]:list-item lg:[&>*:nth-child(n+5)]:hidden xl:[&>*:nth-child(n+5)]:list-item lg:[&>*:nth-child(n+7)]:hidden">
                {(consignments.shipping ?? []).map(({ lineItems }) => {
                  if (lineItems.length === 1) {
                    return lineItems.slice(0, VisibleListItemsPerDevice.xl).map((shippedProduct) => {
                      return (

                        <li key={shippedProduct.entityId}>
                          <ProductSnippet
                            imagePriority={true}
                            imageSize="square"
                            product={assembleProductData({ ...shippedProduct, productOptions: [] })}
                          />
                        </li>
                      );
                    });
                  }
                   return (
                    <span className="text-base font-semibold">  {lineItems.length} Items </span>
                  )
                })}
              </ul>
              <TruncatedCard
                itemsQuantity={(consignments.shipping ?? []).reduce(
                  (orderItems, shipment) => orderItems + shipment.lineItems.length,
                  0,
                )}
              />
              <ManageOrderButtons
                className="ms-auto inline-flex flex-col gap-2 w-[320px] h-[42px] border border-[#B4DDE9] rounded-[3px] items-center hover:cursor-pointer hover:border-[2px] hover:border-[#008BB7] hover:bg-[#e7f5f8]"
                orderId={entityId}
                orderStatus={status.value}
                orderTrackingUrl={trackingUrl}
              />
            </div>
            {/* <ManageOrderButtons
              className="inline-flex flex-col gap-2 md:flex-row item:"
              orderId={entityId}
              orderStatus={status.value}
              orderTrackingUrl={trackingUrl}
            /> */}
          </li>
        );
      })}
    </ul>
  );
};
