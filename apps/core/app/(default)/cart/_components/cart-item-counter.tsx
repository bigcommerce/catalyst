'use client';

import { Counter } from '@bigcommerce/components/counter';
import { useState } from 'react';

import {
  CartLineItemInput,
  CartPhysicalItem,
  CartSelectedOptionsInput,
  UpdateCartLineItemInput,
} from '~/client/generated/graphql';
import { getCart } from '~/client/queries/get-cart';

import { updateProductQuantity } from '../_actions/update-product-quantity';

type Cart = NonNullable<Awaited<ReturnType<typeof getCart>>>;

type CartItemData = Pick<
  Cart['lineItems']['physicalItems'][number],
  'quantity' | 'productEntityId' | 'variantEntityId' | 'selectedOptions'
> & {
  lineItemEntityId: CartPhysicalItem['entityId'];
};

interface UpdateProductQuantityData extends CartLineItemInput {
  lineItemEntityId: UpdateCartLineItemInput['lineItemEntityId'];
}

const parseSelectedOptions = (selectedOptions: CartItemData['selectedOptions']) => {
  return selectedOptions.reduce<CartSelectedOptionsInput>((accum, option) => {
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

        return { ...accum, multipleChoices: [multipleChoicesOptionInput] };

      case 'CartSelectedCheckboxOption':
        checkboxOptionInput = {
          optionEntityId: option.entityId,
          optionValueEntityId: option.valueEntityId,
        };

        if (accum.checkboxes) {
          return { ...accum, checkboxes: [...accum.checkboxes, checkboxOptionInput] };
        }

        return { ...accum, checkboxes: [checkboxOptionInput] };

      case 'CartSelectedNumberFieldOption':
        numberFieldOptionInput = {
          optionEntityId: option.entityId,
          number: option.number,
        };

        if (accum.numberFields) {
          return { ...accum, numberFields: [...accum.numberFields, numberFieldOptionInput] };
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
            multiLineTextFields: [...accum.multiLineTextFields, multiLineTextFieldOptionInput],
          };
        }

        return { ...accum, multiLineTextFields: [multiLineTextFieldOptionInput] };

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
  }, {});
};

export const CartItemCounter = ({ itemData }: { itemData: CartItemData }) => {
  const { quantity, lineItemEntityId, productEntityId, variantEntityId, selectedOptions } =
    itemData;

  const [counterValue, setCounterValue] = useState<'' | number>(quantity);
  const handleCountUpdate = async (value: string | number) => {
    if (value === '') {
      setCounterValue(value);

      return;
    }

    setCounterValue(Number(value));

    const productData: UpdateProductQuantityData = Object.assign(
      {
        lineItemEntityId,
        productEntityId,
        quantity: Number(value),
        selectedOptions: parseSelectedOptions(selectedOptions),
      },
      variantEntityId && { variantEntityId },
    );

    await updateProductQuantity(productData);
  };

  return (
    <Counter
      className="w-32 text-base font-bold"
      min={1}
      onChange={handleCountUpdate}
      value={counterValue}
    />
  );
};
