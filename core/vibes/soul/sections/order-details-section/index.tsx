import { BcImage } from '~/components/bc-image';
import { Link } from '~/components/link';

import { ArrowLeft } from 'lucide-react';

type Summary = {
  lineItems: {
    label: string;
    value: string;
    subtext?: string;
  }[];
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
  metadata?: { label: string; value: string }[];
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
    <div>
      <div className="flex items-center">
        <Link href={prevHref}>
          <ArrowLeft />
        </Link>
        <h1>{order.title}</h1>
        <span>
          {new Date(order.date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      </div>
      <div className="flex">
        <div className="flex-1 gap-8">
          {order.shipments.map((shipment) => (
            <Shipment key={shipment.id} shipment={shipment} />
          ))}
        </div>
        <div className="flex-1">
          <Summary summary={order.summary} />
        </div>
      </div>
    </div>
  );
}

function Shipment({ shipment }: { shipment: Shipment }) {
  return (
    <div>
      <div>
        <div className="flex gap-8">
          <div>
            <h3>{shipment.addressLabel ?? 'Shipping address'}</h3>
            <p>{shipment.address.name}</p>
            <p>{shipment.address.street1}</p>
            <p>{shipment.address.street2}</p>
            <p>
              {`${shipment.address.city}, ${shipment.address.state} ${shipment.address.zipcode}`}
            </p>
            <p>{shipment.address.country}</p>
          </div>
          <div>
            <h3>{shipment.methodLabel ?? 'Shipping method'}</h3>
            <p>{shipment.method.name}</p>
            <p>{shipment.method.status}</p>
            <p>{shipment.method.id}</p>
          </div>
        </div>
        {shipment.lineItems.map((lineItem) => (
          <ShipmentLineItem lineItem={lineItem} />
        ))}
      </div>
    </div>
  );
}

function ShipmentLineItem({ lineItem }: { lineItem: ShipmentLineItem }) {
  return (
    <div>
      {lineItem.image && (
        <div>
          <BcImage src={lineItem.image.src} alt={lineItem.image.alt} />
        </div>
      )}
      <div>
        <h3>{lineItem.title}</h3>
        <p>{lineItem.subtitle}</p>
        <p>{lineItem.price}</p>
        <p>{lineItem.quantity}</p>

        {lineItem.metadata?.map((metadata, index) => (
          <div key={index}>
            <span>{metadata.label}</span>
            <span>{metadata.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Summary({ summary }: { summary: Summary }) {
  return (
    <div className="divide-y divide-gray-100">
      <div className="space-y-1">
        {summary.lineItems.map((lineItem) => (
          <div className="flex justify-between">
            <div>
              <span>{lineItem.label}</span>
              <span>{lineItem.subtext}</span>
            </div>

            <span>{lineItem.value}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <span>{summary.totalLabel ?? 'Total'}</span>
        <span>{summary.total}</span>
      </div>
    </div>
  );
}
