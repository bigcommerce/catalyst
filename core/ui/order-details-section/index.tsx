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
  href?: string;
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

export interface OrderData {
  order: Order;
}

export { OrderDetailsSection } from '@/vibes/soul/sections/order-details-section';
