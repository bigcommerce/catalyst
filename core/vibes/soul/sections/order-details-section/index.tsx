import { ArrowLeft } from 'lucide-react';

import { Badge } from '@/vibes/soul/primitives/badge';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

interface Summary {
  lineItems: Array<{
    label: string;
    value: string;
    subtext?: string;
  }>;
  total: string;
}

interface Address {
  name?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipcode?: string;
  country?: string;
}

interface TrackingWithUrl {
  url: string;
}

interface TrackingWithNumber {
  number: string;
}

interface TrackingWithUrlAndNumber {
  url: string;
  number: string;
}

interface Shipment {
  name: string;
  status: string;
  tracking?: TrackingWithUrl | TrackingWithNumber | TrackingWithUrlAndNumber;
}

interface ShipmentLineItem {
  id: string;
  title: string;
  subtitle?: string;
  price: string;
  href: string;
  image?: { src: string; alt: string };
  quantity: number;
  metadata?: Array<{ label: string; value: string }>;
}

interface Destination {
  id: string;
  title: string;
  address: Address;
  shipments: Shipment[];
  lineItems: ShipmentLineItem[];
}

export interface Order {
  id: string;
  status: string;
  statusColor?: 'success' | 'warning' | 'error' | 'info';
  date: string;
  destinations: Destination[];
  summary: Summary;
}

interface Props {
  order: Order;
  title?: string;
  shipmentAddressLabel?: string;
  shipmentMethodLabel?: string;
  summaryTotalLabel?: string;
  prevHref?: string;
}

export function OrderDetailsSection({
  order,
  title = `Order #${order.id}`,
  shipmentAddressLabel,
  shipmentMethodLabel,
  summaryTotalLabel,
  prevHref = '/orders',
}: Props) {
  return (
    <div className="@container">
      <div className="flex gap-4 border-b border-contrast-100 pb-8">
        <Link
          className="mt-1 flex h-12 w-12 items-center justify-center rounded-full border border-contrast-100 text-foreground ring-primary transition-colors duration-300 hover:border-contrast-200 hover:bg-contrast-100 focus-visible:outline-0 focus-visible:ring-2"
          href={prevHref}
        >
          <ArrowLeft />
        </Link>
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl">{title}</h1>
            <Badge variant={order.statusColor}>{order.status}</Badge>
          </div>
          <p>{order.date}</p>
        </div>
      </div>
      <div className="grid @3xl:flex">
        <div className="order-2 flex-1 pr-12 @3xl:order-1">
          {order.destinations.map((destination) => (
            <Shipment
              addressLabel={shipmentAddressLabel}
              destination={destination}
              key={destination.id}
              methodLabel={shipmentMethodLabel}
            />
          ))}
        </div>
        <div className="order-1 basis-72 pt-8 @3xl:order-2">
          <Summary summary={order.summary} totalLabel={summaryTotalLabel} />
        </div>
      </div>
    </div>
  );
}

function Shipment({
  destination,
  addressLabel = 'Shipping address',
  methodLabel = 'Shipping method',
}: {
  destination: Destination;
  addressLabel?: string;
  methodLabel?: string;
}) {
  return (
    <div className="border-b border-contrast-100 py-8 @container">
      <div className="space-y-6">
        <div className="text-2xl font-medium">{destination.title}</div>
        <div className="grid gap-8 @xl:flex @xl:gap-20">
          <div className="text-sm">
            <h3 className="font-semibold">{addressLabel}</h3>
            <p>{destination.address.name}</p>
            <p>{destination.address.street1}</p>
            <p>{destination.address.street2}</p>
            <p>
              {`${destination.address.city}, ${destination.address.state} ${destination.address.zipcode}`}
            </p>
            <p>{destination.address.country}</p>
          </div>
          {destination.shipments.map((shipment) => (
            <div className="text-sm" key={shipment.name}>
              <h3 className="font-semibold">{methodLabel}</h3>
              <p>{shipment.name}</p>
              <p>{shipment.status}</p>
              <ShipmentTracking tracking={shipment.tracking} />
            </div>
          ))}
        </div>
        {destination.lineItems.map((lineItem) => (
          <ShipmentLineItem key={lineItem.id} lineItem={lineItem} />
        ))}
      </div>
    </div>
  );
}

function ShipmentTracking({
  tracking,
}: {
  tracking?: TrackingWithUrl | TrackingWithNumber | TrackingWithUrlAndNumber;
}) {
  if (!tracking) {
    return null;
  }

  if ('url' in tracking && 'number' in tracking) {
    return (
      <p>
        <Link href={tracking.url} target="_blank">
          {tracking.number}
        </Link>
      </p>
    );
  }

  if ('url' in tracking) {
    return (
      <p>
        <Link href={tracking.url} target="_blank">
          {tracking.url}
        </Link>
      </p>
    );
  }

  return <p>{tracking.number}</p>;
}

function ShipmentLineItem({ lineItem }: { lineItem: ShipmentLineItem }) {
  return (
    <Link
      className="group grid shrink-0 cursor-pointer gap-8 rounded-xl ring-primary ring-offset-4 focus-visible:outline-0 focus-visible:ring-2 @sm:flex @sm:rounded-2xl"
      href={lineItem.href}
      id={lineItem.id}
    >
      <div className="relative aspect-square basis-40 overflow-hidden rounded-[inherit] border border-contrast-100 bg-contrast-100">
        {lineItem.image?.src != null ? (
          <Image
            alt={lineItem.image.alt}
            className="w-full scale-100 select-none bg-contrast-100 object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            fill
            sizes="10rem"
            src={lineItem.image.src}
          />
        ) : (
          <div className="pl-2 pt-3 text-4xl font-bold leading-[0.8] tracking-tighter text-contrast-300 transition-transform duration-500 ease-out group-hover:scale-105">
            {lineItem.title}
          </div>
        )}
      </div>

      <div className="space-y-3 text-sm leading-snug">
        <div>
          <div className="font-semibold">{lineItem.title}</div>
          {lineItem.subtitle != null && lineItem.subtitle !== '' && (
            <div className="font-normal text-contrast-500">{lineItem.subtitle}</div>
          )}
        </div>
        <div className="flex gap-1 text-sm">
          <span className="font-semibold">{lineItem.price}</span>
          <span>×</span>
          <span className="font-semibold">{lineItem.quantity}</span>
        </div>
        <div>
          {lineItem.metadata?.map((metadata, index) => (
            <div className="flex gap-1 text-sm" key={index}>
              <span className="font-semibold">{metadata.label}:</span>
              <span>{metadata.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}

function Summary({ summary, totalLabel = 'Total' }: { summary: Summary; totalLabel?: string }) {
  return (
    <div className="divide-y divide-gray-100">
      <div className="space-y-2 pb-3 pt-5">
        {summary.lineItems.map((lineItem, index) => (
          <div className="flex justify-between" key={index}>
            <div>
              <div className="text-sm">{lineItem.label}</div>
              {lineItem.subtext != null && lineItem.subtext !== '' && (
                <div className="text-xs text-contrast-400">{lineItem.subtext}</div>
              )}
            </div>

            <span className="text-sm">{lineItem.value}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between border-t border-contrast-200 py-3 font-semibold">
        <span>{totalLabel}</span>
        <span>{summary.total}</span>
      </div>
    </div>
  );
}
