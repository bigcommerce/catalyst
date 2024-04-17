'use client';

import { AlertCircle, Minus, Plus, Loader2 as Spinner } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ComponentPropsWithoutRef, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'react-hot-toast';

import { graphql } from '~/client/graphql';
import { getCart } from '~/client/queries/get-cart';

import { updateItemQuantity } from '../_actions/update-item-quantity';

import { Product } from './cart-item';

type CartSelectedOptionsInput = ReturnType<typeof graphql.scalar<'CartSelectedOptionsInput'>>;
type Cart = NonNullable<Awaited<ReturnType<typeof getCart>>>;

type CartItemData = Pick<
  Cart['lineItems']['physicalItems'][number],
  'quantity' | 'productEntityId' | 'variantEntityId' | 'selectedOptions'
> & {
  lineItemEntityId: string;
};

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

const SubmitButton = ({ children, ...props }: ComponentPropsWithoutRef<'button'>) => {
  const { pending } = useFormStatus();
  const t = useTranslations('Cart.SubmitItemQuantity');

  return (
    <button
      className="hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:text-gray-200"
      disabled={pending}
      type="submit"
      {...props}
    >
      {children}
      {pending && <span className="sr-only">{t('spinnerText')}</span>}
    </button>
  );
};

const Quantity = ({ value }: { value: number }) => {
  const { pending } = useFormStatus();
  const t = useTranslations('Cart.SubmitItemQuantity');

  return (
    <span className="flex w-10 justify-center">
      {pending ? (
        <>
          <Spinner aria-hidden="true" className="animate-spin text-primary" />
          <span className="sr-only">{t('spinnerText')}</span>
        </>
      ) : (
        <span>{value}</span>
      )}
    </span>
  );
};

export const ItemQuantity = ({ product }: { product: Product }) => {
  const t = useTranslations('Cart.SubmitItemQuantity');

  const { quantity, entityId, productEntityId, variantEntityId, selectedOptions } = product;
  const [productQuantity, setProductQuantity] = useState<number>(quantity);

  useEffect(() => {
    setProductQuantity(quantity);
  }, [quantity]);

  const onSubmit = async (formData: FormData) => {
    const { status } = await updateItemQuantity({
      lineItemEntityId: entityId,
      productEntityId,
      quantity: Number(formData.get('quantity')),
      selectedOptions: parseSelectedOptions(selectedOptions),
      variantEntityId,
    });

    if (status === 'error') {
      toast.error(t('errorMessage'), {
        icon: <AlertCircle className="text-error-secondary" />,
      });
    }
  };

  return (
    <div className="border-2 border-gray-200 p-2.5">
      <form action={onSubmit} className="flex items-center">
        <SubmitButton
          aria-label={t('submitReduceText')}
          onClick={() => setProductQuantity(productQuantity - 1)}
        >
          <Minus aria-hidden="true" />
        </SubmitButton>

        <input name="quantity" type="hidden" value={productQuantity} />
        <Quantity value={productQuantity} />

        <SubmitButton
          aria-label={t('submitIncreaseText')}
          onClick={() => setProductQuantity(productQuantity + 1)}
        >
          <Plus aria-hidden="true" />
        </SubmitButton>
      </form>
    </div>
  );
};
