import { faker } from '@faker-js/faker';
import { z } from 'zod';

const Address = z.object({
  first_name: z.string(),
  last_name: z.string(),
  company: z.string().optional(),
  street_1: z.string(),
  street_2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  country: z.string(),
});

const OrderProduct = z.object({
  product_id: z.number(),
  variant_id: z.number(),
  quantity: z.number(),
});

const Order = z.object({
  id: z.number(),
  status_id: z.number(),
  customer_id: z.number(),
  date_created: z.string(),
  status: z.string(),
  items_total: z.number(),
  discount_amount: z.string(),
  coupon_discount: z.string(),
  billing_address: Address,
  shipping_addresses: z.array(Address),
  products: z.array(OrderProduct),
});

const CreateOrderResponse = z.object({
  data: Order,
});

export async function createOrder(customerId: number, productId: number, variantId: number) {
  const status_id = 0;
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const street1 = faker.location.streetAddress();
  const city = faker.location.city();
  const state = faker.location.state();
  const zip = faker.location.zipCode('#####');
  const country = 'United States';

  if (!process.env.BIGCOMMERCE_ACCESS_TOKEN) {
    throw new Error('BIGCOMMERCE_ACCESS_TOKEN is not set');
  }

  if (!process.env.BIGCOMMERCE_STORE_HASH) {
    throw new Error('BIGCOMMERCE_STORE_HASH is not set');
  }

  console.log('Variant Id is: ', variantId);
  const orderData = {
    status_id,
    customer_id: customerId,
    billing_address: {
      first_name: firstName,
      last_name: lastName,
      street_1: street1,
      city,
      state,
      zip,
      country,
    },
    shipping_addresses: [
      {
        first_name: firstName,
        last_name: lastName,
        street_1: street1,
        city,
        state,
        zip,
        country,
      },
    ],
    products: [
      {
        product_id: productId,
        variant_id: variantId,
        quantity: 1,
      },
    ],
  };

  console.log(orderData);

  const response = await fetch(
    `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v2/orders`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
        Accept: 'application/json',
      },
      body: JSON.stringify(orderData),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Order creation API request failed with status ${response.status}: ${errorText}`,
    );
  }

  const data: unknown = await response.json();
  const order = CreateOrderResponse.parse(data);

  return order;
}
