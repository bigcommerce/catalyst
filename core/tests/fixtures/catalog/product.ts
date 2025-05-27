import { z } from 'zod';

export class Product {
  static readonly schema = z.object({
    id: z.number(),
    name: z.string(),
    sku: z.string(),
    price: z.number(),
    retail_price: z.number(),
    sale_price: z.number(),
    custom_url: z.object({
      url: z.string(),
    }),
  });

  constructor(
    readonly id: number,
    readonly name: string,
    readonly sku: string,
    readonly price: number,
    readonly retail_price: number,
    readonly sale_price: number,
    readonly path: string,
  ) {}

  static fromApiResponse(data: z.infer<typeof Product.schema>): Product {
    return new Product(
      data.id,
      data.name,
      data.sku,
      data.price,
      data.retail_price,
      data.sale_price,
      data.custom_url.url,
    );
  }
}
