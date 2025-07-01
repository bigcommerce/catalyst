export interface Address {
  readonly id: number;
  readonly address1: string;
  readonly city: string;
  readonly country: string;
  readonly countryCode: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly postalCode: string;
  readonly customerId?: number;
  readonly addressType?: string;
  readonly address2?: string;
  readonly company?: string;
  readonly phone?: string;
  readonly stateOrProvince?: string;
}

export interface CreateAddressData {
  address1: string;
  address2?: string;
  city: string;
  company?: string;
  countryCode: string;
  customerId?: number;
  firstName: string;
  lastName: string;
  phone?: string;
  postalCode: string;
  stateOrProvince?: string;
}

export interface Customer {
  readonly id: number;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly originChannelId: number;
  readonly channelIds: number[] | null;
  readonly addressCount?: number;
  readonly addresses?: Address[];
  readonly company?: string;
  readonly customerGroupId: number;
  readonly notes?: string;
  readonly phone?: string;
  password?: string;
}

export interface CreateCustomerData {
  addresses?: CreateAddressData[];
  company?: string;
  customerGroupId?: number;
  email: string;
  firstName: string;
  lastName: string;
  notes?: string;
  password?: string;
  phone?: string;
  channelIds?: number[];
  originChannelId: number;
}

export interface Wishlist {
  readonly id: number;
  readonly customerId: number;
  readonly name: string;
  readonly isPublic: boolean;
  readonly token: string;
  readonly items: Array<{ id: number; productId: number; variantId?: number }>;
}

export interface CreateWishlistData {
  customerId: number;
  name: string;
  isPublic: boolean;
  items: Array<{ productId: number; variantId?: number }>;
}

export interface CustomersApi {
  getById: (id: number, includeAddresses?: boolean) => Promise<Customer>;
  getByEmail: (email: string, includeAddresses?: boolean) => Promise<Customer>;
  getAddresses: (customerId: number) => Promise<Address[]>;
  getWishlists: (customerId: number) => Promise<Wishlist[]>;
  create: (data: CreateCustomerData) => Promise<Customer>;
  createAddress: (data: CreateAddressData) => Promise<Address>;
  createWishlist: (data: CreateWishlistData) => Promise<Wishlist>;
  delete: (ids: number[]) => Promise<void>;
  deleteAddresses: (ids: number[]) => Promise<void>;
  deleteWishlists: (ids: number[]) => Promise<void>;
}

export { customersHttpClient } from './http';
