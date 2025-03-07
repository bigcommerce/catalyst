'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { unstable_expireTag } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { ReactNode } from 'react';

import { compareAddToCartFormDataSchema } from '@/vibes/soul/primitives/compare-card/schema';
import { addCartLineItem } from '~/client/mutations/add-cart-line-item';
import { createCart } from '~/client/mutations/create-cart';
import { getCart } from '~/client/queries/get-cart';
import { TAGS } from '~/client/tags';
import { Link } from '~/components/link';
import { getCartId, setCartId } from '~/lib/cart';

interface State {
  lastResult: SubmissionResult | null;
  successMessage?: ReactNode;
}

export const addToCart = async (
  prevState: State,
  payload: FormData,
): Promise<{
  lastResult: SubmissionResult | null;
  successMessage?: ReactNode;
}> => {
  const t = await getTranslations('Compare');

  const submission = parseWithZod(payload, { schema: compareAddToCartFormDataSchema });

  if (submission.status !== 'success') {
    return { lastResult: submission.reply() };
  }

  const productEntityId = Number(submission.value.id);
  const quantity = 1;

  const cartId = await getCartId();

  let cart;

  try {
    cart = await getCart(cartId);

    if (cart) {
      const addCartLineItemResponse = await addCartLineItem(cart.entityId, {
        lineItems: [
          {
            productEntityId,
            quantity,
          },
        ],
      });

      cart = addCartLineItemResponse.data.cart.addCartLineItems?.cart;

      if (!cart?.entityId) {
        return {
          lastResult: submission.reply({ formErrors: [t('missingCart')] }),
        };
      }

      unstable_expireTag(TAGS.cart);

      return {
        lastResult: submission.reply(),
        successMessage: t.rich('successMessage', {
          cartItems: quantity,
          cartLink: (chunks) => (
            <Link className="underline" href="/cart" prefetch="viewport" prefetchKind="full">
              {chunks}
            </Link>
          ),
        }),
      };
    }

    // Create cart
    const createCartResponse = await createCart([
      {
        productEntityId,
        quantity,
      },
    ]);

    cart = createCartResponse.data.cart.createCart?.cart;

    if (!cart?.entityId) {
      return {
        lastResult: submission.reply({ formErrors: [t('missingCart')] }),
      };
    }

    await setCartId(cart.entityId);

    unstable_expireTag(TAGS.cart);

    return {
      lastResult: submission.reply(),
      successMessage: t.rich('successMessage', {
        cartItems: quantity,
        cartLink: (chunks) => (
          <Link className="underline" href="/cart" prefetch="viewport" prefetchKind="full">
            {chunks}
          </Link>
        ),
      }),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceGQLError) {
      return {
        lastResult: submission.reply({
          formErrors: error.errors.map(({ message }) => {
            if (message.includes('Not enough stock:')) {
              // This removes the item id from the message. It's very brittle, but it's the only
              // solution to do it until our API returns a better error message.
              return message.replace('Not enough stock: ', '').replace(/\(\w.+\)\s{1}/, '');
            }

            return message;
          }),
        }),
      };
    }

    if (error instanceof Error) {
      return {
        lastResult: submission.reply({ formErrors: [error.message] }),
      };
    }

    return {
      lastResult: submission.reply({ formErrors: [t('unknownError')] }),
    };
  }
};
