import { CursorPagination, CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';

import { OrderList } from './order-list';
import { Order } from './order-list-item';

type Props = {
  title?: string;
  orders: Order[] | Promise<Order[]>;
  paginationInfo?: CursorPaginationInfo | Promise<CursorPaginationInfo>;
};

export function OrderListSection({ title = 'Orders', orders, paginationInfo }: Props) {
  return (
    <div className="@container">
      <h1 className="mb-8 hidden text-4xl font-medium leading-tight tracking-tight @2xl:block">
        {title}
      </h1>
      <OrderList orders={orders} />
      {paginationInfo && <CursorPagination info={paginationInfo} />}
    </div>
  );
}
