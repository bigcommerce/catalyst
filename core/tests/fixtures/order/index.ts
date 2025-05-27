import { z } from 'zod';

import { testEnv } from '~/tests/environment';
import { Fixture } from '~/tests/fixtures/fixture';

import { OrderAddress } from './address';
import { Order } from './order';

export class OrderFixture extends Fixture {
  orders: Order[] = [];

  async createWithDefaultProduct(customerId?: number): Promise<Order> {
    if (!testEnv.DEFAULT_PRODUCT_ID) {
      throw new Error(
        'A product ID is required to create an order. Provide a product ID or set the TEST_DEFAULT_SIMPLE_PRODUCT_ID environment variable.',
      );
    }

    return this.create(testEnv.DEFAULT_PRODUCT_ID, customerId);
  }

  async create(productId: number, customerId?: number): Promise<Order> {
    const orderData = {
      status_id: 1,
      customer_id: customerId ?? 0,
      billing_address: OrderAddress.fakeCreateData(),
      products: [
        {
          product_id: productId,
          quantity: 1,
        },
      ],
    };

    const resp = await this.api.post('/v2/orders', orderData).parse(Order.schema);
    const order = Order.fromApiResponse(resp);

    this.orders.push(order);

    return order;
  }

  async deleteAllCustomerOrders(customerId: number): Promise<void> {
    const orders = await this.api
      .get(`/v2/orders?customer_id=${customerId}&is_deleted=false`)
      .parse(z.array(Order.schema).optional());

    await this.deleteOrders(orders?.map(({ id }) => id) ?? []);
  }

  async deleteOrders(ids: number[]) {
    if (ids.length > 0) {
      await Promise.all(ids.map((id) => this.api.delete(`/v2/orders/${id}`)));
    }
  }

  async cleanup() {
    await this.deleteOrders(this.orders.map(({ id }) => id));
  }
}
