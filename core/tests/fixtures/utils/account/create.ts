import { faker } from '@faker-js/faker';
import { z } from 'zod';

const Customer = z.object({
  id: z.number(),
});

const CreateCustomersResponse = z.object({
  data: z.array(Customer),
});

export async function createAccount() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = faker.internet.email({ firstName, lastName, provider: 'example.com' });
  // Prefix is added to ensure that the password requirements are met
  const password = faker.internet.password({ pattern: /[a-zA-Z0-9]/, prefix: '1At', length: 10 });
  const address1 = faker.location.streetAddress();
  const city = faker.location.city();
  const state = faker.location.state();
  const postal_code = faker.location.zipCode('#####');

  if (!process.env.BIGCOMMERCE_ACCESS_TOKEN) {
    throw new Error('BIGCOMMERCE_ACCESS_TOKEN is not set');
  }

  if (!process.env.BIGCOMMERCE_STORE_HASH) {
    throw new Error('BIGCOMMERCE_STORE_HASH is not set');
  }

  const response = await fetch(
    `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/customers`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
      },
      body: JSON.stringify([
        {
          first_name: firstName,
          last_name: lastName,
          email,
          authentication: {
            new_password: password,
          },
          addresses: [
            {
              first_name: firstName,
              last_name: lastName,
              address1,
              city,
              state_or_province: state,
              country_code: 'US',
              postal_code,
            },
          ],
          origin_channel_id: process.env.BIGCOMMERCE_CHANNEL_ID,
        },
      ]),
    },
  );

  const data: unknown = await response.json();
  const parsedResponse = CreateCustomersResponse.parse(data);
  const customer = Customer.parse(parsedResponse.data[0]);

  return {
    firstName,
    lastName,
    email,
    password,
    id: customer.id,
  };
}
