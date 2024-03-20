'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';

import { graphql } from '~/client/graphql';
import { addCartLineItem } from '~/client/mutations/add-cart-line-item';
import { createCart } from '~/client/mutations/create-cart';
import { getCart } from '~/client/queries/get-cart';
import { getProduct } from '~/client/queries/get-product';

import { ProductFormData } from '../use-product-form';

type CartSelectedOptionsInput = ReturnType<typeof graphql.scalar<'CartSelectedOptionsInput'>>;

export async function handleAddToCart(data: ProductFormData) {
  const productEntityId = Number(data.product_id);
  const quantity = Number(data.quantity);

  const product = await getProduct(productEntityId);

  const cartId = cookies().get('cartId')?.value;
  const cart = await getCart(cartId);

  const selectedOptions =
    product?.productOptions?.reduce<CartSelectedOptionsInput>((accum, option) => {
      const optionValueEntityId = data[`attribute_${option.entityId}`];

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
    }, {}) ?? {};

  try {
    if (cart) {
      await addCartLineItem(cart.entityId, {
        lineItems: [
          {
            productEntityId,
            selectedOptions,
            quantity,
          },
        ],
      });

      revalidateTag('cart');

      return;
    }

    // Create cart
    const newCart = await createCart([
      {
        productEntityId,
        selectedOptions,
        quantity,
      },
    ]);

    if (newCart) {
      cookies().set({
        name: 'cartId',
        value: newCart.entityId,
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        path: '/',
      });
    }

    revalidateTag('cart');
  } catch (e) {
    return { error: 'Something went wrong. Please try again.' };
  }
}
