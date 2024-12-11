import { faker } from '@faker-js/faker/locale/en_US';
import { z } from 'zod';

const Address = z.object({
  first_name: z.string(),
  last_name: z.string(),
  street_1: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  country: z.string(),
});

const OrderResponse = z.object({
  id: z.number(),
  customer_id: z.number(),
  date_created: z.string(),
  status_id: z.number(),
  status: z.string(),
  subtotal_ex_tax: z.string(),
  subtotal_tax: z.string(),
  total_inc_tax: z.string(),
  items_total: z.number(),
  discount_amount: z.string(),
  coupon_discount: z.string(),
  billing_address: Address,
});

export async function createOrder(productId: number, customerId?: number) {
  const status_id = 1;
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

  const orderData = {
    status_id,
    customer_id: customerId ?? 0,
    billing_address: {
      first_name: firstName,
      last_name: lastName,
      street_1: street1,
      city,
      state,
      zip,
      country,
    },
    products: [
      {
        product_id: productId,
        quantity: 1,
      },
    ],
  };

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

  return OrderResponse.parse(data);
}
