'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
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

    const shippingCosts = {
      shippingCostTotal: shippingCost?.shippingCostTotal?.value ?? 0,
      handlingCostTotal: shippingCost?.handlingCostTotal?.value ?? 0,
    };

    cookies().set({
      name: 'shippingCosts',
      value: JSON.stringify(shippingCosts),
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
    });

    revalidateTag('cart');

    return { status: 'success', data: shippingCost };
  } catch (e: unknown) {
    if (e instanceof Error || e instanceof z.ZodError) {
      return { status: 'failed', error: e.message };
    }

    return { status: 'failed' };
  }
};
