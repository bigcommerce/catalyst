import { clsx } from 'clsx';

import { Badge } from '@/ui/primitives/badge';
import { ButtonLink } from '@/ui/primitives/button-link';

import { OrderListLineItem } from './order-list-line-item';

export interface Order {
  id: string;
  totalPrice: string;
  status: string;
  href: string;
  lineItems: OrderListLineItem[];
}

interface Props {
  className?: string;
  order: Order;
  orderNumberLabel?: string;
  totalLabel?: string;
  viewDetailsLabel?: string;
}

export function OrderListItem({
  className,
  order,
  orderNumberLabel = 'Order #',
  totalLabel = 'Total',
  viewDetailsLabel = 'View details',
}: Props) {
  return (
    <div
      className={clsx(
        'border-contrast-100 border-t pt-5 pb-6 last:border-b @lg:pt-6 @lg:pb-10',
        className,
      )}
    >
      <div className="flex flex-col justify-between gap-x-10 gap-y-4 @lg:flex-row">
        <div className="flex items-start gap-x-12">
          <div>
            <span className="text-contrast-500 font-mono text-xs leading-normal uppercase">
              {orderNumberLabel}
            </span>
            <span className="block text-lg leading-normal font-semibold">{order.id}</span>
          </div>
          <div>
            <span className="text-contrast-500 font-mono text-xs leading-normal uppercase">
              {totalLabel}
            </span>
            <span className="block text-lg leading-normal font-semibold">{order.totalPrice}</span>
          </div>
          <Badge className="mt-0.5">{order.status}</Badge>
        </div>

        <ButtonLink href={order.href} size="small">
          {viewDetailsLabel}
        </ButtonLink>
      </div>

      <div className="mt-6 flex gap-4 overflow-hidden [mask-image:linear-gradient(to_right,_black_0%,_black_80%,_transparent_98%)]">
        {order.lineItems.map((lineItem) => (
          <OrderListLineItem key={lineItem.id} lineItem={lineItem} />
        ))}
      </div>
    </div>
  );
}
