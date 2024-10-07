import { type Page } from '@playwright/test';

export class Order {
  constructor(
    private readonly page: Page,
    readonly id: number,
    readonly customerId: number,
    readonly date_created: string,
    readonly statusId: number,
    readonly status: string,
    readonly subtotal_ex_tax: string,
    readonly subtotal_tax: string,
    readonly total_inc_tax: string,
    readonly items_total: number,
    readonly discount_amount: string,
    readonly coupon_discount: string,
    readonly billingAddress: Address,
  ) {}
}
export interface Address {
  first_name: string;
  last_name: string;
  street_1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface OrderProduct {
  product_id: number;
  quantity: number;
}
