import { Suspense, use } from 'react'

import { Order, OrderListItem } from './order-list-item'

type Props = {
  orders: Order[] | Promise<Order[]>
}

export function OrderList(props: Props) {
  return (
    <Suspense fallback={<OrderListSkeleton />}>
      <OrderListInner {...props} />
    </Suspense>
  )
}

function OrderListInner({ orders }: Props) {
  const resolved = orders instanceof Promise ? use(orders) : orders

  return (
    <div className="@container">
      {resolved.map(order => (
        <OrderListItem key={order.id} order={order} />
      ))}
    </div>
  )
}

export function OrderListSkeleton() {
  return <div>Loading...</div>
}
