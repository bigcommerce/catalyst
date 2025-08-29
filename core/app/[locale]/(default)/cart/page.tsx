import { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { Cart as CartComponent, CartEmptyState } from '@/vibes/soul/sections/cart';
import { CartAnalyticsProvider } from '~/app/[locale]/(default)/cart/_components/cart-analytics-provider';
import { getCartId } from '~/lib/cart';
import { exists } from '~/lib/utils';

import { redirectToCheckout } from './_actions/redirect-to-checkout';
import { updateCouponCode } from './_actions/update-coupon-code';
import { updateLineItem } from './_actions/update-line-item';
import { updateShippingInfo } from './_actions/update-shipping-info';
import { CartViewed } from './_components/cart-viewed';
import { CheckoutPreconnect } from './_components/checkout-preconnect';
import { getCart, getShippingCountries } from './page-data';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'Cart' });

  return {
    title: t('title'),
  };
}

const getAnalyticsData = async (cartId: string) => {
  const data = await getCart({ cartId });

  const cart = data.site.cart;

  if (!cart) {
    return [];
  }

  const lineItems = [...cart.lineItems.physicalItems, ...cart.lineItems.digitalItems];

  return lineItems.map((item) => {
    return {
      entityId: item.entityId,
      id: item.productEntityId,
      name: item.name,
      brand: item.brand ?? '',
      sku: item.sku ?? '',
      price: item.listPrice.value,
      quantity: item.quantity,
      currency: item.listPrice.currencyCode,
    };
  });
};

// eslint-disable-next-line complexity
export default async function Cart({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Cart');
  const format = await getFormatter();
  const cartId = await getCartId();

  if (!cartId) {
    return (
      <CartEmptyState
        cta={{ label: t('Empty.cta'), href: '/shop-all' }}
        subtitle={t('Empty.subtitle')}
        title={t('Empty.title')}
      />
    );
  }

  const data = await getCart({ cartId });

  const cart = data.site.cart;
  const checkout = data.site.checkout;

  if (!cart) {
    return (
      <CartEmptyState
        cta={{ label: t('Empty.cta'), href: '/shop-all' }}
        subtitle={t('Empty.subtitle')}
        title={t('Empty.title')}
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
    selectedOptions: item.selectedOptions,
    productEntityId: item.productEntityId,
    variantEntityId: item.variantEntityId,
  }));

  const totalCouponDiscount =
    checkout?.coupons.reduce((sum, coupon) => sum + coupon.discountedAmount.value, 0) ?? 0;

  const shippingConsignment =
    checkout?.shippingConsignments?.find((consignment) => consignment.selectedShippingOption) ||
    checkout?.shippingConsignments?.[0];

  const shippingCountries = await getShippingCountries();

  const countries = shippingCountries.map((country) => ({
    value: country.code,
    label: country.name,
  }));

  const statesOrProvinces = shippingCountries.map((country) => ({
    country: country.code,
    states: country.statesOrProvinces.map((state) => ({
      value: state.entityId.toString(),
      label: state.name,
    })),
  }));

  const showShippingForm =
    shippingConsignment?.address && !shippingConsignment.selectedShippingOption;

  const checkoutUrl = data.site.settings?.url.checkoutUrl;

  return (
    <>
      <CartAnalyticsProvider data={Streamable.from(() => getAnalyticsData(cartId))}>
        {checkoutUrl ? <CheckoutPreconnect url={checkoutUrl} /> : null}
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
              cart.discountedAmount.value > 0
                ? {
                    label: t('CheckoutSummary.discounts'),
                    value: `-${format.number(cart.discountedAmount.value, {
                      style: 'currency',
                      currency: cart.currencyCode,
                    })}`,
                  }
                : null,
              totalCouponDiscount > 0
                ? {
                    label: t('CheckoutSummary.CouponCode.couponCode'),
                    value: `-${format.number(totalCouponDiscount, {
                      style: 'currency',
                      currency: cart.currencyCode,
                    })}`,
                  }
                : null,
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
          lineItemActionPendingLabel={t('cartUpdateInProgress')}
          shipping={{
            action: updateShippingInfo,
            countries,
            states: statesOrProvinces,
            address: shippingConsignment?.address
              ? {
                  country: shippingConsignment.address.countryCode,
                  city:
                    shippingConsignment.address.city !== ''
                      ? (shippingConsignment.address.city ?? undefined)
                      : undefined,
                  state:
                    shippingConsignment.address.stateOrProvince !== ''
                      ? (shippingConsignment.address.stateOrProvince ?? undefined)
                      : undefined,
                  postalCode:
                    shippingConsignment.address.postalCode !== ''
                      ? (shippingConsignment.address.postalCode ?? undefined)
                      : undefined,
                }
              : undefined,
            shippingOptions: shippingConsignment?.availableShippingOptions
              ? shippingConsignment.availableShippingOptions.map((option) => ({
                  label: option.description,
                  value: option.entityId,
                  price: format.number(option.cost.value, {
                    style: 'currency',
                    currency: checkout?.cart?.currencyCode,
                  }),
                }))
              : undefined,
            shippingOption: shippingConsignment?.selectedShippingOption
              ? {
                  value: shippingConsignment.selectedShippingOption.entityId,
                  label: shippingConsignment.selectedShippingOption.description,
                  price: format.number(shippingConsignment.selectedShippingOption.cost.value, {
                    style: 'currency',
                    currency: checkout?.cart?.currencyCode,
                  }),
                }
              : undefined,
            showShippingForm,
            shippingLabel: t('CheckoutSummary.Shipping.shipping'),
            addLabel: t('CheckoutSummary.Shipping.add'),
            changeLabel: t('CheckoutSummary.Shipping.change'),
            countryLabel: t('CheckoutSummary.Shipping.country'),
            cityLabel: t('CheckoutSummary.Shipping.city'),
            stateLabel: t('CheckoutSummary.Shipping.state'),
            postalCodeLabel: t('CheckoutSummary.Shipping.postalCode'),
            updateShippingOptionsLabel: t('CheckoutSummary.Shipping.updatedShippingOptions'),
            viewShippingOptionsLabel: t('CheckoutSummary.Shipping.viewShippingOptions'),
            cancelLabel: t('CheckoutSummary.Shipping.cancel'),
            editAddressLabel: t('CheckoutSummary.Shipping.editAddress'),
            shippingOptionsLabel: t('CheckoutSummary.Shipping.shippingOptions'),
            updateShippingLabel: t('CheckoutSummary.Shipping.updateShipping'),
            addShippingLabel: t('CheckoutSummary.Shipping.addShipping'),
            noShippingOptionsLabel: t('CheckoutSummary.Shipping.noShippingOptions'),
          }}
          summaryTitle={t('CheckoutSummary.title')}
          title={t('title')}
        />
      </CartAnalyticsProvider>
      <CartViewed
        currencyCode={cart.currencyCode}
        lineItems={lineItems}
        subtotal={checkout?.subtotal?.value}
      />
    </>
  );
}
