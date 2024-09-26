import { cookies } from 'next/headers';
import { getFormatter } from 'next-intl/server';

import { Cart as CartComponent } from '@/vibes/soul/components/cart';
import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { FragmentOf, graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';

import { redirectToCheckout } from '../_actions/redirect-to-checkout';
import { removeItem } from '../_actions/remove-item';
import { updateQuantity } from '../_actions/update-quantity';

import { CartViewed } from './cart-viewed';
import { CheckoutSummaryFragment } from './checkout-summary';

const PhysicalItemFragment = graphql(`
  fragment PhysicalItemFragment on CartPhysicalItem {
    name
    brand
    sku
    image {
      url: urlTemplate(lossy: true)
    }
    entityId
    quantity
    productEntityId
    variantEntityId
    extendedListPrice {
      currencyCode
      value
    }
    extendedSalePrice {
      currencyCode
      value
    }
    originalPrice {
      currencyCode
      value
    }
    listPrice {
      currencyCode
      value
    }
    selectedOptions {
      __typename
      entityId
      name
      ... on CartSelectedMultipleChoiceOption {
        value
        valueEntityId
      }
      ... on CartSelectedCheckboxOption {
        value
        valueEntityId
      }
      ... on CartSelectedNumberFieldOption {
        number
      }
      ... on CartSelectedMultiLineTextFieldOption {
        text
      }
      ... on CartSelectedTextFieldOption {
        text
      }
      ... on CartSelectedDateFieldOption {
        date {
          utc
        }
      }
    }
    url
  }
`);

const DigitalItemFragment = graphql(`
  fragment DigitalItemFragment on CartDigitalItem {
    name
    brand
    sku
    image {
      url: urlTemplate(lossy: true)
    }
    entityId
    quantity
    productEntityId
    variantEntityId
    extendedListPrice {
      currencyCode
      value
    }
    extendedSalePrice {
      currencyCode
      value
    }
    originalPrice {
      currencyCode
      value
    }
    listPrice {
      currencyCode
      value
    }
    selectedOptions {
      __typename
      entityId
      name
      ... on CartSelectedMultipleChoiceOption {
        value
        valueEntityId
      }
      ... on CartSelectedCheckboxOption {
        value
        valueEntityId
      }
      ... on CartSelectedNumberFieldOption {
        number
      }
      ... on CartSelectedMultiLineTextFieldOption {
        text
      }
      ... on CartSelectedTextFieldOption {
        text
      }
      ... on CartSelectedDateFieldOption {
        date {
          utc
        }
      }
    }
    url
  }
`);

const CartQuery = graphql(
  `
    query CartQuery($cartId: String) {
      site {
        cart(entityId: $cartId) {
          entityId
          currencyCode
          lineItems {
            physicalItems {
              ...PhysicalItemFragment
            }
            digitalItems {
              ...DigitalItemFragment
            }
            totalQuantity
          }
        }
        checkout(entityId: $cartId) {
          subtotal {
            currencyCode
            value
          }
          # Need all fields for bodl, can we simplify?
          ...CheckoutSummaryFragment
        }
      }
    }
  `,
  [PhysicalItemFragment, DigitalItemFragment, CheckoutSummaryFragment],
);

// Export for types in VIBES cart component, remove when no longer needed
export type SelectedOptions = FragmentOf<typeof PhysicalItemFragment>['selectedOptions'];

export const Cart = async () => {
  const cartId = cookies().get('cartId')?.value;

  if (!cartId) {
    // TODO: render cart with no products for now, ideally we should have an empty cart component
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return <CartComponent products={[]} />;
  }

  const customerId = await getSessionCustomerId();

  const format = await getFormatter();

  const { data } = await client.fetch({
    document: CartQuery,
    variables: { cartId },
    customerId,
    fetchOptions: {
      cache: 'no-store',
      next: {
        tags: [TAGS.cart, TAGS.checkout],
      },
    },
  });

  const cart = data.site.cart;
  const checkout = data.site.checkout;

  if (!cart) {
    // TODO: render cart with no products for now, ideally we should have an empty cart component
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return <CartComponent products={[]} />;
  }

  const lineItems = [...cart.lineItems.physicalItems, ...cart.lineItems.digitalItems];

  const formattedLineItems = lineItems.map((item) => ({
    id: item.entityId,
    productEntityId: item.productEntityId,
    variantEntityId: item.variantEntityId ?? undefined,
    quantity: item.quantity,
    price: format.number(item.listPrice.value, {
      style: 'currency',
      currency: item.listPrice.currencyCode,
    }),
    selectedOptions: item.selectedOptions,
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
    name: item.name,
    image: { src: item.image?.url || '', altText: item.name },
    href: new URL(item.url).pathname,
  }));

  return (
    <>
      <CartComponent
        checkoutRedirect={redirectToCheckout}
        checkoutSummary={{
          subtotal: format.number(checkout?.subtotal?.value ?? 0, {
            style: 'currency',
            currency: cart.currencyCode,
          }),
        }}
        products={formattedLineItems}
        removeItem={removeItem}
        totalQuantity={cart.lineItems.totalQuantity}
        updateQuantity={updateQuantity}
      />
      <CartViewed checkout={checkout} currencyCode={cart.currencyCode} lineItems={lineItems} />
    </>
  );
};
