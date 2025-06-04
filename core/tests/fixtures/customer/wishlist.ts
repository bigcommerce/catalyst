import { z } from 'zod';

export class Wishlist {
  static readonly schema = z.object({
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
  });

  static readonly createSchema = z.object({
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

  constructor(
    readonly id: number,
    readonly customerId: number,
    readonly name: string,
    readonly isPublic: boolean,
    readonly token: string,
    readonly items: Array<{ id: number; productId: number; variantId?: number }>,
  ) {}

  static fromApiResponse(data: z.infer<typeof Wishlist.schema>): Wishlist {
    return new Wishlist(
      data.id,
      data.customer_id,
      data.name,
      data.is_public,
      data.token,
      data.items.map((item) => ({
        id: item.id,
        productId: item.product_id,
        variantId: item.variant_id,
      })),
    );
  }
}
