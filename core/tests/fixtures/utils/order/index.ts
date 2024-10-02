import { type Page } from '@playwright/test';
import { Order } from './order';
import { createOrder } from './create';
import { deleteOrder } from './delete';

export class OrderFactory {
  autoCleanup = false;
  private orders: Order[] = [];

  constructor(private readonly page: Page) {}

  async create(customerId: number, productId: number, variant_id: number) {
    const orderData = await createOrder(customerId, productId, variant_id);

    const order = new Order(
      this.page,
      orderData.id,
      orderData.status_id,
      orderData.customer_id,
      orderData.billing_address,
      orderData.shipping_addresses,
      orderData.products,
    );

    this.orders.push(order);

    return order;
  }

  async cleanup() {
    await Promise.all(this.orders.map(async (order) => await deleteOrder(order.id)));
  }
}
