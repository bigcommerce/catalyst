'use client';

import { clsx } from 'clsx';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/vibes/soul/components/button';
import { Counter } from '@/vibes/soul/components/counter';
// import { Dropdown } from '@/vibes/soul/components/dropdown';
// import { Input } from '@/vibes/soul/components/input';
import { Modal } from '@/vibes/soul/components/modal';
import { Product } from '@/vibes/soul/components/product-card';
import {
  CartSelectedOptionsInput,
  UpdateProductQuantityParams,
} from '~/app/[locale]/(default)/cart/_actions/update-quantity';
import { SelectedOptions } from '~/app/[locale]/(default)/cart/_components/cart';
import { BcImage } from '~/components/bc-image';
import { Link } from '~/components/link';

// interface Image {
//   altText: string;
//   src: string;
// }

export interface CartProduct extends Product {
  price: string;
  quantity: number;
  // Need to update quantity
  productEntityId: number;
  variantEntityId?: number;
  selectedOptions?: SelectedOptions;
}

interface CartProps {
  products: CartProduct[];
  totalQuantity: number;
  // TODO: Figure out a more generic approach, if any
  removeItem: ({ lineItemEntityId }: { lineItemEntityId: string }) => void;
  updateQuantity: (input: UpdateProductQuantityParams) => void;
  checkoutSummary: {
    subtotal: string;
  };
  checkoutRedirect: () => void;
}

export const Cart = function Cart({
  products,
  totalQuantity,
  checkoutSummary,
  removeItem,
  updateQuantity,
  checkoutRedirect,
}: CartProps) {
  const [removeItemModalIsOpen, setRemoveItemModalIsOpen] = useState(false);
  // const [addressModalIsOpen, setAddressModalIsOpen] = useState(false);

  return (
    <div className="mx-auto max-w-screen-2xl @container">
      <div className="flex w-full flex-col gap-10 px-3 pb-10 pt-24 @xl:px-6 @4xl:flex-row @4xl:gap-20 @4xl:pb-20 @4xl:pt-32 @5xl:px-20">
        {/* Cart Side */}
        <div className={clsx(products.length > 0 && '@4xl:w-2/3', 'w-full')}>
          <h1 className="mb-10 font-heading text-4xl font-medium leading-none @xl:text-5xl">
            Your Cart
            <span className="ml-4 text-contrast-200">{totalQuantity}</span>
          </h1>

          {/* Cart Items */}
          <ul className="flex flex-col gap-5 gap-y-10">
            {products.map(
              ({
                id,
                name,
                href,
                image,
                price,
                subtitle,
                quantity,
                productEntityId,
                variantEntityId,
                selectedOptions,
              }) => (
                <li
                  className="flex flex-col items-start gap-x-5 gap-y-6 @sm:flex-row @sm:items-center @sm:gap-y-4"
                  key={id}
                >
                  {image && (
                    <Link
                      className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-contrast-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 @sm:max-w-36"
                      href={href}
                    >
                      <BcImage alt={image.altText} className="object-cover" fill src={image.src} />
                    </Link>
                  )}
                  <div className="flex flex-grow flex-wrap justify-between gap-y-2">
                    <div className="flex flex-col @xl:w-1/2 @xl:pr-4">
                      <span className="font-medium">{name}</span>
                      <span className="text-contrast-300">{subtitle}</span>
                    </div>
                    <div className="flex w-full flex-wrap items-center justify-between gap-x-5 gap-y-2 @sm:justify-start @xl:w-1/2 @xl:flex-nowrap">
                      <span className="font-medium @xl:ml-auto">{price}</span>
                      <form
                        action={(formData: FormData) => {
                          const itemQuantity = Number(formData.get('quantity'));

                          const parsedSelectedOptions = selectedOptions
                            ? selectedOptions.reduce<CartSelectedOptionsInput>((accum, option) => {
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
                                        multipleChoices: [
                                          ...accum.multipleChoices,
                                          multipleChoicesOptionInput,
                                        ],
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
                                        numberFields: [
                                          ...accum.numberFields,
                                          numberFieldOptionInput,
                                        ],
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
                              }, {})
                            : {};

                          updateQuantity({
                            lineItemEntityId: id,
                            productEntityId,
                            quantity: itemQuantity,
                            variantEntityId,
                            selectedOptions: parsedSelectedOptions,
                          });
                        }}
                      >
                        <Counter current={quantity} name="quantity" />
                      </form>

                      <button
                        className="-ml-1 flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300 hover:bg-contrast-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
                        onClick={() => {
                          // TODO: Remove Item from Cart
                          removeItem({ lineItemEntityId: id });
                        }}
                      >
                        <Trash2 size={18} strokeWidth={1} />
                      </button>
                    </div>
                  </div>
                </li>
              ),
            )}

            {products.length === 0 && (
              <div>
                <h2 className="mb-2 text-center text-3xl font-medium text-contrast-300">
                  Your cart is empty
                </h2>
                <p className="mx-auto max-w-sm text-center text-contrast-300">Go ahead & explore</p>
              </div>
            )}
          </ul>
        </div>

        {/* Summary Side */}
        {/* TODO: Need API structure to generate dynamically */}

        {products.length > 0 && (
          <div className="@4xl:w-1/3">
            <h2 className="mb-10 font-heading text-4xl font-medium leading-none @xl:text-5xl">
              Summary
            </h2>
            <table aria-label="Receipt Summary" className="mb-6 w-full">
              <caption className="sr-only">Receipt Summary</caption>
              <tbody>
                <tr className="border-b border-contrast-100">
                  <td>Subtotal</td>
                  <td className="py-4 text-right">{checkoutSummary.subtotal}</td>
                </tr>
                {/* <tr className="border-b border-contrast-100">
                  <td>Shipping</td>
                  <td className="py-4 text-right">
                    <Modal
                      content={
                        <div className="max-w-md">
                          <h2 className="font-heading text-3xl font-medium">Add Address</h2>
                          <form className="mt-10 grid w-full grid-cols-1 gap-5 @sm:grid-cols-2">
                            <Input label="Address Line 1" type="text" />
                            <Input label="Address Line 2" type="text" />
                            <Input label="Suburb/City" type="text" />
                            <Dropdown
                              items={['Georgia', 'Florida', 'California']}
                              label="State/Provence"
                              labelOnTop
                            />
                            <Dropdown
                              items={['USA', 'England', 'Brazil']}
                              label="Country"
                              labelOnTop
                            />
                            <Input label="ZIP/Postcode" type="text" />
                            <Button className="mt-10 w-full" variant="secondary">
                              Cancel
                            </Button>
                            <Button className="mt-10 w-full" disabled variant="primary">
                              Add Address
                            </Button>
                          </form>
                        </div>
                      }
                      isOpen={addressModalIsOpen}
                      setOpen={setAddressModalIsOpen}
                      trigger={
                        <button className="rounded-lg font-medium ring-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                          Add Address
                        </button>
                      }
                    />
                  </td>
                </tr>
                <tr className="border-b border-contrast-100">
                  <td>Tax</td>
                  <td className="py-4 text-right">$4.50</td>
                </tr> */}
              </tbody>
              {/* <tfoot>
                <tr className="text-xl">
                  <th className="text-left" scope="row">
                    Grand Total
                  </th>
                  <td className="py-10 text-right">$59.50</td>
                </tr>
              </tfoot> */}
            </table>
            <form action={checkoutRedirect}>
              <Button className="w-full" type="submit">
                Checkout
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export const CartSkeleton = () => (
  <div className="mx-auto max-w-screen-2xl @container">
    <div className="flex w-full flex-col gap-10 px-3 pb-10 pt-24 @xl:px-6 @4xl:flex-row @4xl:gap-20 @4xl:pb-20 @4xl:pt-32 @5xl:px-20">
      <div className="@4xl:w-2/3">
        <h1 className="mb-10 font-heading text-4xl font-medium leading-none @xl:text-5xl">
          Your Cart
        </h1>

        <ul className="flex flex-col gap-5 gap-y-10">
          {Array.from({ length: 2 }).map((_, index) => {
            return (
              <div className="flex animate-pulse items-center gap-x-5" key={index}>
                <div className="h-56 w-full rounded-lg bg-contrast-100" />
              </div>
            );
          })}
        </ul>
      </div>
      <div className="mt-1 animate-pulse @4xl:w-1/3">
        <div className="mt-20 h-96 w-full rounded bg-contrast-100" />
      </div>
    </div>
  </div>
);
