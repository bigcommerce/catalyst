export interface OrderAddress {
  readonly firstName: string;
  readonly lastName: string;
  readonly street1: string;
  readonly zip: string;
  readonly country: string;
  readonly countryIso2: string;
  readonly city?: string;
  readonly email?: string;
  readonly company?: string;
  readonly street2?: string;
  readonly state?: string;
  readonly phone?: string;
}

export interface Order {
  readonly id: number;
  readonly customerId: number;
  readonly dateCreated: string;
  readonly statusId: number;
  readonly status: string;
  readonly subtotalExTax: string;
  readonly subtotalTax: string;
  readonly totalIncTax: string;
  readonly itemsTotal: number;
  readonly discountAmount: string;
  readonly couponDiscount: string;
  readonly billingAddress: OrderAddress;
  readonly currencyCode: string;
  readonly currencyId: number;
  readonly defaultCurrencyCode: string;
  readonly defaultCurrencyId: number;
}

export interface OrdersApi {
  get: (customerId?: number) => Promise<Order[]>;
  create: (productId: number, customerId?: number) => Promise<Order>;
  delete: (ids: number[]) => Promise<void>;
}

export { ordersHttpClient } from './http';
