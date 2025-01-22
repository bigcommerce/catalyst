'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { unstable_expireTag } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { ReactNode } from 'react';

import { Field, schema } from '@/vibes/soul/sections/product-detail/schema';
import { graphql } from '~/client/graphql';
import { addCartLineItem } from '~/client/mutations/add-cart-line-item';
import { createCart } from '~/client/mutations/create-cart';
import { getCart } from '~/client/queries/get-cart';
import { TAGS } from '~/client/tags';
import { Link } from '~/components/link';
import { getCartId, setCartId } from '~/lib/cart';

type CartSelectedOptionsInput = ReturnType<typeof graphql.scalar<'CartSelectedOptionsInput'>>;

interface State {
  fields: Field[];
  lastResult: SubmissionResult | null;
  successMessage?: ReactNode;
}

export const addToCart = async (
  prevState: State,
  payload: FormData,
): Promise<{
  fields: Field[];
  lastResult: SubmissionResult | null;
  successMessage?: ReactNode;
}> => {
  const t = await getTranslations('Product.ProductDetails');

  const submission = parseWithZod(payload, { schema: schema(prevState.fields) });

  if (submission.status !== 'success') {
    return { lastResult: submission.reply(), fields: prevState.fields };
  }

  const productEntityId = Number(submission.value.id);
  const quantity = Number(submission.value.quantity);

  const cartId = await getCartId();

  let cart;

  const selectedOptions = prevState.fields.reduce<CartSelectedOptionsInput>((accum, field) => {
    const optionValueEntityId = submission.value[field.name];

    let multipleChoicesOptionInput;
    let checkboxOptionInput;
    let numberFieldOptionInput;
    let textFieldOptionInput;
    let multiLineTextFieldOptionInput;
    let dateFieldOptionInput;

    // Skip empty strings since option is empty
    if (!optionValueEntityId) return accum;

    switch (field.type) {
      case 'select':
      case 'radio-group':
      case 'swatch-radio-group':
      case 'card-radio-group':
      case 'button-radio-group':
        multipleChoicesOptionInput = {
          optionEntityId: Number(field.name),
          optionValueEntityId: Number(optionValueEntityId),
        };

        if (accum.multipleChoices) {
          return {
            ...accum,
            multipleChoices: [...accum.multipleChoices, multipleChoicesOptionInput],
          };
        }

        return { ...accum, multipleChoices: [multipleChoicesOptionInput] };

      case 'checkbox':
        checkboxOptionInput = {
          optionEntityId: Number(field.name),
          optionValueEntityId:
            optionValueEntityId === 'true'
              ? // @ts-expect-error Types from custom fields are not yet available, pending fix
                Number(field.checkedValue)
              : // @ts-expect-error Types from custom fields are not yet available, pending fix
                Number(field.uncheckedValue),
        };

        if (accum.checkboxes) {
          return { ...accum, checkboxes: [...accum.checkboxes, checkboxOptionInput] };
        }

        return { ...accum, checkboxes: [checkboxOptionInput] };

      case 'number':
        numberFieldOptionInput = {
          optionEntityId: Number(field.name),
          number: Number(optionValueEntityId),
        };

        if (accum.numberFields) {
          return { ...accum, numberFields: [...accum.numberFields, numberFieldOptionInput] };
        }

        return { ...accum, numberFields: [numberFieldOptionInput] };

      case 'text':
        textFieldOptionInput = {
          optionEntityId: Number(field.name),
          text: String(optionValueEntityId),
        };

        if (accum.textFields) {
          return {
            ...accum,
            textFields: [...accum.textFields, textFieldOptionInput],
          };
        }

        return { ...accum, textFields: [textFieldOptionInput] };

      case 'textarea':
        multiLineTextFieldOptionInput = {
          optionEntityId: Number(field.name),
          text: String(optionValueEntityId),
        };

        if (accum.multiLineTextFields) {
          return {
            ...accum,
            multiLineTextFields: [...accum.multiLineTextFields, multiLineTextFieldOptionInput],
          };
        }

        return { ...accum, multiLineTextFields: [multiLineTextFieldOptionInput] };

      case 'date':
        dateFieldOptionInput = {
          optionEntityId: Number(field.name),
          date: new Date(String(optionValueEntityId)).toISOString(),
        };

        if (accum.dateFields) {
          return {
            ...accum,
            dateFields: [...accum.dateFields, dateFieldOptionInput],
          };
        }

        return { ...accum, dateFields: [dateFieldOptionInput] };

      default:
        return { ...accum };
    }
  }, {});

  try {
    cart = await getCart(cartId);

    if (cart) {
      const addCartLineItemResponse = await addCartLineItem(cart.entityId, {
        lineItems: [
          {
            productEntityId,
            selectedOptions,
            quantity,
          },
        ],
      });

      cart = addCartLineItemResponse.data.cart.addCartLineItems?.cart;

      if (!cart?.entityId) {
        return {
          lastResult: submission.reply({ formErrors: [t('missingCart')] }),
          fields: prevState.fields,
        };
      }

      unstable_expireTag(TAGS.cart);

      return {
        lastResult: submission.reply(),
        fields: prevState.fields,
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
        selectedOptions,
        quantity,
      },
    ]);

    cart = createCartResponse.data.cart.createCart?.cart;

    if (!cart?.entityId) {
      return {
        lastResult: submission.reply({ formErrors: [t('missingCart')] }),
        fields: prevState.fields,
      };
    }

    await setCartId(cart.entityId);

    unstable_expireTag(TAGS.cart);

    return {
      lastResult: submission.reply(),
      fields: prevState.fields,
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
        fields: prevState.fields,
      };
    }

    if (error instanceof Error) {
      return {
        lastResult: submission.reply({ formErrors: [error.message] }),
        fields: prevState.fields,
      };
    }

    return {
      lastResult: submission.reply({ formErrors: [t('unknownError')] }),
      fields: prevState.fields,
    };
  }
};
