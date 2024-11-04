import { cookies } from 'next/headers';
import { getFormatter, getTranslations } from 'next-intl/server';

import { Cart as CartComponent } from '@/vibes/soul/sections/cart';
// import { bodl } from '~/lib/bodl';

import { redirectToCheckout } from './_actions/redirect-to-checkout';
import { removeItem } from './_actions/remove-item';
import { CartSelectedOptionsInput, updateQuantity } from './_actions/update-quantity';
import { CartViewed } from './_components/cart-viewed';
import { getCart } from './page-data';

// type PhysicalItem = FragmentOf<typeof PhysicalItemFragment>;
// type DigitalItem = FragmentOf<typeof DigitalItemFragment>;
// type LineItem = PhysicalItem | DigitalItem;

// const lineItemTransform = (item: LineItem) => {
//   return {
//     product_id: item.productEntityId.toString(),
//     product_name: item.name,
//     brand_name: item.brand ?? undefined,
//     sku: item.sku ?? undefined,
//     sale_price: item.extendedSalePrice.value,
//     purchase_price: item.listPrice.value,
//     base_price: item.originalPrice.value,
//     retail_price: item.listPrice.value,
//     currency: item.listPrice.currencyCode,
//     variant_id: item.variantEntityId ? [item.variantEntityId] : undefined,
//     quantity: item.quantity,
//   };
// };

export async function generateMetadata() {
  const t = await getTranslations('Cart');

  return {
    title: t('title'),
  };
}

export default async function Cart() {
  const t = await getTranslations('Cart');
  const format = await getFormatter();

  const cartId = cookies().get('cartId')?.value;

  if (!cartId) {
    return (
      <CartComponent
        emptyState={{
          title: t('Empty.title'),
          subtitle: t('Empty.subtitle'),
          cta: { label: t('Empty.cta'), href: '/shop-all' },
        }}
        lineItems={[]}
      />
    );
  }

  const data = await getCart(cartId);

  const cart = data.site.cart;
  const checkout = data.site.checkout;
  // const geography = data.geography;

  if (!cart) {
    return (
      <CartComponent
        emptyState={{
          title: t('Empty.title'),
          subtitle: t('Empty.subtitle'),
          cta: { label: t('Empty.cta'), href: '/shop-all' },
        }}
        lineItems={[]}
      />
    );
  }

  const lineItems = [...cart.lineItems.physicalItems, ...cart.lineItems.digitalItems];

  const formattedLineItems = lineItems.map((item) => ({
    id: item.entityId,
    // productEntityId: item.productEntityId,
    // variantEntityId: item.variantEntityId ?? undefined,
    quantity: item.quantity,
    price: format.number(item.listPrice.value, {
      style: 'currency',
      currency: item.listPrice.currencyCode,
    }),
    // selectedOptions: item.selectedOptions,
    subtitle: item.selectedOptions
      .map((option) => {
        switch (option.__typename) {
          case 'CartSelectedMultipleChoiceOption':
          case 'CartSelectedCheckboxOption':
            return `${option.name}: ${option.value}`;

          case 'CartSelectedNumberFieldOption':
            return `${option.name}: ${option.number}`;

          case 'CartSelectedMultiLineTextFieldOption':
          case 'CartSelectedTextFieldOption':
            return `${option.name}: ${option.text}`;

          case 'CartSelectedDateFieldOption':
            return `${option.name}: ${format.dateTime(new Date(option.date.utc))}`;

          default:
            return '';
        }
      })
      .join(', '),
    title: item.name,
    image: { src: item.image?.url || '', alt: item.name },
    href: new URL(item.url).pathname,
  }));

  const removeLineItemAction = async (
    state: { error: string | null },
    id: string,
  ): Promise<{ error: string | null }> => {
    'use server';

    const result = await removeItem({ lineItemEntityId: id });

    if (result.status === 'error') {
      return { error: result.error ?? '' };
    }

    // TODO: add bodl
    // bodl.cart.productRemoved({
    //   currency,
    //   product_value: product.listPrice.value * product.quantity,
    //   line_items: [lineItemTransform(product)],
    // });

    return { error: null };
  };

  const redirectToCheckoutAction = async () => {
    'use server';

    await redirectToCheckout();
  };

  const updateLineItemQuantityAction = async (
    state: { error: string | null },
    { id, quantity }: { id: string; quantity: number },
  ): Promise<{ error: string | null }> => {
    'use server';

    const t2 = await getTranslations('Cart.Errors');

    const data2 = await getCart(cartId);

    const cart2 = data2.site.cart;

    if (!cart2) {
      return { error: t2('cartNotFound') };
    }

    const lineItem2 = [...cart2.lineItems.physicalItems, ...cart2.lineItems.digitalItems].find(
      (lineItem) => lineItem.entityId === id,
    );

    if (!lineItem2) {
      return { error: t2('itemNotFound') };
    }

    const parsedSelectedOptions = lineItem2.selectedOptions.reduce<CartSelectedOptionsInput>(
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
                multiLineTextFields: [...accum.multiLineTextFields, multiLineTextFieldOptionInput],
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

    const result = await updateQuantity({
      lineItemEntityId: lineItem2.entityId,
      productEntityId: lineItem2.productEntityId,
      variantEntityId: lineItem2.variantEntityId,
      selectedOptions: parsedSelectedOptions,
      quantity,
    });

    if (result.status === 'error') {
      return { error: result.error ?? '' };
    }

    return { error: null };
  };

  return (
    <>
      <CartComponent
        decrementAriaLabel={t('decrement')}
        incrementAriaLabel={t('increment')}
        lineItems={formattedLineItems}
        redirectToCheckoutAction={redirectToCheckoutAction}
        removeItemAriaLabel={t('removeItem')}
        removeLineItemAction={removeLineItemAction}
        summary={{
          subtotalLabel: t('CheckoutSummary.subTotal'),
          subtotal: format.number(checkout?.subtotal?.value ?? 0, {
            style: 'currency',
            currency: cart.currencyCode,
          }),
        }}
        title={t('title')}
        totalQuantity={cart.lineItems.totalQuantity}
        updateLineItemQuantityAction={updateLineItemQuantityAction}
      />
      <CartViewed
        currencyCode={cart.currencyCode}
        lineItems={lineItems}
        subtotal={checkout?.subtotal?.value}
      />
    </>
  );
}
