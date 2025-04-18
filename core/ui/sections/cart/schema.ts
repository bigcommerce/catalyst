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

export const shippingActionFormDataSchema = z.discriminatedUnion('intent', [
  z.object({
    intent: z.literal('add-address'),
    country: z.string(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
  }),
  z.object({
    intent: z.literal('add-shipping'),
    shippingOption: z.string(),
  }),
]);
