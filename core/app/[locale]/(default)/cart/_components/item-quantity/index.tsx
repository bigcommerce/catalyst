'use client';

import { AlertCircle, Minus, Plus, Loader2 as Spinner } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ComponentPropsWithoutRef, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'react-hot-toast';

import { graphql } from '~/client/graphql';

import { Product } from '../cart-item';

import { updateItemQuantity } from './update-item-quantity';
import { updateProductQuantity } from '../../../sales-buddy/_actions/update-quantity';

type CartSelectedOptionsInput = ReturnType<typeof graphql.scalar<'CartSelectedOptionsInput'>>;

const parseSelectedOptions = (selectedOptions: Product['selectedOptions']) => {
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
    <span className="flex w-[1.5rem] flex-1 justify-center border-l-2 border-r-2 border-[#D7D7D7]">
      {pending ? (
        <>
          <Spinner aria-hidden="true" className="animate-spin text-primary" />
          <span className="sr-only">{t('spinnerText')}</span>
        </>
      ) : (
        <span className="mx-[0.525rem] text-center text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#000000]">
          {value}
        </span>
      )}
    </span>
  );
};

export const ItemQuantity = ({ product, accessories }: { product: Product; accessories?: any }) => {
  const t = useTranslations('Cart.SubmitItemQuantity');
  const { quantity, entityId, productEntityId, variantEntityId, selectedOptions } = product;
  const [productQuantity, setProductQuantity] = useState<number>(quantity);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setProductQuantity(quantity);

    if(isLoading){
      document.body.style.overflow='hidden';
    } else {
      document.body.style.overflow='';
    }

    return ()=>{
      document.body.style.overflow='';
    }
  }, [quantity, isLoading]);

  const handleQuantityUpdate = async (newQuantity: number) => {
    if (newQuantity < 1) return;

    setIsLoading(true);
    setProductQuantity(newQuantity);

    try {
      if (product?.ProductType === 'custom') {
        await updateProductQuantity(product?.cartId, newQuantity, product?.sku);
      } else {
        const { status } = await updateItemQuantity({
          lineItemEntityId: entityId,
          productEntityId,
          quantity: newQuantity,
          selectedOptions: parseSelectedOptions(selectedOptions),
          variantEntityId,
        });

        if (status === 'error') {
          toast.error(t('errorMessage'), {
            icon: <AlertCircle className="text-error-secondary" />,
          });
          setProductQuantity(quantity);
        }
      }
    } catch (error) {
      toast.error(t('errorMessage'), {
        icon: <AlertCircle className="text-error-secondary" />,
      });
      setProductQuantity(quantity);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: { target: { value: any } }) => {
    const newQuantity = Number(e.target.value);
    if (newQuantity < 1) {
      setProductQuantity(1);
    } else {
      setProductQuantity(newQuantity);
    }
  };

  const handleIncrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    await handleQuantityUpdate(productQuantity + 1);
  };

  const handleDecrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (productQuantity > 1) {
      await handleQuantityUpdate(productQuantity - 1);
    }
  };

  const handleBlur = async () => {
    await handleQuantityUpdate(productQuantity);
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 rounded-lg p-6">
            <Spinner className="animate-spin rounded-[50%] bg-[#8b8d8f] text-white shadow-[0_10px_38px_2000px_#0e121659,_0_10px_20px_2000px_#0e121633]" />
          </div>
        </div>
      )}
      <div className="cart-add-to-cart cart-item-quantity order-1 w-[105px] rounded-3xl !border-[1px] border-gray-200 p-2.5 md:static md:order-[0]">
        <div className="flex items-center">
          <button
            onClick={handleDecrement}
            disabled={isLoading || productQuantity <= 1}
            className="hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:text-gray-200"
          >
            <Minus className="mr-[8px] h-[1rem] w-[1rem] text-[#7F7F7F]">
              <title>{t('submitReduceText')}</title>
            </Minus>
          </button>
          <input
            type="number"
            value={productQuantity}
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={isLoading}
            className="[&::-webkit-outer-spin-button]:margin-0 [&::-webkit-inner-spin-button]:margin-0 w-[50%] border border-y-0 bg-transparent text-center focus:border-y-0 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            min="1"
          />
          <button
            onClick={handleIncrement}
            disabled={isLoading}
            className="hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:text-gray-200"
          >
            <Plus className="ml-[8px] h-[1rem] w-[1rem] text-[#7F7F7F]">
              <title>{t('submitIncreaseText')}</title>
            </Plus>
          </button>
        </div>
      </div>
    </>
  );
};
