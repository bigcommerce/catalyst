'use server';

import { z } from 'zod';

import { addCheckoutShippingInfo } from '~/client/mutations/add-checkout-shipping-info';
import { updateCheckoutShippingInfo } from '~/client/mutations/update-checkout-shipping-info';

const ShippingInfoSchema = z.object({
  country: z.string(),
  state: z.string().optional(),
  city: z.string().optional(),
  zipcode: z.string().optional(),
});

export const submitShippingInfo = async (
  formData: FormData,
  cartData: {
    cartId: string;
    shippingId: string | null;
    cartItems: Array<{ quantity: number; lineItemEntityId: string }>;
  },
) => {
  try {
    const parsedData = ShippingInfoSchema.parse({
      country: formData.get('country'),
      state: formData.get('state'),
      city: formData.get('city'),
      zipcode: formData.get('zip'),
    });
    const { cartId, cartItems, shippingId } = cartData;

    let result;

    if (shippingId) {
      result = await updateCheckoutShippingInfo({
        cartId,
        shippingId,
        cartItems,
        countryCode: parsedData.country.split('-')[0] ?? '',
        stateOrProvince: parsedData.state,
        city: parsedData.city,
        postalCode: parsedData.zipcode,
      });
    } else {
      result = await addCheckoutShippingInfo({
        cartId,
        cartItems,
        countryCode: parsedData.country.split('-')[0] ?? '',
        stateOrProvince: parsedData.state,
        city: parsedData.city,
        postalCode: parsedData.zipcode,
      });
    }

    return { status: 'success', data: result };
  } catch (e: unknown) {
    if (e instanceof Error || e instanceof z.ZodError) {
      return { status: 'failed', error: e.message };
    }

    return { status: 'failed' };
  }
};
