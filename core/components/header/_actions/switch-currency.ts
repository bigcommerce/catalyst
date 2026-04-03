'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import { getCartId, setCartId } from '~/lib/cart';
import { setPreferredCurrencyCode } from '~/lib/currency';

import { CurrencyCode } from '../fragment';
import { CurrencyCodeSchema } from '../schema';

const currencySwitchSchema = z.object({
  id: CurrencyCodeSchema,
});

// Note: this results in a new cart being created in the new currency, so the cart ID will change
const UpdateCartCurrencyMutation = graphql(`
  mutation UpdateCartCurrencyMutation($input: UpdateCartCurrencyInput!) {
    cart {
      updateCartCurrency(input: $input) {
        cart {
          currencyCode
          entityId
        }
      }
    }
  }
`);

const updateCartCurrency = async (cartId: string, currencyCode: CurrencyCode) => {
  const result = await client.fetch({
    document: UpdateCartCurrencyMutation,
    variables: { input: { data: { currencyCode }, cartEntityId: cartId } },
  });
  const newCartId = result.data.cart.updateCartCurrency?.cart?.entityId;

  if (newCartId) {
    await setCartId(newCartId);
  } else {
    throw new Error('Failed to update cart currency', { cause: result });
  }
};

export const switchCurrency = async (_prevState: SubmissionResult | null, payload: FormData) => {
  const t = await getTranslations('Components.Header.SwitchCurrency');

  const submission = parseWithZod(payload, { schema: currencySwitchSchema });

  if (submission.status !== 'success') {
    return submission.reply({ formErrors: [t('invalidCurrency')] });
  }

  await setPreferredCurrencyCode(submission.value.id);

  const cartId = await getCartId();

  if (cartId) {
    await updateCartCurrency(cartId, submission.value.id)
      .then(() => {
        revalidateTag(TAGS.cart);
      })
      .catch((error: unknown) => {
        // eslint-disable-next-line no-console
        console.error('Error updating cart currency', error);

        if (error instanceof BigCommerceGQLError) {
          return submission.reply({
            formErrors: error.errors.map(({ message }) => message),
          });
        }

        if (error instanceof Error) {
          return submission.reply({ formErrors: [error.message] });
        }

        return submission.reply({ formErrors: [t('errorUpdatingCurrency')] });
      });
  }

  revalidatePath('/');

  return submission.reply({ resetForm: true });
};
