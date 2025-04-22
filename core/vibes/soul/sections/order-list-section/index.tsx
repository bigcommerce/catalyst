import { CursorPagination, CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { type OrderListData } from '~/ui/order-list-section';

import { OrderList } from './order-list';

interface Props extends OrderListData {
  title?: string;
  paginationInfo?: CursorPaginationInfo | Promise<CursorPaginationInfo>;
  orderNumberLabel?: string;
  totalLabel?: string;
  viewDetailsLabel?: string;
}

export function OrderListSection({
  title = 'Orders',
  orders,
  paginationInfo,
  orderNumberLabel,
  totalLabel,
  viewDetailsLabel,
}: Props) {
  return (
    <div className="@container">
      <h1 className="mb-8 hidden text-4xl leading-tight font-medium tracking-tight @2xl:block">
        {title}
      </h1>
      <OrderList
        orderNumberLabel={orderNumberLabel}
        orders={orders}
        totalLabel={totalLabel}
        viewDetailsLabel={viewDetailsLabel}
      />
      {paginationInfo && <CursorPagination info={paginationInfo} />}
    </div>
  );
}
