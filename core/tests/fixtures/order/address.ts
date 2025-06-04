import { faker } from '@faker-js/faker';
import { z } from 'zod';

export class OrderAddress {
  static readonly schema = z.object({
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
  });

  static readonly createSchema = z.object({
    first_name: z.string(),
    last_name: z.string(),
    company: z.string().optional(),
    street_1: z.string(),
    street_2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string(),
    country: z.string().optional(),
    country_iso2: z.string(),
    phone: z.string().optional(),
    email: z.string().optional(),
  });

  constructor(
    readonly firstName: string,
    readonly lastName: string,
    readonly street1: string,
    readonly zip: string,
    readonly country: string,
    readonly countryIso2: string,
    readonly city?: string,
    readonly email?: string,
    readonly company?: string,
    readonly street2?: string,
    readonly state?: string,
    readonly phone?: string,
  ) {}

  static fakeCreateData(
    email?: string,
    firstName?: string,
    lastName?: string,
  ): z.infer<typeof OrderAddress.createSchema> {
    const first = firstName ?? faker.person.firstName();
    const last = lastName ?? faker.person.lastName();
    const street1 = faker.location.streetAddress();
    const city = faker.location.city();
    const state = faker.location.state();
    const zip = faker.location.zipCode('#####');
    const countryCode = 'US';

    return {
      first_name: first,
      last_name: last,
      email,
      street_1: street1,
      city,
      state,
      zip,
      country_iso2: countryCode,
    };
  }

  static fromApiResponse(data: z.infer<typeof OrderAddress.schema>): OrderAddress {
    return new OrderAddress(
      data.first_name,
      data.last_name,
      data.street_1,
      data.zip,
      data.country,
      data.country_iso2,
      data.city,
      data.email,
      data.company,
      data.street_2,
      data.state,
      data.phone,
    );
  }
}
