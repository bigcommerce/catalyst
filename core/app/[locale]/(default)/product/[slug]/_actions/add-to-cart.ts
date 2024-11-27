'use server';

import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';

import { Field, schema } from '@/vibes/soul/sections/product-detail/schema';
import { graphql } from '~/client/graphql';
import { addCartLineItem } from '~/client/mutations/add-cart-line-item';
import { createCart } from '~/client/mutations/create-cart';
import { getCart } from '~/client/queries/get-cart';
import { TAGS } from '~/client/tags';

type CartSelectedOptionsInput = ReturnType<typeof graphql.scalar<'CartSelectedOptionsInput'>>;

interface State {
  fields: Field[];
  lastResult: SubmissionResult | null;
}

export const addToCart = async (
  prevState: State,
  payload: FormData,
): Promise<{
  fields: Field[];
  lastResult: SubmissionResult | null;
}> => {
  const submission = parseWithZod(payload, { schema: schema(prevState.fields) });

  if (submission.status !== 'success') {
    return { lastResult: submission.reply(), fields: prevState.fields };
  }

  const productEntityId = Number(submission.value.id);
  const quantity = Number(submission.value.quantity);

  const cartId = cookies().get('cartId')?.value;

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
              ? // @ts-expect-error Need to fix types
                Number(field.checkedValue)
              : // @ts-expect-error Need to fix types
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
      cart = await addCartLineItem(cart.entityId, {
        lineItems: [
          {
            productEntityId,
            selectedOptions,
            quantity,
          },
        ],
      });

      if (!cart?.entityId) {
        return {
          lastResult: submission.reply({ formErrors: ['Missing cartId'] }),
          fields: prevState.fields,
        };
      }

      revalidateTag(TAGS.cart);

      // TODO: add bodl
      // bodl.cart.productAdded({
      //   product_value: transformedProduct.purchase_price * quantity,
      //   currency: transformedProduct.currency,
      //   line_items: [
      //     {
      //       ...transformedProduct,
      //       quantity,
      //     },
      //   ],
      // });

      return {
        lastResult: submission.reply(),
        fields: prevState.fields,
      };
    }

    // Create cart
    cart = await createCart([
      {
        productEntityId,
        selectedOptions,
        quantity,
      },
    ]);

    if (!cart?.entityId) {
      return {
        lastResult: submission.reply({ formErrors: ['Missing cartId'] }),
        fields: prevState.fields,
      };
    }

    cookies().set({
      name: 'cartId',
      value: cart.entityId,
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
    });

    revalidateTag(TAGS.cart);

    // TODO: add bodl
    // bodl.cart.productAdded({
    //   product_value: transformedProduct.purchase_price * quantity,
    //   currency: transformedProduct.currency,
    //   line_items: [
    //     {
    //       ...transformedProduct,
    //       quantity,
    //     },
    //   ],
    // });

    return {
      lastResult: submission.reply(),
      fields: prevState.fields,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        lastResult: submission.reply({ formErrors: [error.message] }),
        fields: prevState.fields,
      };
    }

    return {
      lastResult: submission.reply({ formErrors: ['Something went wrong.'] }),
      fields: prevState.fields,
    };
  }
};
