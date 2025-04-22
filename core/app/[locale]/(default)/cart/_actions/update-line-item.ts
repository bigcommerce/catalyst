'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { FragmentOf } from 'gql.tada';
import { getTranslations } from 'next-intl/server';

import { cartLineItemActionFormDataSchema } from '@/vibes/soul/sections/cart/schema';
import { type CartLineItem } from '~/ui/cart';

import { DigitalItemFragment, PhysicalItemFragment } from '../page-data';

import { removeItem } from './remove-item';
import { CartSelectedOptionsInput, updateQuantity } from './update-quantity';

type LineItem = {
  selectedOptions:
    | FragmentOf<typeof PhysicalItemFragment>['selectedOptions']
    | FragmentOf<typeof DigitalItemFragment>['selectedOptions'];
  productEntityId: number;
  variantEntityId: number | null;
} & CartLineItem;

export const updateLineItem = async (
  prevState: Awaited<{
    lineItems: LineItem[];
    lastResult: SubmissionResult | null;
  }>,
  formData: FormData,
): Promise<{
  lineItems: LineItem[];
  lastResult: SubmissionResult | null;
}> => {
  const t = await getTranslations('Cart.Errors');

  const submission = parseWithZod(formData, { schema: cartLineItemActionFormDataSchema });

  if (submission.status !== 'success') {
    return {
      ...prevState,
      lastResult: submission.reply(),
    };
  }

  const cartLineItem = prevState.lineItems.find((item) => item.id === submission.value.id);

  if (!cartLineItem) {
    return {
      ...prevState,
      lastResult: submission.reply({ formErrors: [t('lineItemNotFound')] }),
    };
  }

  switch (submission.value.intent) {
    case 'increment': {
      const parsedSelectedOptions = cartLineItem.selectedOptions.reduce<CartSelectedOptionsInput>(
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

      try {
        await updateQuantity({
          lineItemEntityId: cartLineItem.id,
          productEntityId: cartLineItem.productEntityId,
          variantEntityId: cartLineItem.variantEntityId,
          selectedOptions: parsedSelectedOptions,
          quantity: cartLineItem.quantity + 1,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);

        if (error instanceof BigCommerceGQLError) {
          return {
            ...prevState,
            lastResult: submission.reply({
              formErrors: error.errors.map(({ message }) => message),
            }),
          };
        }

        if (error instanceof Error) {
          return { ...prevState, lastResult: submission.reply({ formErrors: [error.message] }) };
        }

        return { ...prevState, lastResult: submission.reply({ formErrors: [String(error)] }) };
      }

      const item = submission.value;

      return {
        lineItems: prevState.lineItems.map((lineItem) =>
          lineItem.id === item.id ? { ...lineItem, quantity: lineItem.quantity + 1 } : lineItem,
        ),
        lastResult: submission.reply({ resetForm: true }),
      };
    }

    case 'decrement': {
      const parsedSelectedOptions = cartLineItem.selectedOptions.reduce<CartSelectedOptionsInput>(
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

      try {
        await updateQuantity({
          lineItemEntityId: cartLineItem.id,
          productEntityId: cartLineItem.productEntityId,
          variantEntityId: cartLineItem.variantEntityId,
          selectedOptions: parsedSelectedOptions,
          quantity: cartLineItem.quantity - 1,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);

        if (error instanceof BigCommerceGQLError) {
          return {
            ...prevState,
            lastResult: submission.reply({
              formErrors: error.errors.map(({ message }) => message),
            }),
          };
        }

        if (error instanceof Error) {
          return { ...prevState, lastResult: submission.reply({ formErrors: [error.message] }) };
        }

        return { ...prevState, lastResult: submission.reply({ formErrors: [String(error)] }) };
      }

      const item = submission.value;

      return {
        lineItems: prevState.lineItems.map((lineItem) =>
          lineItem.id === item.id ? { ...lineItem, quantity: lineItem.quantity - 1 } : lineItem,
        ),
        lastResult: submission.reply({ resetForm: true }),
      };
    }

    case 'delete': {
      try {
        await removeItem({ lineItemEntityId: submission.value.id });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);

        if (error instanceof BigCommerceGQLError) {
          return {
            ...prevState,
            lastResult: submission.reply({
              formErrors: error.errors.map(({ message }) => message),
            }),
          };
        }

        if (error instanceof Error) {
          return { ...prevState, lastResult: submission.reply({ formErrors: [error.message] }) };
        }

        return { ...prevState, lastResult: submission.reply({ formErrors: [String(error)] }) };
      }

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
