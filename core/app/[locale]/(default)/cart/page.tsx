import { Metadata } from 'next';
import { getFormatter, getTranslations } from 'next-intl/server';

import { Cart as CartComponent, CartEmptyState } from '@/vibes/soul/sections/cart';
import { getCartId } from '~/lib/cart';
import { Slot } from '~/lib/makeswift/slot';
import { exists } from '~/lib/utils';

import { redirectToCheckout } from './_actions/redirect-to-checkout';
import { updateCouponCode } from './_actions/update-coupon-code';
import { updateLineItem } from './_actions/update-line-item';
import { CartViewed } from './_components/cart-viewed';
import { getCart } from './page-data';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Cart');

  return {
    title: t('title'),
  };
}

export default async function Cart() {
  const t = await getTranslations('Cart');
  const format = await getFormatter();
  const cartId = await getCartId();

  const emptyState = (
    <>
      <Slot label="Cart top content" snapshotId="cart-top-content" />
      <CartEmptyState
        cta={{ label: t('Empty.cta'), href: '/shop-all' }}
        subtitle={t('Empty.subtitle')}
        title={t('Empty.title')}
      />
      <Slot label="Cart bottom content" snapshotId="cart-bottom-content" />
    </>
  );

  if (!cartId) {
    return emptyState;
  }

  const data = await getCart({ cartId });

  const cart = data.site.cart;
  const checkout = data.site.checkout;

  if (!cart) {
    return emptyState;
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
    selectedOptions: item.selectedOptions,
    productEntityId: item.productEntityId,
    variantEntityId: item.variantEntityId,
  }));

  const discounts = cart.discounts.map((discount) => ({
    value: `-${format.number(discount.discountedAmount.value, {
      style: 'currency',
      currency: cart.currencyCode,
    })}`,
    label: t('CheckoutSummary.discounts'),
  }));

  return (
    <>
      <Slot label="Cart top content" snapshotId="cart-top-content" />
      <CartComponent
        cart={{
          lineItems: formattedLineItems,
          total: format.number(checkout?.grandTotal?.value || 0, {
            style: 'currency',
            currency: cart.currencyCode,
          }),
          totalLabel: t('CheckoutSummary.total'),
          summaryItems: [
            {
              label: t('CheckoutSummary.subTotal'),
              value: format.number(checkout?.subtotal?.value ?? 0, {
                style: 'currency',
                currency: cart.currencyCode,
              }),
            },
            ...discounts,
            checkout?.taxTotal && {
              label: t('CheckoutSummary.tax'),
              value: format.number(checkout.taxTotal.value, {
                style: 'currency',
                currency: cart.currencyCode,
              }),
            },
          ].filter(exists),
        }}
        checkoutAction={redirectToCheckout}
        checkoutLabel={t('proceedToCheckout')}
        couponCode={{
          action: updateCouponCode,
          couponCodes: checkout?.coupons.map((coupon) => coupon.code) ?? [],
          ctaLabel: t('CheckoutSummary.CouponCode.apply'),
          label: t('CheckoutSummary.CouponCode.couponCode'),
          removeLabel: t('CheckoutSummary.CouponCode.removeCouponCode'),
        }}
        decrementLineItemLabel={t('decrement')}
        deleteLineItemLabel={t('removeItem')}
        emptyState={{
          title: t('Empty.title'),
          subtitle: t('Empty.subtitle'),
          cta: { label: t('Empty.cta'), href: '/shop-all' },
        }}
        incrementLineItemLabel={t('increment')}
        key={`${cart.entityId}-${cart.version}`}
        lineItemAction={updateLineItem}
        summaryTitle={t('CheckoutSummary.title')}
        title={t('title')}
      />
      <Slot label="Cart bottom content" snapshotId="cart-bottom-content" />
      <CartViewed
        currencyCode={cart.currencyCode}
        lineItems={lineItems}
        subtotal={checkout?.subtotal?.value}
      />
    </>
  );
}
