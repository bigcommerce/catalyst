'use server';

import { CartSelectedOptionsInput } from '@bigcommerce/catalyst-client';
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';

import client from '~/client';

export async function handleAddToCart(data: FormData) {
  const productEntityId = Number(data.get('product_id'));
  const quantity = Number(data.get('quantity'));

  const product = await client.getProduct({ productId: productEntityId });

  const cartId = cookies().get('cartId')?.value;

  const selectedOptions =
    product?.productOptions?.reduce<CartSelectedOptionsInput>((accum, option) => {
      const optionValueEntityId = Number(data.get(`attribute[${option.entityId}]`));
      let multipleChoicesOptionInput;
      let checkboxOptionInput;
      let numberFieldOptionInput;

      switch (option.__typename) {
        case 'MultipleChoiceOption':
          multipleChoicesOptionInput = {
            optionEntityId: option.entityId,
            optionValueEntityId,
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
              optionValueEntityId !== 0
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
            number: optionValueEntityId,
          };

          if (accum.numberFields) {
            return { ...accum, numberFields: [...accum.numberFields, numberFieldOptionInput] };
          }

          return { ...accum, numberFields: [numberFieldOptionInput] };
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
