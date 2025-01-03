import { Suspense, use } from 'react';

import { Order, OrderListItem } from './order-list-item';

interface Props {
  orders: Order[] | Promise<Order[]>;
  orderNumberLabel?: string;
  totalLabel?: string;
  viewDetailsLabel?: string;
}

export function OrderList(props: Props) {
  return (
    <Suspense fallback={<OrderListSkeleton />}>
      <OrderListInner {...props} />
    </Suspense>
  );
}

function OrderListInner({ orders, orderNumberLabel, totalLabel, viewDetailsLabel }: Props) {
  const resolved = orders instanceof Promise ? use(orders) : orders;

  return (
    <div className="@container">
      {resolved.map((order) => (
        <OrderListItem
          key={order.id}
          order={order}
          orderNumberLabel={orderNumberLabel}
          totalLabel={totalLabel}
          viewDetailsLabel={viewDetailsLabel}
        />
      ))}
    </div>
  );
}

export function OrderListSkeleton() {
  return <div>Loading...</div>;
}
