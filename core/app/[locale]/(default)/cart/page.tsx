import { cookies } from 'next/headers';
import { getFormatter, getTranslations } from 'next-intl/server';

import { Cart as CartComponent } from '@/vibes/soul/sections/cart';

import { redirectToCheckout } from './_actions/redirect-to-checkout';
import { updateLineItem } from './_actions/update-line-item';
import { CartViewed } from './_components/cart-viewed';
import { getCart } from './page-data';

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
    quantity: item.quantity,
    price: format.number(item.listPrice.value, {
      style: 'currency',
      currency: item.listPrice.currencyCode,
    }),
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

  return (
    <>
      <CartComponent
        checkoutAction={redirectToCheckout}
        decrementLineItemLabel={t('decrement')}
        deleteLineItemLabel={t('removeItem')}
        emptyState={{
          title: t('Empty.title'),
          subtitle: t('Empty.subtitle'),
          cta: { label: t('Empty.cta'), href: '/shop-all' },
        }}
        incrementLineItemLabel={t('increment')}
        lineItemAction={updateLineItem}
        lineItems={formattedLineItems}
        summary={{
          subtotalLabel: t('CheckoutSummary.subTotal'),
          subtotal: format.number(checkout?.subtotal?.value ?? 0, {
            style: 'currency',
            currency: cart.currencyCode,
          }),
          ctaLabel: t('proceedToCheckout'),
        }}
        title={t('title')}
      />
      <CartViewed
        currencyCode={cart.currencyCode}
        lineItems={lineItems}
        subtotal={checkout?.subtotal?.value}
      />
    </>
  );
}
