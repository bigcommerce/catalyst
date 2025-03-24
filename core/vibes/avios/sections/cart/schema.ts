import { z } from 'zod';

export const cartLineItemActionFormDataSchema = z.discriminatedUnion('intent', [
  z.object({
    intent: z.literal('increment'),
    id: z.string(),
  }),
  z.object({
    intent: z.literal('decrement'),
    id: z.string(),
  }),
  z.object({
    intent: z.literal('delete'),
    id: z.string(),
  }),
]);

export const couponCodeActionFormDataSchema = ({
  required_error = 'Please enter a valid promo code',
}: {
  required_error?: string;
}) =>
  z.discriminatedUnion('intent', [
    z.object({
      intent: z.literal('apply'),
      couponCode: z.string({ required_error }),
    }),
    z.object({
      intent: z.literal('delete'),
      couponCode: z.string(),
    }),
  ]);
