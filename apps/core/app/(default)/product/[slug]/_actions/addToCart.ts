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
      let optionInput = {
        optionEntityId: option.entityId,
        optionValueEntityId,
      };

      switch (option.__typename) {
        case 'MultipleChoiceOption':
          if (accum.multipleChoices) {
            return { ...accum, multipleChoices: [...accum.multipleChoices, optionInput] };
          }

          return { ...accum, multipleChoices: [optionInput] };

        case 'CheckboxOption':
          optionInput = {
            optionEntityId: option.entityId,
            optionValueEntityId:
              optionValueEntityId !== 0
                ? option.checkedOptionValueEntityId
                : option.uncheckedOptionValueEntityId,
          };

          if (accum.checkboxes) {
            return { ...accum, checkboxes: [...accum.checkboxes, optionInput] };
          }

          return { ...accum, checkboxes: [optionInput] };
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
