export interface OrderListLineItem {
  id: string;
  title: string;
  subtitle?: string;
  price: string;
  href?: string;
  image?: { src: string; alt: string };
}

// @todo does this type need to be different than OrderDetailsSection?
export interface Order {
  id: string;
  totalPrice: string;
  status: string;
  href: string;
  lineItems: OrderListLineItem[];
}

export interface OrderListData {
  // @todo should this be streamable?
  orders: Order[] | Promise<Order[]>;
}

export { OrderListSection } from '@/vibes/soul/sections/order-list-section';
