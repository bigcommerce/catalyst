import { z } from 'zod';

import { testEnv } from '~/tests/environment';
import {
  Address,
  CreateAddressData,
  CreateCustomerData,
  CreateWishlistData,
  Customer,
  CustomersApi,
  Wishlist,
} from '~/tests/fixtures/utils/api/customers';

import { httpClient } from '../client';
import { apiResponseSchema } from '../schema';

const AddressSchema = z
  .object({
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
  })
  .transform(
    (data): Address => ({
      id: data.id,
      address1: data.address1,
      city: data.city,
      country: data.country,
      countryCode: data.country_code,
      firstName: data.first_name,
      lastName: data.last_name,
      postalCode: data.postal_code,
      customerId: data.customer_id,
      addressType: data.address_type,
      address2: data.address2,
      company: data.company,
      phone: data.phone,
      stateOrProvince: data.state_or_province,
    }),
  );

const AddressCreateSchema = z.object({
  customer_id: z.number().optional(),
  first_name: z.string(),
  last_name: z.string(),
  address1: z.string(),
  address2: z.string().optional(),
  city: z.string(),
  company: z.string().optional(),
  country_code: z.string(),
  phone: z.string().optional(),
  postal_code: z.string(),
  state_or_province: z.string().optional(),
});

const CustomerSchema = z
  .object({
    id: z.number(),
    address_count: z.number().optional(),
    addresses: z.array(AddressSchema).optional(),
    company: z.string().optional(),
    customer_group_id: z.number().optional(),
    email: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    notes: z.string().optional(),
    phone: z.string().optional(),
    origin_channel_id: z.number(),
    channel_ids: z.nullable(z.array(z.number())),
  })
  .transform(
    (data): Customer => ({
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      originChannelId: data.origin_channel_id,
      channelIds: data.channel_ids,
      addressCount: data.address_count ?? 0,
      addresses: data.addresses,
      company: data.company,
      customerGroupId: data.customer_group_id ?? 0,
      notes: data.notes,
      phone: data.phone,
    }),
  );

const CustomerCreateSchema = z.object({
  addresses: z.array(AddressCreateSchema).optional(),
  authentication: z
    .object({
      new_password: z.string(),
    })
    .optional(),
  company: z.string().optional(),
  customer_group_id: z.number().optional(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  notes: z.string().optional(),
  phone: z.string().optional(),
  origin_channel_id: z.number(),
  channel_ids: z.nullable(z.array(z.number())).optional(),
});

const WishlistSchema = z
  .object({
    id: z.number(),
    customer_id: z.number(),
    name: z.string(),
    is_public: z.boolean(),
    token: z.string(),
    items: z.array(
      z.object({
        id: z.number(),
        product_id: z.number(),
        variant_id: z.number().optional(),
      }),
    ),
  })
  .transform(
    (data): Wishlist => ({
      id: data.id,
      customerId: data.customer_id,
      name: data.name,
      isPublic: data.is_public,
      token: data.token,
      items: data.items.map((item) => ({
        id: item.id,
        productId: item.product_id,
        variantId: item.variant_id,
      })),
    }),
  );

const WishlistCreateSchema = z.object({
  customer_id: z.number(),
  name: z.string(),
  is_public: z.boolean(),
  items: z.array(
    z.object({
      product_id: z.number(),
      variant_id: z.number().optional(),
    }),
  ),
});

const transformCreateAddressData = (data: CreateAddressData): z.infer<typeof AddressCreateSchema> =>
  AddressCreateSchema.parse({
    customer_id: data.customerId,
    first_name: data.firstName,
    last_name: data.lastName,
    address1: data.address1,
    address2: data.address2,
    city: data.city,
    company: data.company,
    country_code: data.countryCode,
    phone: data.phone,
    postal_code: data.postalCode,
    state_or_province: data.stateOrProvince,
  });

const transformCreateCustomerData = (
  data: CreateCustomerData,
): z.infer<typeof CustomerCreateSchema> =>
  CustomerCreateSchema.parse({
    authentication: { new_password: data.password },
    email: data.email,
    first_name: data.firstName,
    last_name: data.lastName,
    origin_channel_id: data.originChannelId,
    channel_ids: data.channelIds ?? null,
    company: data.company,
    customer_group_id: data.customerGroupId ?? 0,
    notes: data.notes,
    phone: data.phone,
    addresses: data.addresses?.map(transformCreateAddressData),
  });

const transformCreateWishlistData = (data: CreateWishlistData) =>
  WishlistCreateSchema.parse({
    customer_id: data.customerId,
    name: data.name,
    is_public: data.isPublic,
    items: data.items.map((item) => ({
      product_id: item.productId,
      variant_id: item.variantId,
    })),
  });

export const customersHttpClient: CustomersApi = {
  getById: async (customerId: number, includeAddresses = false): Promise<Customer> => {
    const addressesQuery = includeAddresses ? '&include=addresses' : '';
    const resp = await httpClient
      .get(`/v3/customers?id:in=${customerId}${addressesQuery}`)
      .parse(apiResponseSchema(z.array(CustomerSchema)));

    const customer = resp.data[0];

    if (!customer) {
      throw new Error(`No customer found with the provided ID: ${customerId}`);
    }

    if (customer.originChannelId !== (testEnv.BIGCOMMERCE_CHANNEL_ID ?? 1)) {
      throw new Error(
        `Customer ${customerId} is not from the correct channel. Expected ${
          testEnv.BIGCOMMERCE_CHANNEL_ID ?? 1
        }, got ${customer.originChannelId}.`,
      );
    }

    return customer;
  },
  getByEmail: async (email: string, includeAddresses = false): Promise<Customer> => {
    const addressesQuery = includeAddresses ? '&include=addresses' : '';
    const resp = await httpClient
      .get(`/v3/customers?email:in=${email}${addressesQuery}`)
      .parse(apiResponseSchema(z.array(CustomerSchema)));

    const customer = resp.data[0];

    if (!customer) {
      throw new Error(`No customer found with the provided email: ${email}`);
    }

    if (customer.originChannelId !== (testEnv.BIGCOMMERCE_CHANNEL_ID ?? 1)) {
      throw new Error(
        `Customer ${customer.id} is not from the correct channel. Expected ${
          testEnv.BIGCOMMERCE_CHANNEL_ID ?? 1
        }, got ${customer.originChannelId}.`,
      );
    }

    return customer;
  },
  getAddresses: async (customerId: number): Promise<Address[]> => {
    const resp = await httpClient
      .get(`/v3/customers/addresses?customer_id:in=${customerId}`)
      .parse(apiResponseSchema(z.array(AddressSchema)));

    return resp.data;
  },
  getWishlists: async (customerId: number): Promise<Wishlist[]> => {
    const resp = await httpClient
      .get(`/v3/wishlists?customer_id=${customerId}`)
      .parse(apiResponseSchema(z.array(WishlistSchema)));

    return resp.data;
  },
  create: async (data: CreateCustomerData): Promise<Customer> => {
    const resp = await httpClient
      .post('/v3/customers', [transformCreateCustomerData(data)])
      .parse(apiResponseSchema(z.array(CustomerSchema)));

    const customer = resp.data[0];

    if (!customer) {
      throw new Error('Customer not found in response');
    }

    customer.password = data.password;

    return customer;
  },
  createAddress: async (data: CreateAddressData): Promise<Address> => {
    const resp = await httpClient
      .post('/v3/customers/addresses', [transformCreateAddressData(data)])
      .parse(apiResponseSchema(z.array(AddressSchema)));

    const createdAddress = resp.data[0];

    if (!createdAddress) {
      throw new Error('No address found in response');
    }

    return createdAddress;
  },
  createWishlist: async (data: CreateWishlistData): Promise<Wishlist> => {
    const resp = await httpClient
      .post('/v3/wishlists', transformCreateWishlistData(data))
      .parse(apiResponseSchema(WishlistSchema));

    return resp.data;
  },
  delete: async (ids: number[]): Promise<void> => {
    if (ids.length > 0) {
      await httpClient.delete(`/v3/customers?id:in=${ids.join(',')}`);
    }
  },
  deleteAddresses: async (ids: number[]): Promise<void> => {
    if (ids.length > 0) {
      await httpClient.delete(`/v3/customers/addresses?id:in=${ids.join(',')}`);
    }
  },
  deleteWishlists: async (ids: number[]): Promise<void> => {
    if (ids.length > 0) {
      await Promise.all(ids.map((id) => httpClient.delete(`/v3/wishlists/${id}`)));
    }
  },
};
