'use server';

import { revalidateTag } from 'next/cache';
import { z } from 'zod';

import { selectCheckoutShippingOption } from '~/client/mutations/select-checkout-shipping-option';

const ShippingCostSchema = z.object({
  shippingOption: z.string(),
});

export const submitShippingCosts = async (
  formData: FormData,
  checkoutEntityId: string,
  consignmentEntityId: string,
) => {
  try {
    const parsedData = ShippingCostSchema.parse({
      shippingOption: formData.get('shippingOption'),
    });

    const shippingCost = await selectCheckoutShippingOption({
      checkoutEntityId,
      consignmentEntityId,
      shippingOptionEntityId: parsedData.shippingOption,
    });

    if (!shippingCost?.entityId) {
      return { status: 'error', error: 'Failed to submit shipping cost.' };
    }

    revalidateTag('checkout');

    return { status: 'success', data: shippingCost };
  } catch (error: unknown) {
    if (error instanceof Error || error instanceof z.ZodError) {
      return { status: 'error', error: error.message };
    }

    return { status: 'error', error: 'Failed to submit shipping cost.' };
  }
};
