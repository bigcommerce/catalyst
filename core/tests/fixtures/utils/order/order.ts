import { type Page } from '@playwright/test';

export class Order {
  constructor(
    private readonly page: Page,
    readonly id: number,
    readonly statusId: number,
    readonly customerId: number,
    readonly billingAddress: Address,
    readonly shippingAddresses: Address[],
    readonly products: OrderProduct[],
  ) {}
}
export interface Address {
  first_name: string;
  last_name: string;
  company?: string;
  street_1: string;
  street_2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface OrderProduct {
  product_id: number;
  variant_id: number;
  quantity: number;
}
