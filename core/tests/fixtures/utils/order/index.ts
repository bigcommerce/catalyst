import { type Page } from '@playwright/test';

import { createOrder } from './create';
import { deleteOrder } from './delete';
import { Order } from './order';

export class OrderFactory {
  autoCleanup = false;
  private orders: Order[] = [];

  constructor(private readonly page: Page) {}

  async create(customerId: number, productId: number) {
    const orderData = await createOrder(customerId, productId);

    const order = new Order(
      this.page,
      orderData.id,
      orderData.customer_id,
      orderData.date_created,
      orderData.status_id,
      orderData.status,
      orderData.subtotal_ex_tax,
      orderData.subtotal_tax,
      orderData.total_inc_tax,
      orderData.items_total,
      orderData.discount_amount,
      orderData.coupon_discount,
      orderData.billing_address,
    );

    this.orders.push(order);

    return order;
  }

  async cleanup() {
    await Promise.all(this.orders.map(async (order) => await deleteOrder(order.id)));
  }
}
