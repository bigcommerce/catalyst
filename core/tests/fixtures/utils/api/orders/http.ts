import { faker } from '@faker-js/faker';
import { z } from 'zod';

import { testEnv } from '~/tests/environment';

import { httpClient } from '../client';

import { Order, OrderAddress, OrdersApi } from '.';

const OrderAddressSchema = z
  .object({
    first_name: z.string(),
    last_name: z.string(),
    company: z.string().optional(),
    street_1: z.string(),
    street_2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string(),
    country: z.string(),
    country_iso2: z.string(),
    phone: z.string().optional(),
    email: z.string().optional(),
  })
  .transform(
    (data): OrderAddress => ({
      firstName: data.first_name,
      lastName: data.last_name,
      company: data.company,
      street1: data.street_1,
      street2: data.street_2,
      city: data.city,
      state: data.state,
      zip: data.zip,
      country: data.country,
      countryIso2: data.country_iso2,
      phone: data.phone,
      email: data.email,
    }),
  );

const OrderSchema = z
  .object({
    id: z.number(),
    customer_id: z.number(),
    currency_code: z.string(),
    currency_id: z.number(),
    date_created: z.string(),
    default_currency_code: z.string(),
    default_currency_id: z.number(),
    status_id: z.number(),
    status: z.string(),
    subtotal_ex_tax: z.string(),
    subtotal_tax: z.string(),
    total_inc_tax: z.string(),
    items_total: z.number(),
    discount_amount: z.string(),
    coupon_discount: z.string(),
    billing_address: OrderAddressSchema,
  })
  .transform(
    (data): Order => ({
      id: data.id,
      customerId: data.customer_id,
      currencyCode: data.currency_code,
      currencyId: data.currency_id,
      dateCreated: data.date_created,
      defaultCurrencyCode: data.default_currency_code,
      defaultCurrencyId: data.default_currency_id,
      statusId: data.status_id,
      status: data.status,
      subtotalExTax: data.subtotal_ex_tax,
      subtotalTax: data.subtotal_tax,
      totalIncTax: data.total_inc_tax,
      itemsTotal: data.items_total,
      discountAmount: data.discount_amount,
      couponDiscount: data.coupon_discount,
      billingAddress: data.billing_address,
    }),
  );

export const ordersHttpClient: OrdersApi = {
  get: async (customerId?: number): Promise<Order[]> => {
    const params = new URLSearchParams({
      is_deleted: 'false',
      ...(customerId ? { customer_id: customerId.toString() } : {}),
    });

    const resp = await httpClient
      .get(`/v2/orders?${params}`)
      .parse(z.array(OrderSchema).optional());

    return resp ?? [];
  },
  create: async (productId: number, customerId?: number): Promise<Order> => {
    const first = faker.person.firstName();
    const last = faker.person.lastName();
    const street1 = faker.location.streetAddress();
    const city = faker.location.city();
    const state = faker.location.state();
    const zip = faker.location.zipCode('#####');
    const countryCode = 'US';

    return httpClient
      .post('/v2/orders', {
        status_id: 1,
        channel_id: testEnv.BIGCOMMERCE_CHANNEL_ID ?? 1,
        customer_id: customerId ?? 0,
        billing_address: {
          first_name: first,
          last_name: last,
          email: faker.internet.email({
            firstName: first,
            lastName: last,
            provider: 'example.com',
          }),
          street_1: street1,
          city,
          state,
          zip,
          country_iso2: countryCode,
        },
        products: [
          {
            product_id: productId,
            quantity: 1,
          },
        ],
      })
      .parse(OrderSchema);
  },
  delete: async (ids: number[]): Promise<void> => {
    if (ids.length > 0) {
      await Promise.all(ids.map((id) => httpClient.delete(`/v2/orders/${id}`)));
    }
  },
};
