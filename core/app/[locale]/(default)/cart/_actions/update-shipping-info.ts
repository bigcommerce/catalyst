'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { parseWithZod } from '@conform-to/zod';
import { getTranslations } from 'next-intl/server';

import { shippingActionFormDataSchema } from '@/vibes/soul/sections/cart/schema';
import { ShippingFormState } from '@/vibes/soul/sections/cart/shipping-form';
import { getCartId } from '~/lib/cart';

import { getCart } from '../page-data';

import { addShippingCost } from './add-shipping-cost';
import { addShippingInfo } from './add-shipping-info';

export const updateShippingInfo = async (
  prevState: Awaited<ShippingFormState>,
  formData: FormData,
): Promise<ShippingFormState> => {
  const t = await getTranslations('Cart.CheckoutSummary.Shipping');

  const submission = parseWithZod(formData, {
    schema: shippingActionFormDataSchema,
  });

  const cartId = await getCartId();

  if (!cartId) {
    return { ...prevState, lastResult: submission.reply({ formErrors: [t('cartNotFound')] }) };
  }

  const cart = await getCart({ cartId });
  const checkout = cart.site.checkout;

  if (!checkout || !cart.site.cart) {
    return { ...prevState, lastResult: submission.reply({ formErrors: [t('cartNotFound')] }) };
  }

  const checkoutEntityId = checkout.entityId;

  if (!checkoutEntityId) {
    return { ...prevState, lastResult: submission.reply({ formErrors: [t('cartNotFound')] }) };
  }

  if (submission.status !== 'success') {
    return {
      ...prevState,
      lastResult: submission.reply(),
    };
  }

  const lineItems = [
    ...cart.site.cart.lineItems.physicalItems,
    ...cart.site.cart.lineItems.digitalItems,
  ].map((item) => ({
    lineItemEntityId: item.entityId,
    quantity: item.quantity,
  }));

  const shippingConsignment =
    checkout.shippingConsignments?.find((consignment) => consignment.selectedShippingOption) ||
    checkout.shippingConsignments?.[0];

  const shippingId = shippingConsignment?.entityId;

  switch (submission.value.intent) {
    case 'add-address': {
      let result;

      try {
        result = await addShippingInfo({
          checkoutEntityId,
          address: {
            countryCode: submission.value.country,
            city: submission.value.city,
            stateOrProvince: submission.value.state,
            postalCode: submission.value.postalCode,
          },
          lineItems,
          shippingId,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);

        if (error instanceof BigCommerceGQLError) {
          return {
            ...prevState,
            lastResult: submission.reply({
              formErrors: error.errors.map(({ message }) => message),
            }),
          };
        }

        if (error instanceof Error) {
          return { ...prevState, lastResult: submission.reply({ formErrors: [error.message] }) };
        }

        return { ...prevState, lastResult: submission.reply({ formErrors: [String(error)] }) };
      }

      const updatedShippingConsignment = result ? result.shippingConsignments?.[0] : undefined;

      if (!updatedShippingConsignment?.availableShippingOptions) {
        return { ...prevState, lastResult: submission.reply({ formErrors: [t('cartNotFound')] }) };
      }

      return {
        ...prevState,
        lastResult: submission.reply({ resetForm: true }),
      };
    }

    case 'add-shipping': {
      try {
        if (!shippingConsignment?.entityId) {
          return {
            ...prevState,
            lastResult: submission.reply({ formErrors: [t('cartNotFound')] }),
          };
        }

        await addShippingCost({
          checkoutEntityId,
          consignmentEntityId: shippingConsignment.entityId,
          shippingOptionEntityId: submission.value.shippingOption,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);

        if (error instanceof BigCommerceGQLError) {
          return {
            ...prevState,
            lastResult: submission.reply({
              formErrors: error.errors.map(({ message }) => message),
            }),
          };
        }

        if (error instanceof Error) {
          return { ...prevState, lastResult: submission.reply({ formErrors: [error.message] }) };
        }

        return { ...prevState, lastResult: submission.reply({ formErrors: [String(error)] }) };
      }

      return {
        ...prevState,
        lastResult: submission.reply({ resetForm: true }),
      };
    }

    default: {
      return prevState;
    }
  }
};
