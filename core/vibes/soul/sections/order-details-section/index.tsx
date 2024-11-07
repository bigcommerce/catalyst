import { ArrowLeft } from 'lucide-react';
import { BcImage as Image } from '~/components/bc-image';
import { Link } from '~/components/link';

import { Badge } from '@/vibes/soul/primitives/badge';

type Summary = {
  lineItems: Array<{
    label: string;
    value: string;
    subtext?: string;
  }>;
  totalLabel?: string;
  total: string;
};

type Address = {
  name?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipcode?: string;
  country?: string;
};

type Method = {
  id: string;
  name: string;
  status: string;
};

type ShipmentLineItem = {
  id: string;
  title: string;
  subtitle?: string;
  price: string;
  href: string;
  image?: { src: string; alt: string };
  quantity: number;
  metadata?: Array<{ label: string; value: string }>;
};

type Shipment = {
  id: string;
  title: string;
  address: Address;
  addressLabel?: string;
  method: Method;
  methodLabel?: string;
  lineItems: ShipmentLineItem[];
};

type Order = {
  id: string;
  title: string;
  status: string;
  statusColor?: 'success' | 'warning' | 'danger' | 'info';
  date: string;
  shipments: Shipment[];
  summary: Summary;
};

type Props = {
  order: Order;
  prevHref?: string;
};

export function OrderDetailsSection({ order, prevHref = '/orders' }: Props) {
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
            <h1 className="text-4xl">{order.title}</h1>
            <Badge color={order.statusColor}>{order.status}</Badge>
          </div>
          <p>
            {new Date(order.date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>
      <div className="grid @3xl:flex">
        <div className="order-2 flex-1 pr-12 @3xl:order-1">
          {order.shipments.map((shipment) => (
            <Shipment key={shipment.id} shipment={shipment} />
          ))}
        </div>
        <div className="order-1 basis-72 pt-8 @3xl:order-2">
          <Summary summary={order.summary} />
        </div>
      </div>
    </div>
  );
}

function Shipment({ shipment }: { shipment: Shipment }) {
  return (
    <div className="border-b border-contrast-100 py-8 @container">
      <div className="space-y-6">
        <div className="text-2xl font-medium">{shipment.title}</div>
        <div className="grid gap-8 @xl:flex @xl:gap-20">
          <div className="text-sm">
            <h3 className="font-semibold">{shipment.addressLabel ?? 'Shipping address'}</h3>
            <p>{shipment.address.name}</p>
            <p>{shipment.address.street1}</p>
            <p>{shipment.address.street2}</p>
            <p>
              {`${shipment.address.city}, ${shipment.address.state} ${shipment.address.zipcode}`}
            </p>
            <p>{shipment.address.country}</p>
          </div>
          <div className="text-sm">
            <h3 className="font-semibold">{shipment.methodLabel ?? 'Shipping method'}</h3>
            <p>{shipment.method.name}</p>
            <p>{shipment.method.status}</p>
            <p>{shipment.method.id}</p>
          </div>
        </div>
        {shipment.lineItems.map((lineItem) => (
          <ShipmentLineItem key={lineItem.id} lineItem={lineItem} />
        ))}
      </div>
    </div>
  );
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
            sizes="(max-width: 768px) 70vw, 33vw"
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

function Summary({ summary }: { summary: Summary }) {
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
        <span>{summary.totalLabel ?? 'Total'}</span>
        <span>{summary.total}</span>
      </div>
    </div>
  );
}
