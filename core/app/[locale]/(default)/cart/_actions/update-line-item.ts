'use server';

import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { cookies } from 'next/headers';

import { schema } from '@/vibes/soul/sections/cart/schema';
import { CartLineItem } from '@/vibes/soul/sections/cart/types';

import { getCart } from '../page-data';

import { removeItem } from './remove-item';
import { CartSelectedOptionsInput, updateQuantity } from './update-quantity';

export const updateLineItem = async (
  prevState: Awaited<{
    lineItems: CartLineItem[];
    lastResult: SubmissionResult | null;
  }>,
  formData: FormData,
): Promise<{
  lineItems: CartLineItem[];
  lastResult: SubmissionResult | null;
}> => {
  const intent = formData.get('intent');

  const submission = parseWithZod(formData, { schema });

  const cartId = cookies().get('cartId')?.value;

  if (submission.status !== 'success') {
    return {
      ...prevState,
      lastResult: submission.reply({ formErrors: ['Boom!'] }),
    };
  }

  switch (intent) {
    case 'increment': {
      // const item = await incrementLineItem(submission.value)\
      const data = await getCart(cartId);

      const cart = data.site.cart;

      const cartLineItem = [...cart.lineItems.physicalItems, ...cart.lineItems.digitalItems].find(
        (item) => item.entityId === submission.value.id,
      );

      const parsedSelectedOptions = cartLineItem?.selectedOptions.reduce<CartSelectedOptionsInput>(
        (accum, option) => {
          let multipleChoicesOptionInput;
          let checkboxOptionInput;
          let numberFieldOptionInput;
          let textFieldOptionInput;
          let multiLineTextFieldOptionInput;
          let dateFieldOptionInput;

          switch (option.__typename) {
            case 'CartSelectedMultipleChoiceOption':
              multipleChoicesOptionInput = {
                optionEntityId: option.entityId,
                optionValueEntityId: option.valueEntityId,
              };

              if (accum.multipleChoices) {
                return {
                  ...accum,
                  multipleChoices: [...accum.multipleChoices, multipleChoicesOptionInput],
                };
              }

              return {
                ...accum,
                multipleChoices: [multipleChoicesOptionInput],
              };

            case 'CartSelectedCheckboxOption':
              checkboxOptionInput = {
                optionEntityId: option.entityId,
                optionValueEntityId: option.valueEntityId,
              };

              if (accum.checkboxes) {
                return {
                  ...accum,
                  checkboxes: [...accum.checkboxes, checkboxOptionInput],
                };
              }

              return { ...accum, checkboxes: [checkboxOptionInput] };

            case 'CartSelectedNumberFieldOption':
              numberFieldOptionInput = {
                optionEntityId: option.entityId,
                number: option.number,
              };

              if (accum.numberFields) {
                return {
                  ...accum,
                  numberFields: [...accum.numberFields, numberFieldOptionInput],
                };
              }

              return { ...accum, numberFields: [numberFieldOptionInput] };

            case 'CartSelectedTextFieldOption':
              textFieldOptionInput = {
                optionEntityId: option.entityId,
                text: option.text,
              };

              if (accum.textFields) {
                return {
                  ...accum,
                  textFields: [...accum.textFields, textFieldOptionInput],
                };
              }

              return { ...accum, textFields: [textFieldOptionInput] };

            case 'CartSelectedMultiLineTextFieldOption':
              multiLineTextFieldOptionInput = {
                optionEntityId: option.entityId,
                text: option.text,
              };

              if (accum.multiLineTextFields) {
                return {
                  ...accum,
                  multiLineTextFields: [
                    ...accum.multiLineTextFields,
                    multiLineTextFieldOptionInput,
                  ],
                };
              }

              return {
                ...accum,
                multiLineTextFields: [multiLineTextFieldOptionInput],
              };

            case 'CartSelectedDateFieldOption':
              dateFieldOptionInput = {
                optionEntityId: option.entityId,
                date: new Date(String(option.date.utc)).toISOString(),
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
        },
        {},
      );

      await updateQuantity({
        lineItemEntityId: cartLineItem.entityId,
        productEntityId: cartLineItem.productEntityId,
        variantEntityId: cartLineItem.variantEntityId,
        selectedOptions: parsedSelectedOptions,
        quantity: submission.value.quantity + 1,
      });

      const item = submission.value;

      return {
        lineItems: prevState.lineItems.map((lineItem) =>
          lineItem.id === item.id ? { ...lineItem, quantity: lineItem.quantity + 1 } : lineItem,
        ),
        lastResult: submission.reply({ resetForm: true }),
      };
    }

    case 'decrement': {
      // const item = await decrementLineItem(submission.value)
      const data = await getCart(cartId);

      const cart = data.site.cart;

      const cartLineItem = [...cart.lineItems.physicalItems, ...cart.lineItems.digitalItems].find(
        (item) => item.entityId === submission.value.id,
      );

      const parsedSelectedOptions = cartLineItem?.selectedOptions.reduce<CartSelectedOptionsInput>(
        (accum, option) => {
          let multipleChoicesOptionInput;
          let checkboxOptionInput;
          let numberFieldOptionInput;
          let textFieldOptionInput;
          let multiLineTextFieldOptionInput;
          let dateFieldOptionInput;

          switch (option.__typename) {
            case 'CartSelectedMultipleChoiceOption':
              multipleChoicesOptionInput = {
                optionEntityId: option.entityId,
                optionValueEntityId: option.valueEntityId,
              };

              if (accum.multipleChoices) {
                return {
                  ...accum,
                  multipleChoices: [...accum.multipleChoices, multipleChoicesOptionInput],
                };
              }

              return {
                ...accum,
                multipleChoices: [multipleChoicesOptionInput],
              };

            case 'CartSelectedCheckboxOption':
              checkboxOptionInput = {
                optionEntityId: option.entityId,
                optionValueEntityId: option.valueEntityId,
              };

              if (accum.checkboxes) {
                return {
                  ...accum,
                  checkboxes: [...accum.checkboxes, checkboxOptionInput],
                };
              }

              return { ...accum, checkboxes: [checkboxOptionInput] };

            case 'CartSelectedNumberFieldOption':
              numberFieldOptionInput = {
                optionEntityId: option.entityId,
                number: option.number,
              };

              if (accum.numberFields) {
                return {
                  ...accum,
                  numberFields: [...accum.numberFields, numberFieldOptionInput],
                };
              }

              return { ...accum, numberFields: [numberFieldOptionInput] };

            case 'CartSelectedTextFieldOption':
              textFieldOptionInput = {
                optionEntityId: option.entityId,
                text: option.text,
              };

              if (accum.textFields) {
                return {
                  ...accum,
                  textFields: [...accum.textFields, textFieldOptionInput],
                };
              }

              return { ...accum, textFields: [textFieldOptionInput] };

            case 'CartSelectedMultiLineTextFieldOption':
              multiLineTextFieldOptionInput = {
                optionEntityId: option.entityId,
                text: option.text,
              };

              if (accum.multiLineTextFields) {
                return {
                  ...accum,
                  multiLineTextFields: [
                    ...accum.multiLineTextFields,
                    multiLineTextFieldOptionInput,
                  ],
                };
              }

              return {
                ...accum,
                multiLineTextFields: [multiLineTextFieldOptionInput],
              };

            case 'CartSelectedDateFieldOption':
              dateFieldOptionInput = {
                optionEntityId: option.entityId,
                date: new Date(String(option.date.utc)).toISOString(),
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
        },
        {},
      );

      await updateQuantity({
        lineItemEntityId: cartLineItem.entityId,
        productEntityId: cartLineItem.productEntityId,
        variantEntityId: cartLineItem.variantEntityId,
        selectedOptions: parsedSelectedOptions,
        quantity: submission.value.quantity - 1,
      });

      const item = submission.value;

      return {
        lineItems: prevState.lineItems.map((lineItem) =>
          lineItem.id === item.id ? { ...lineItem, quantity: lineItem.quantity - 1 } : lineItem,
        ),
        lastResult: submission.reply({ resetForm: true }),
      };
    }

    case 'delete': {
      // const deletedItem = await deleteLineItem(submission.value)
      await removeItem({ lineItemEntityId: submission.value.id });

      const deletedItem = submission.value;

      // TODO: add bodl
      // bodl.cart.productRemoved({
      //   currency,
      //   product_value: product.listPrice.value * product.quantity,
      //   line_items: [lineItemTransform(product)],
      // });

      return {
        lineItems: prevState.lineItems.filter((item) => item.id !== deletedItem.id),
        lastResult: submission.reply({ resetForm: true }),
      };
    }

    default: {
      return prevState;
    }
  }
};
