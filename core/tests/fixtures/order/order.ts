import { z } from 'zod';

import { OrderAddress } from './address';

export class Order {
  static readonly schema = z.object({
    id: z.number(),
    customer_id: z.number(),
    customer_locale: z.string(),
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
    billing_address: OrderAddress.schema,
  });

  constructor(
    readonly id: number,
    readonly customerId: number,
    readonly dateCreated: string,
    readonly statusId: number,
    readonly status: string,
    readonly subtotalExTax: string,
    readonly subtotalTax: string,
    readonly totalIncTax: string,
    readonly itemsTotal: number,
    readonly discountAmount: string,
    readonly couponDiscount: string,
    readonly billingAddress: OrderAddress,
    readonly currencyCode: string,
    readonly currencyId: number,
    readonly defaultCurrencyCode: string,
    readonly defaultCurrencyId: number,
  ) {}

  static fromApiResponse(data: z.infer<typeof Order.schema>): Order {
    return new Order(
      data.id,
      data.customer_id,
      data.date_created,
      data.status_id,
      data.status,
      data.subtotal_ex_tax,
      data.subtotal_tax,
      data.total_inc_tax,
      data.items_total,
      data.discount_amount,
      data.coupon_discount,
      OrderAddress.fromApiResponse(data.billing_address),
      data.currency_code,
      data.currency_id,
      data.default_currency_code,
      data.default_currency_id,
    );
  }
}
