import { z } from 'zod';

export const cartLineItemActionFormDataSchema = z.discriminatedUnion('intent', [
  z.object({
    intent: z.literal('update'),
    id: z.string(),
    // Quantity is absolute so rapid clicks can coalesce into a single request;
    // 0 is never sent because removal is a separate 'delete' intent.
    quantity: z.coerce.number().int().min(1),
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

export const giftCertificateCodeActionFormDataSchema = ({
  required_error = 'Please enter a valid gift certificate code',
}: {
  required_error?: string;
}) =>
  z.discriminatedUnion('intent', [
    z.object({
      intent: z.literal('apply'),
      giftCertificateCode: z.string({ required_error }),
    }),
    z.object({
      intent: z.literal('delete'),
      giftCertificateCode: z.string(),
    }),
  ]);

export const shippingActionFormDataSchema = ({
  required_error = 'Country is required',
}: {
  required_error?: string;
}) =>
  z.discriminatedUnion('intent', [
    z.object({
      intent: z.literal('add-address'),
      country: z.string({ required_error }),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
    }),
    z.object({
      intent: z.literal('add-shipping'),
      shippingOption: z.string(),
    }),
  ]);
