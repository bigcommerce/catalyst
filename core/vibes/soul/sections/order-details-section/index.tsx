import { ArrowLeft } from 'lucide-react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Badge } from '@/vibes/soul/primitives/badge';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';
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
  totalPrice: string;
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

interface OrderDetailsSectionProps {
  order: Streamable<Order>;
  title?: string;
  orderSummaryLabel?: string;
  shipmentAddressLabel?: string;
  shipmentMethodLabel?: string;
  summaryTotalLabel?: string;
  prevHref?: string;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --order-details-section-focus: hsl(var(--primary));
 *   --order-details-section-font-family: hsl(var(--font-family-body));
 *   --order-details-section-title-font-family: hsl(var(--font-family-heading));
 *   --order-details-text-primary: hsl(var(--foreground));
 *   --order-details-text-secondary: hsl(var(--contrast-500));
 *   --order-details-section-border: hsl(var(--contrast-100));
 *   --order-details-section-button-border: hsl(var(--contrast-100));
 *   --order-details-section-button-border-hover: hsl(var(--contrast-200));
 *   --order-details-section-button-icon: hsl(var(--foreground));
 *   --order-details-section-button-background: hsl(var(--background));
 *   --order-details-section-button-background-hover: hsl(var(--contrast-100));
 *   --order-details-section-image-background: hsl(var(--contrast-100));
 *   --order-details-section-line-item: hsl(var(--contrast-300))
 *   --order-details-section-line-item-subtitle: hsl(var(--contrast-500))
 *   --order-details-section-line-item-subtext: hsl(var(--contrast-400))
 * }
 * ```
 */
export function OrderDetailsSection({
  order: streamableOrder,
  title,
  orderSummaryLabel = 'Order summary',
  shipmentAddressLabel,
  shipmentMethodLabel,
  summaryTotalLabel,
  prevHref = '/orders',
}: OrderDetailsSectionProps) {
  return (
    <div className="font-[family-name:var(--order-details-section-font-family,var(--font-family-body))] text-[var(--order-details-text-primary,hsl(var(--foreground)))] @container">
      <Stream
        fallback={<OrderDetailsSectionSkeleton prevHref={prevHref} />}
        value={streamableOrder}
      >
        {(order) => (
          <>
            <div className="flex gap-4 border-b border-[var(--order-details-section-border,hsl(var(--contrast-100)))] pb-8">
              {prevHref !== '' && (
                <ButtonLink href={prevHref} shape="circle" size="small" variant="ghost">
                  <ArrowLeft />
                </ButtonLink>
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="font-[family-name:var(--order-details-section-title-font-family,var(--font-family-heading))] text-4xl">
                    {title ?? `Order #${order.id}`}
                  </h1>
                  <Badge variant={order.statusColor}>{order.status}</Badge>
                </div>
                <p className="text-base font-light">{order.date}</p>
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
                <div className="font-[family-name:var(--order-details-section-title-font-family,var(--font-family-heading))] text-2xl font-medium">
                  {orderSummaryLabel}
                </div>
                <Summary summary={order.summary} totalLabel={summaryTotalLabel} />
              </div>
            </div>
          </>
        )}
      </Stream>
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
    <div className="border-b border-[var(--order-details-section-border,hsl(var(--contrast-100)))] py-8 @container">
      <div className="space-y-6">
        <div className="font-[family-name:var(--order-details-section-title-font-family,var(--font-family-heading))] text-2xl font-medium">
          {destination.title}
        </div>
        <div className="grid gap-8 @xl:flex @xl:gap-20">
          <div className="text-sm">
            <h3 className="font-semibold">{addressLabel}</h3>
            <div className="text-[var(--order-details-text-secondary,hsl(var(--contrast-500)))]">
              <p>{destination.address.name}</p>
              <p>{destination.address.street1}</p>
              <p>{destination.address.street2}</p>
              <p>
                {`${destination.address.city}, ${destination.address.state} ${destination.address.zipcode}`}
              </p>
              <p>{destination.address.country}</p>
            </div>
          </div>
          {destination.shipments.map((shipment, index) => (
            <div className="text-sm" key={`${shipment.name}-${index}`}>
              <h3 className="font-semibold">{methodLabel}</h3>
              <div className="text-[var(--order-details-text-secondary,hsl(var(--contrast-500)))]">
                <p>{shipment.name}</p>
                <p>{shipment.status}</p>
                <ShipmentTracking tracking={shipment.tracking} />
              </div>
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

function ShipmentSkeleton({
  shipmentsPlaceholderCount = 1,
  lineItemsPlaceholderCount = 2,
}: {
  shipmentsPlaceholderCount?: number;
  lineItemsPlaceholderCount?: number;
}) {
  return (
    <div className="border-b border-[var(--order-details-section-border,hsl(var(--contrast-100)))] py-8 @container">
      <div className="space-y-6">
        <Skeleton.Text characterCount={8} className="rounded text-2xl" />
        <div className="grid gap-8 @xl:flex @xl:gap-20">
          <div className="text-sm">
            <Skeleton.Text characterCount={13} className="rounded" />
            <div>
              <Skeleton.Text characterCount={8} className="rounded" />
              <Skeleton.Text characterCount={12} className="rounded" />
              <Skeleton.Text characterCount={16} className="rounded" />
              <Skeleton.Text characterCount={8} className="rounded" />
            </div>
          </div>
          {Array.from({ length: shipmentsPlaceholderCount }).map((_, index) => (
            <div className="text-sm" key={index}>
              <Skeleton.Text characterCount={13} className="rounded" />
              <div>
                <Skeleton.Text characterCount={16} className="rounded" />
                <Skeleton.Text characterCount={8} className="rounded" />
                <Skeleton.Text characterCount={24} className="rounded" />
              </div>
            </div>
          ))}
        </div>
        {Array.from({ length: lineItemsPlaceholderCount }).map((_, index) => (
          <ShipmentLineItemSkeleton key={index} />
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
  const LineItemWrapper = ({ children }: { children: React.ReactNode }) => {
    if (lineItem.href) {
      return (
        <Link
          className="group grid shrink-0 cursor-pointer gap-8 rounded-xl ring-[var(--order-details-section-focus,hsl(var(--primary)))] ring-offset-4 focus-visible:outline-none focus-visible:ring-2 @sm:flex @sm:rounded-2xl"
          href={lineItem.href}
          id={lineItem.id}
        >
          {children}
        </Link>
      );
    }

    return (
      <div
        className="group grid shrink-0 gap-8 rounded-xl ring-[var(--order-details-section-focus,hsl(var(--primary)))] ring-offset-4 focus-visible:outline-none focus-visible:ring-2 @sm:flex @sm:rounded-2xl"
        id={lineItem.id}
      >
        {children}
      </div>
    );
  };

  return (
    <LineItemWrapper>
      <div className="relative aspect-square basis-40 overflow-hidden rounded-[inherit] border border-[var(--order-details-section-border,hsl(var(--contrast-100)))] bg-[var(--order-details-section-image-background,hsl(var(--contrast-100)))]">
        {lineItem.image?.src != null ? (
          <Image
            alt={lineItem.image.alt}
            className="w-full scale-100 select-none object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            fill
            sizes="10rem"
            src={lineItem.image.src}
          />
        ) : (
          <div className="pl-2 pt-3 text-4xl font-bold leading-[0.8] tracking-tighter text-[var(--order-details-section-line-item,hsl(var(--contrast-300)))] transition-transform duration-500 ease-out group-hover:scale-105">
            {lineItem.title}
          </div>
        )}
      </div>

      <div className="space-y-3 text-sm leading-snug">
        <div>
          <div className="flex items-center gap-1 text-sm">
            <span className="font-semibold">{lineItem.title}</span>
            <span>×</span>
            <span className="font-semibold">{lineItem.quantity}</span>
          </div>
          {lineItem.subtitle != null && lineItem.subtitle !== '' && (
            <div className="font-normal text-[var(--order-details-section-line-item-subtitle,hsl(var(--contrast-500)))]">
              {lineItem.subtitle}
            </div>
          )}
        </div>
        <div className="flex gap-1 text-sm">
          <span className="font-semibold">{lineItem.totalPrice}</span>
          {lineItem.quantity > 1 && <span className="font-normal">({lineItem.price} each)</span>}
        </div>
        <div>
          {lineItem.metadata?.map((metadata, index) => (
            <div className="flex gap-1 text-sm" key={`lineItem-meta-${metadata.label}-${index}`}>
              <span className="font-semibold">{metadata.label}:</span>
              <span>{metadata.value}</span>
            </div>
          ))}
        </div>
      </div>
    </LineItemWrapper>
  );
}

function ShipmentLineItemSkeleton() {
  return (
    <div className="group grid shrink-0 gap-8 rounded-xl @sm:flex @sm:rounded-2xl">
      <div className="relative aspect-square basis-40 overflow-hidden rounded-[inherit]">
        <Skeleton.Box className="h-full w-full" />
      </div>

      <div className="space-y-3 text-sm leading-snug">
        <div>
          <div className="flex items-center gap-1 text-sm">
            <Skeleton.Text characterCount={24} className="rounded" />
          </div>
          <Skeleton.Text characterCount={6} className="rounded" />
        </div>
        <div className="flex gap-1 text-sm">
          <Skeleton.Text characterCount={5} className="rounded" />
          <Skeleton.Text characterCount={8} className="rounded" />
        </div>
        <div>
          <div className="flex gap-1 text-sm">
            <Skeleton.Text characterCount={7} className="rounded" />
            <Skeleton.Text characterCount={3} className="rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Summary({ summary, totalLabel = 'Total' }: { summary: Summary; totalLabel?: string }) {
  return (
    <div>
      <div className="space-y-2 pb-3 pt-5">
        {summary.lineItems.map((lineItem, index) => (
          <div className="flex justify-between" key={index}>
            <div>
              <div className="text-sm">{lineItem.label}</div>
              {lineItem.subtext != null && lineItem.subtext !== '' && (
                <div className="text-xs text-[var(--order-details-section-line-item-subtext,hsl(var(--contrast-400)))]">
                  {lineItem.subtext}
                </div>
              )}
            </div>

            <span className="text-sm">{lineItem.value}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between border-t border-[var(--order-details-section-border,hsl(var(--contrast-100)))] py-3 font-semibold">
        <span>{totalLabel}</span>
        <span>{summary.total}</span>
      </div>
    </div>
  );
}

function SummarySkeleton({ placeholderCount = 2 }: { placeholderCount?: number }) {
  return (
    <div>
      <div className="space-y-2 pb-3 pt-5">
        {Array.from({ length: placeholderCount }).map((_, index) => (
          <div className="flex justify-between" key={index}>
            <div>
              <Skeleton.Text characterCount={6} className="rounded text-sm" />
              <Skeleton.Text characterCount={12} className="rounded text-xs" />
            </div>

            <Skeleton.Text characterCount={6} className="rounded text-sm" />
          </div>
        ))}
      </div>
      <div className="flex justify-between border-t border-[var(--order-details-section-border,hsl(var(--contrast-100)))] py-3">
        <Skeleton.Text characterCount={6} className="rounded" />
        <Skeleton.Text characterCount={6} className="rounded" />
      </div>
    </div>
  );
}

function OrderDetailsSectionSkeleton({
  prevHref,
  placeholderCount = 1,
  lineItemsPlaceholderCount = 2,
}: {
  prevHref?: string;
  placeholderCount?: number;
  lineItemsPlaceholderCount?: number;
}) {
  return (
    <div className="animate-pulse">
      <div className="flex gap-4 border-b border-[var(--order-details-section-border,hsl(var(--contrast-100)))] pb-8">
        {prevHref != null && prevHref !== '' && (
          <ButtonLink href={prevHref} shape="circle" size="small" variant="ghost">
            <ArrowLeft />
          </ButtonLink>
        )}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Skeleton.Text characterCount={8} className="rounded text-4xl" />
            <Skeleton.Text characterCount={8} className="rounded text-xs" />
          </div>
          <Skeleton.Text characterCount={7} className="rounded text-base" />
        </div>
      </div>
      <div className="grid @3xl:flex">
        <div className="order-2 flex-1 pr-12 @3xl:order-1">
          {Array.from({ length: placeholderCount }).map((_, index) => (
            <ShipmentSkeleton key={index} lineItemsPlaceholderCount={lineItemsPlaceholderCount} />
          ))}
        </div>
        <div className="order-1 basis-72 pt-8 @3xl:order-2">
          <Skeleton.Text characterCount={10} className="rounded text-2xl" />
          <SummarySkeleton placeholderCount={3} />
        </div>
      </div>
    </div>
  );
}
