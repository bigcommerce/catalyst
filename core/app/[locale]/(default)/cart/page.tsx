import { cookies } from 'next/headers';
import { getTranslations, getFormatter } from 'next-intl/server';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';

import { BcImage } from '~/components/bc-image';
import { Breadcrumbs as ComponentsBreadcrumbs } from '~/components/ui/breadcrumbs';
import { imageManagerImageUrl } from '~/lib/store-assets';
import { CartItem, CartItemFragment } from './_components/cart-item';
import { CartViewed } from './_components/cart-viewed';
import { CheckoutButton } from './_components/checkout-button';
import { ApplepayButton } from './_components/applepay-button';
import { PaypalButton } from './_components/paypal-button';
import { AmazonpayButton } from './_components/amazonpay-button';
import { ContinuetocheckoutButton } from './_components/continueto-checkout';
import { CheckoutSummary, CheckoutSummaryFragment } from './_components/checkout-summary';
import { EmptyCart } from './_components/empty-cart';
import { GeographyFragment } from './_components/shipping-estimator/fragment';
import { SaveCart } from './_components/save-cart';
import { RemoveCart } from './_components/remove-cart';
import { getProductMetaFields } from '~/components/get-meta-fields';


const CartPageQuery = graphql(
  `
    query CartPageQuery($cartId: String) {
      site {
        cart(entityId: $cartId) {
          entityId
          currencyCode
          lineItems {
            ...CartItemFragment
          }
        }
        checkout(entityId: $cartId) {
          ...CheckoutSummaryFragment
        }
      }
      geography {
        ...GeographyFragment
      }
    }
  `,
  [CartItemFragment, CheckoutSummaryFragment, GeographyFragment],
);

export async function generateMetadata() {
  const t = await getTranslations('Cart');

  return {
    title: t('title'),
  };
}

async function getFields() {
  return await getProductMetaFields(41110, 'Details');
}

export default async function Cart() {

  
  let metaFields = await getFields();
  console.log('========metaFields=======', metaFields);
  const cartId = cookies().get('cartId')?.value;

  if (!cartId) {
    return <EmptyCart />;
  }

  const t = await getTranslations('Cart');

  const customerId = await getSessionCustomerId();

  const { data } = await client.fetch({
    document: CartPageQuery,
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
  const geography = data.geography;

  if (!cart) {
    return <EmptyCart />;
  }

  const lineItems = [...cart.lineItems.physicalItems, ...cart.lineItems.digitalItems];
  let cartQty = lineItems?.reduce(function (total, cartItems) { return total + cartItems?.quantity }, 0);
  let cartItemsText = (cartQty > 1) ? " Items" : " Item";
  const deleteIcon = imageManagerImageUrl('delete.png', '20w');
  const downArrow = imageManagerImageUrl('downarrow.png', '20w');
  const agentIcon = imageManagerImageUrl('agent-icon.png', '20w');
  const heartIcon = imageManagerImageUrl('hearticon.png', '20w');
  const applePayIcon = imageManagerImageUrl('applepay.png', '60w');
  const amazonPayIcon = imageManagerImageUrl('amazonpay.png', '125w');
  const paypalIcon = imageManagerImageUrl('fill-11.png', '25w');
  const closeIcon = imageManagerImageUrl('close.png', '25w');
  const format = await getFormatter();
  
  const breadcrumbs: any = [{
    label: "Your Cart",
    href: '#'
  }];
  return (
    <div>
      {/* Cart number for mobile (centered on small devices, above "Your cart" with top padding), hidden on larger screens */}
      <ContinuetocheckoutButton cartId={cartId} />
      <div className="text-center pt-8 lg:hidden">
        <div className="inline-flex items-center gap-2">
          Subtotal {format.number(checkout?.subtotal?.value || 0, {
            style: 'currency',
            currency: cart?.currencyCode,
          })}
          <BcImage
            alt="Remove"
            width={12}
            height={8}
            className="w-[12px] h-[8px]"
            src={downArrow}
          />
        </div>
      </div>

      <div className="text-center pt-8 lg:hidden">
        <div>Cart #12345</div>
      </div>

      {/* Heading section */}
      <ComponentsBreadcrumbs breadcrumbs={breadcrumbs} />
      <h1 className="pb-4 pt-9 text-xl font-medium text-center lg:text-left lg:pb-10 lg:text-xl">
        {`${t('heading')}(${cartQty}${cartItemsText})`}
      </h1>

      {/* Cart number for larger screens, SaveCart, and RemoveCart all in one line */}
      <div className="hidden lg:flex lg:items-center lg:space-x-8">
        <SaveCart cartItems={lineItems} saveCartIcon={heartIcon} />
        { /*<RemoveCart cartId={cart.entityId} icon={deleteIcon} deleteIcon={closeIcon} /> */ }
        <div>Cart #12345</div>
      </div>

      {/* Your cart section */}
      <div className="pb-12 md:grid md:grid-cols-2 md:gap-8 lg:grid-cols-6">
        {/* Mobile layout for SaveCart and RemoveCart */}
        <div className="w-full flex justify-center items-center gap-4 lg:hidden">
          {/* SaveCart aligned left on small devices */}
          <div className="w-auto text-left">
            <SaveCart cartItems={lineItems} saveCartIcon={heartIcon} />
          </div>
          {/* RemoveCart aligned right on small devices */}
          <div className="w-auto text-right">
            <RemoveCart cartId={cart.entityId} icon={deleteIcon} deleteIcon={closeIcon} />
          </div>
        </div>
      </div>
      <div className="pb-12 md:grid md:grid-cols-2 md:gap-8 lg:grid-cols-3 px-18">
        <ul className="col-span-2">
          {lineItems.map((product) => (
            <CartItem currencyCode={cart.currencyCode} key={product.entityId} product={product} deleteIcon={deleteIcon} />
          ))}
        </ul>

        <div className="col-span-1 col-start-2 lg:col-start-3">
          {checkout && <CheckoutSummary checkout={checkout} geography={geography} />}

          <CheckoutButton cartId={cartId} />
          <ApplepayButton cartId={cartId} icon={applePayIcon} />
          <PaypalButton cartId={cartId} icon={paypalIcon} />
          <AmazonpayButton cartId={cartId} icon={amazonPayIcon} />
          <div className="pt-3"></div>
          <p className="pt-1 text-blue-600 underline underline-offset-4">Return Policy</p>
          <p className="pt-1 text-blue-600 underline underline-offset-4">Shipping Policy</p>
          <p className="pt-1 flex items-center text-blue-600 align-middle underline underline-offset-4">
            <BcImage
              alt="Agent Icon"
              width={12}
              height={8}
              className="w-[16px] h-[16px]"
              src={agentIcon}
            /> Talk to an Agent</p>
            
        </div>
      </div>
      <CartViewed checkout={checkout} currencyCode={cart.currencyCode} lineItems={lineItems} />
    </div>
  );
}

export const runtime = 'edge';
