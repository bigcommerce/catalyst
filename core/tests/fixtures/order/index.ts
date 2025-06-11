import { testEnv } from '~/tests/environment';
import { Fixture } from '~/tests/fixtures/fixture';
import { Order } from '~/tests/fixtures/utils/api/orders';

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
    this.skipIfReadonly();

    const order = await this.api.orders.create(productId, customerId);

    this.orders.push(order);

    return order;
  }

  async deleteAllCustomerOrders(customerId: number): Promise<void> {
    this.skipIfReadonly();

    const orders = await this.api.orders.get(customerId);

    await this.api.orders.delete(orders.map(({ id }) => id));
  }

  async cleanup() {
    await this.api.orders.delete(this.orders.map(({ id }) => id));
  }
}
