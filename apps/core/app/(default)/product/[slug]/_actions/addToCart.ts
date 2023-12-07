'use server';

import { CartSelectedOptionsInput } from '@bigcommerce/catalyst-client';
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';

import client from '~/client';
import { getProduct } from '~/client/queries/getProduct';

export async function handleAddToCart(data: FormData) {
  const productEntityId = Number(data.get('product_id'));
  const quantity = Number(data.get('quantity'));

  const product = await getProduct(productEntityId);

  const cartId = cookies().get('cartId')?.value;

  const selectedOptions =
    product?.productOptions?.reduce<CartSelectedOptionsInput>((accum, option) => {
      const optionValueEntityId = data.get(`attribute[${option.entityId}]`);

      let multipleChoicesOptionInput;
      let checkboxOptionInput;
      let numberFieldOptionInput;
      let multiLineTextFieldOptionInput;
      let dateFieldOptionInput;

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

  if (cartId) {
    await client.addCartLineItem(cartId, {
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
  const cart = await client.createCart([
    {
      productEntityId,
      selectedOptions,
      quantity,
    },
  ]);

  if (cart) {
    cookies().set({
      name: 'cartId',
      value: cart.entityId,
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
    });
  }

  revalidateTag('cart');
}
