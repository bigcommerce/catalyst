import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { useTranslations, useFormatter } from 'next-intl';
import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';
import { BcImage } from '~/components/bc-image';
import { Orders } from '../page';
import { PrintInvoice } from '../../print-invoice/print-invoice';

interface OrdersListProps {
  customerOrders: Orders;
  ordersCount?: number;
}

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
    <div className="flex-[0.5] flex flex-col gap-[5px]">
      {Boolean(orderTrackingUrl) && (
        <Button
          aria-label={t('trackOrder')}
          asChild
          className="flex w-full min-h-[42px] uppercase flex-row items-center justify-center rounded-[3px] bg-[#008BB7] p-[5px_10px] text-[14px] font-medium leading-[32px] tracking-[1.25px] text-[#fff]"
          variant="secondary"
        >
          <Link href={{ pathname: orderTrackingUrl }}>{t('trackOrder')}</Link>
        </Button>
      )}
      <Button
        className="flex w-full min-h-[42px] uppercase flex-row items-center justify-center rounded-[3px] border border-[#B4DDE9] bg-white p-[5px_10px] text-[14px] font-medium leading-[32px] tracking-[1.25px] text-[#002A37]"
        aria-label={t('viewOrderDetails')}
        variant="secondary"
        asChild
      >
        <Link href={`/account/order/${orderId}`} className='hover:text-black'>{t('viewOrderDetails')}</Link>
      </Button>
      {Boolean(orderStatus) && orderStatus === 'SHIPPED' && (
        <Button
          aria-label={t('returnOrder')}
          asChild
          className="flex w-full min-h-[42px] uppercase flex-row items-center justify-center rounded-[3px] border border-[#B4DDE9] bg-white p-[5px_10px] text-[14px] font-medium leading-[32px] tracking-[1.25px] text-[#002A37]"
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
  orderStatus,
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
      <div className="w-full bg-[#03465C] p-[10px]">
        <button className="flex h-[32px] flex-row items-center justify-center gap-[10px] rounded-full bg-[#E7F5F8] p-[0px_10px] text-[16px] font-normal leading-[32px]">
          {orderStatus}
        </button>
      </div>
      <div className="flex w-full flex-col items-start gap-[15px] p-[0px_20px]">
        <div className="flex w-full flex-row justify-between">
          <div className="flex flex-row items-center gap-[5px] text-[16px] font-normal leading-[32px] tracking-[0.15px]">
            <span>
              {format.dateTime(new Date(orderDate), {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span> | {t('orderNumber')}{orderId}</span>
          </div>
          <div className="flex flex-row items-center gap-[5px] text-[16px] font-normal leading-[32px] tracking-[0.15px]">
            <span>{t('orderTotal')}:
              {format.number(orderPrice.value, {
                style: 'currency',
                currency: orderPrice.currencyCode,
              })} |</span>
            <PrintInvoice orderId={orderId} key={orderId} />
          </div>
        </div>
      </div>
    </>
  );
};

export const OrdersList = ({ customerOrders }: OrdersListProps) => {
  return (
    <>
      {customerOrders.map(({ entityId, orderedAt, status, totalIncTax, consignments }) => {
        const shippingConsignments = consignments?.shipping
          ? consignments?.shipping.map(({ lineItems, shipments }) => ({
            lineItems: removeEdgesAndNodes(lineItems),
            shipments: removeEdgesAndNodes(shipments),
          }))
          : undefined;
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
            .find((url) => url !== null)
          : undefined;
        return (
          <div className="flex flex-col items-start gap-[15px] border border-[#CCCBCB] p-0" key={entityId}>
            <OrderDetails
              orderDate={orderedAt.utc}
              orderId={entityId}
              orderPrice={totalIncTax}
              orderStatus={status.label}
            />
            <div className="flex w-full flex-row items-center justify-between p-[0px_20px_20px_20px]">
              <div className="flex flex-1 flex-row items-center gap-[40px] p-0" key={`order-${entityId}`}>
                {(shippingConsignments ?? []).map(({ lineItems }) => {
                  let itemsCount = lineItems?.length;
                  let className = '', imageClass = '';
                  let productCount = 1;
                  let width = 150, height = 150;
                  if (itemsCount >= 3) {
                    className = 'flex h-[150px] w-[150px] flex-row flex-wrap gap-[10px] py-[5px]';
                    imageClass = 'h-[65px] w-[70px]';
                    width = 70;
                    height = 65
                    productCount = 4;
                  } else if (itemsCount == 2) {
                    className = 'flex h-[150px] w-[310px] flex-row gap-[10px]';
                    width = 150;
                  } else if (itemsCount == 1) {
                    className = 'flex h-[150px] w-[150px] flex-row gap-[10px] ';
                    width = 150;
                  }
                  return (
                    <>
                      <div className={className}>
                        {lineItems?.slice(0, productCount).map((shippedProduct) => {
                          return (
                            <BcImage
                              className={imageClass}
                              width={width}
                              height={height}
                              src={shippedProduct?.image?.url || undefined}
                              unoptimized={true}
                              alt={shippedProduct?.name}
                              key={`order-${entityId}-${shippedProduct?.entityId}`}
                            />
                          )
                        })}
                      </div>
                      {itemsCount > 1 ? (
                        <div className="text-[20px] font-medium leading-[32px] tracking-[0.15px] text-[#000000]">
                          {itemsCount} Item{(itemsCount > 1) ? 's' : ''}
                        </div>
                      ) : (
                        <div className="flex flex-col justify-center items-start p-0 gap-[5px] flex-[0.7]">
                          <div className="font-normal text-[16px] tracking-[0.15px] leading-[32px] text-black">
                            {lineItems?.[0]?.name}
                          </div>
                          <div className="font-bold text-[14px] tracking-[0.25px] leading-[24px] text-[#7f7f7f]">
                            <span>SKU: {lineItems?.[0]?.sku}</span>{' '}
                            {lineItems?.[0]?.productOptions?.length > 0 && lineItems?.[0]?.productOptions?.map((lineData) => (
                              <span>
                                | {lineData?.name}: <span className="font-[400]">{lineData?.value}</span>
                              </span>
                            ))}
                          </div>
                          <div className="font-bold text-[14px] leading-[24px] tracking-[0.25px] text-[#353535]">QTY: {lineItems?.[0]?.quantity}</div>
                        </div>
                      )}
                    </>
                  )
                })}
              </div>
              <ManageOrderButtons
                className=""
                orderId={entityId}
                orderStatus={status.value}
                orderTrackingUrl={trackingUrl}
              />
            </div>
          </div>
        );
      })}
    </>
  );
};
