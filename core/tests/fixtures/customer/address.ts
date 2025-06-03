import { faker } from '@faker-js/faker';
import { z } from 'zod';

type RequiredCreateFields =
  | 'first_name'
  | 'last_name'
  | 'address1'
  | 'city'
  | 'state_or_province'
  | 'country_code'
  | 'postal_code';

type AddressData = z.infer<typeof Address.schema>;
export type AddressCreateData = PartialRequired<AddressData, RequiredCreateFields>;

export class Address {
  static readonly schema = z.object({
    id: z.number(),
    address1: z.string(),
    address2: z.string().optional(),
    address_type: z.string(),
    city: z.string(),
    company: z.string().optional(),
    country: z.string(),
    country_code: z.string(),
    customer_id: z.number().optional(),
    first_name: z.string(),
    last_name: z.string(),
    phone: z.string().optional(),
    postal_code: z.string(),
    state_or_province: z.string().optional(),
  });

  constructor(
    readonly id: number,
    readonly address1: string,
    readonly city: string,
    readonly country: string,
    readonly countryCode: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly postalCode: string,
    readonly customerId?: number,
    readonly addressType = 'residential',
    readonly address2?: string,
    readonly company?: string,
    readonly phone?: string,
    readonly stateOrProvince?: string,
  ) {}

  static fakeCreateData({
    firstName,
    lastName,
    customerId,
  }: {
    firstName?: string;
    lastName?: string;
    customerId?: number;
  }): AddressCreateData {
    const first = firstName ?? faker.person.firstName();
    const last = lastName ?? faker.person.lastName();
    const address1 = faker.location.streetAddress();
    const city = faker.location.city();
    const state = faker.location.state();
    const postal_code = faker.location.zipCode('#####');

    return {
      ...(customerId ? { customer_id: customerId } : {}),
      first_name: first,
      last_name: last,
      address1,
      city,
      state_or_province: state,
      country_code: 'US',
      postal_code,
    };
  }

  static fromApiResponse(data: AddressData) {
    return new Address(
      data.id,
      data.address1,
      data.city,
      data.country,
      data.country_code,
      data.first_name,
      data.last_name,
      data.postal_code,
      data.customer_id,
      data.address_type,
      data.address2,
      data.company,
      data.phone,
      data.state_or_province,
    );
  }
}
