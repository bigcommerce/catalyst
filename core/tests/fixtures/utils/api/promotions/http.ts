import { faker } from '@faker-js/faker';
import { z } from 'zod';

import { testEnv } from '~/tests/environment';

import { httpClient } from '../client';
import { apiResponseSchema } from '../schema';

import { Coupon, PromotionsApi } from '.';

const CouponSchema = z
  .object({
    id: z.number(),
    code: z.string(),
  })
  .transform(
    (data): Coupon => ({
      id: data.id,
      code: data.code,
    }),
  );

export const promotionsHttpClient: PromotionsApi = {
  createCouponCode: async () => {
    const promotion = await httpClient
      .post('/v3/promotions', {
        name: `Catalyst Test Promotion ${faker.string.alpha(10)}`,
        channels: [{ id: testEnv.BIGCOMMERCE_CHANNEL_ID ?? 1 }],
        rules: [
          {
            action: {
              cart_value: {
                discount: {
                  percentage_amount: 10,
                },
              },
            },
          },
        ],
        redemption_type: 'COUPON',
        status: 'ENABLED',
      })
      .parse(apiResponseSchema(z.object({ id: z.number() }).passthrough()));

    const coupon = await httpClient
      .post(`/v3/promotions/${promotion.data.id}/codes`, {
        code: `CATALYST-TEST-${faker.string.alpha(10).toUpperCase()}`,
        max_uses: 1,
      })
      .parse(apiResponseSchema(CouponSchema));

    return {
      promotionId: promotion.data.id,
      coupon: coupon.data,
    };
  },
  deleteCouponCode: async (promotionId: number, couponId: number) => {
    await httpClient.delete(`/v3/promotions/${promotionId}/codes/${couponId}`);
    await httpClient.delete(`/v3/promotions/${promotionId}`);
  },
};
