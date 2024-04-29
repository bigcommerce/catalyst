'use server';

import { revalidateTag } from 'next/cache';
import { z } from 'zod';

import { addCheckoutShippingConsignments } from '~/client/mutations/add-checkout-shipping-consignments';
import { updateCheckoutShippingConsignment } from '~/client/mutations/update-checkout-shipping-consigment';

const ShippingInfoSchema = z.object({
  country: z.string(),
  state: z.string().optional(),
  city: z.string().optional(),
  zipcode: z.string().optional(),
});

export const submitShippingInfo = async (
  formData: FormData,
  checkoutData: {
    checkoutId: string;
    shippingId: string | null;
    lineItems: Array<{ quantity: number; lineItemEntityId: string }>;
  },
) => {
  try {
    const parsedData = ShippingInfoSchema.parse({
      country: formData.get('country'),
      state: formData.get('state'),
      city: formData.get('city'),
      zipcode: formData.get('zip'),
    });
    const { checkoutId, lineItems, shippingId } = checkoutData;

    let result;

    if (shippingId) {
      result = await updateCheckoutShippingConsignment({
        checkoutId,
        shippingId,
        lineItems,
        countryCode: parsedData.country.split('-')[0] ?? '',
        stateOrProvince: parsedData.state,
        city: parsedData.city,
        postalCode: parsedData.zipcode,
      });
    } else {
      result = await addCheckoutShippingConsignments({
        checkoutId,
        lineItems,
        countryCode: parsedData.country.split('-')[0] ?? '',
        stateOrProvince: parsedData.state,
        city: parsedData.city,
        postalCode: parsedData.zipcode,
      });
    }

    revalidateTag('checkout');

    return { status: 'success', data: result };
  } catch (e: unknown) {
    if (e instanceof Error || e instanceof z.ZodError) {
      return { status: 'failed', error: e.message };
    }

    return { status: 'failed' };
  }
};
