'use server';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';

import { addCartLineItem } from '~/client/mutations/add-cart-line-item';
import { createCart } from '~/client/mutations/create-cart';
import { getCart } from '~/client/queries/get-cart';
import { TAGS } from '~/client/tags';
import { ExistingResultType } from '~/client/util';

import { CartSelectedOptionsInput } from '../../../cart/_actions/update-quantity';
import { getProduct } from '../page-data';

export const addToCart = async (
  formData: FormData,
  product: ExistingResultType<typeof getProduct>,
) => {
  const quantity = Number(formData.get('quantity'));

  const cartId = cookies().get('cartId')?.value;

  let cart;

  const selectedOptions = removeEdgesAndNodes(
    product.productOptions,
  ).reduce<CartSelectedOptionsInput>((accum, option) => {
    const optionValueEntityId = formData.get(`attribute_${option.entityId}`);

    let multipleChoicesOptionInput;
    let checkboxOptionInput;
    let numberFieldOptionInput;
    let textFieldOptionInput;
    let multiLineTextFieldOptionInput;
    let dateFieldOptionInput;

    // Skip empty strings since option is empty
    if (optionValueEntityId === '') return accum;

    switch (option.__typename) {
      case 'MultipleChoiceOption':
        multipleChoicesOptionInput = {
          optionEntityId: option.entityId,
          optionValueEntityId: Number(optionValueEntityId),
        };

        if (accum.multipleChoices) {
          return {
            ...accum,
            multipleChoices: [...accum.multipleChoices, multipleChoicesOptionInput],
          };
        }

        return { ...accum, multipleChoices: [multipleChoicesOptionInput] };

      case 'CheckboxOption':
        checkboxOptionInput = {
          optionEntityId: option.entityId,
          optionValueEntityId:
            Number(optionValueEntityId) !== 0
              ? option.checkedOptionValueEntityId
              : option.uncheckedOptionValueEntityId,
        };

        if (accum.checkboxes) {
          return { ...accum, checkboxes: [...accum.checkboxes, checkboxOptionInput] };
        }

        return { ...accum, checkboxes: [checkboxOptionInput] };

      case 'NumberFieldOption':
        numberFieldOptionInput = {
          optionEntityId: option.entityId,
          number: Number(optionValueEntityId),
        };

        if (accum.numberFields) {
          return { ...accum, numberFields: [...accum.numberFields, numberFieldOptionInput] };
        }

        return { ...accum, numberFields: [numberFieldOptionInput] };

      case 'TextFieldOption':
        textFieldOptionInput = {
          optionEntityId: option.entityId,
          text: String(optionValueEntityId),
        };

        if (accum.textFields) {
          return {
            ...accum,
            textFields: [...accum.textFields, textFieldOptionInput],
          };
        }

        return { ...accum, textFields: [textFieldOptionInput] };

      case 'MultiLineTextFieldOption':
        multiLineTextFieldOptionInput = {
          optionEntityId: option.entityId,
          text: String(optionValueEntityId),
        };

        if (accum.multiLineTextFields) {
          return {
            ...accum,
            multiLineTextFields: [...accum.multiLineTextFields, multiLineTextFieldOptionInput],
          };
        }

        return { ...accum, multiLineTextFields: [multiLineTextFieldOptionInput] };

      case 'DateFieldOption':
        dateFieldOptionInput = {
          optionEntityId: option.entityId,
          date: new Date(String(optionValueEntityId)).toISOString(),
        };

        if (accum.dateFields) {
          return {
            ...accum,
            dateFields: [...accum.dateFields, dateFieldOptionInput],
          };
        }

        return { ...accum, dateFields: [dateFieldOptionInput] };
    }

    return accum;
  }, {});

  try {
    cart = await getCart(cartId);

    if (cart) {
      cart = await addCartLineItem(cart.entityId, {
        lineItems: [
          {
            productEntityId: product.entityId,
            selectedOptions,
            quantity,
          },
        ],
      });

      if (!cart?.entityId) {
        return { status: 'error', error: 'Failed to add product to cart.' };
      }

      revalidateTag(TAGS.cart);

      return { status: 'success', data: cart };
    }

    // Create cart
    cart = await createCart([
      {
        productEntityId: product.entityId,
        selectedOptions,
        quantity,
      },
    ]);

    if (!cart?.entityId) {
      return { status: 'error', error: 'Failed to add product to cart.' };
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

    return { status: 'success', data: cart };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { status: 'error', error: error.message };
    }

    return { status: 'error', error: 'Something went wrong. Please try again.' };
  }
};
