import { faker } from '@faker-js/faker';
import { z } from 'zod';

import { testEnv } from '~/tests/environment';

import { Address, AddressCreateData } from './address';

type RequiredCreateFields = 'first_name' | 'last_name' | 'email';
type CustomerData = z.infer<typeof Customer.schema>;
type CustomerCreateData = PartialRequired<
  Omit<CustomerData, 'addresses'> & {
    authentication?: { new_password: string };
    addresses?: AddressCreateData[];
  },
  RequiredCreateFields
>;

export class Customer {
  static readonly schema = z.object({
    id: z.number(),
    address_count: z.number().optional(),
    addresses: z.array(Address.schema).optional(),
    company: z.string().optional(),
    customer_group_id: z.number().optional(),
    email: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    notes: z.string().optional(),
    phone: z.string().optional(),
    origin_channel_id: z.number(),
    channel_ids: z.nullable(z.array(z.number())),
  });

  constructor(
    readonly id: number,
    readonly email: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly originChannelId: number,
    readonly channelIds: number[] | null,
    public password?: string, // Not part of API response, but needed for testing
    readonly addressCount = 0,
    readonly addresses: Address[] = [],
    readonly company?: string,
    readonly customerGroupId = 0,
    readonly notes?: string,
    readonly phone?: string,
  ) {}

  static fakeCreateData(password: string, createFakeAddress?: boolean): CustomerCreateData {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName, provider: 'example.com' });

    return {
      first_name: firstName,
      last_name: lastName,
      email,
      authentication: {
        new_password: password,
      },
      ...(createFakeAddress
        ? { addresses: [Address.fakeCreateData({ firstName, lastName })] }
        : {}),
      origin_channel_id: Number(testEnv.BIGCOMMERCE_CHANNEL_ID),
    };
  }

  static fromApiResponse(data: CustomerData, password?: string): Customer {
    return new Customer(
      data.id,
      data.email,
      data.first_name,
      data.last_name,
      data.origin_channel_id,
      data.channel_ids,
      password,
      data.address_count,
      data.addresses?.map(Address.fromApiResponse),
      data.company,
      data.customer_group_id,
      data.notes,
      data.phone,
    );
  }
}
