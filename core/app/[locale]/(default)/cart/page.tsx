import { cookies } from 'next/headers';
import { getTranslations, getFormatter } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
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
import { GetCartMetaFields } from '~/components/management-apis';
import CartProductComponent from '../sales-buddy/common-components/_components/CartComponent/CartProductComponent';
import { get_cart_price_adjuster_data } from '../sales-buddy/_actions/get-product-by-entityid';

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

export default async function Cart() {
  const cookieStore = await cookies();

  const cartId = cookieStore.get('cartId')?.value;

  if (!cartId) {
    return <EmptyCart />;
  }

  const t = await getTranslations('Cart');

  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data } = await client.fetch({
    document: CartPageQuery,
    variables: { cartId },
    customerAccessToken,
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
 
  const CustomItems = cart?.lineItems?.customItems
  const get_product_price_data_in_cart = async (cartId: any) => {
  const result = await get_cart_price_adjuster_data(cartId);
    if (result.status === 200) {      
      return result?.data?.output;
    } else {
    return [{ error: 'Failed to retrive data' }];
    }
  };
const product_data_in_cart = await get_product_price_data_in_cart(cartId);

  const lineItems: any = [
    ...cart.lineItems.physicalItems,
    ...cart.lineItems.digitalItems,
    // ...cart.lineItems.customItems,
  ];
  let cartQty = lineItems?.reduce(function (total: number, cartItems: any) {
    return total + cartItems?.quantity;
  }, 0);
  let cartItemsText = cartQty > 1 ? ' Items' : ' Item';
  const deleteIcon = imageManagerImageUrl('delete.png', '20w');
  const downArrow = imageManagerImageUrl('downarrow.png', '20w');
  const agentIcon = imageManagerImageUrl('agent-icon.png', '20w');
  const heartIcon = imageManagerImageUrl('hearticon.png', '20w');
  const applePayIcon = imageManagerImageUrl('applepay.png', '60w');
  const amazonPayIcon = imageManagerImageUrl('amazonpay.png', '125w');
  const paypalIcon = imageManagerImageUrl('fill-11.png', '25w');
  const closeIcon = imageManagerImageUrl('close.png', '25w');
  const format = await getFormatter();
  let getCartMetaFields: any = await GetCartMetaFields(cartId, 'accessories_data');
  let updatedLineItemInfo: any = [];
  let updatedLineItemWithoutAccessories: any = [];
  let accessoriesSkuArray: any = [];
  if (getCartMetaFields?.length > 0) {
    lineItems?.forEach((item: any) => {
      let accessoriesData: any = [];
      let findAccessories = getCartMetaFields?.find((acces: any) => acces?.key == item?.entityId);
      if (findAccessories) {
        let getAccessoriesInfo = findAccessories?.value ? JSON?.parse(findAccessories?.value) : [];
        if (getAccessoriesInfo?.length > 0) {
          getAccessoriesInfo?.forEach((getInfo: any) => {
            !accessoriesSkuArray?.includes(getInfo?.variantId)
              ? accessoriesSkuArray.push(getInfo?.variantId)
              : '';
            let accessoriesInfo = lineItems?.find(
              (line: any) => line?.variantEntityId == getInfo?.variantId,
            );
            if(accessoriesInfo) {
              let accessSpreadData: any = {...accessoriesInfo};
              if (accessSpreadData) {
                accessSpreadData.prodQuantity = getInfo.quantity;
                accessSpreadData.cartId = cartId;
                accessSpreadData.lineItemId = item?.entityId;
                accessoriesData.push(accessSpreadData);
              }
            }
          });
        }
      }
      if(accessoriesData?.length > 0) {
        item['accessories'] = accessoriesData;
      }
      if (!accessoriesSkuArray?.includes(item?.variantEntityId)) {
        updatedLineItemInfo.push(item);
      }
    });
  } else {
    updatedLineItemInfo = lineItems;
  }
  updatedLineItemInfo?.forEach((item: any, index: number) => {
    if(!accessoriesSkuArray?.includes(item?.variantEntityId)) {
      updatedLineItemWithoutAccessories.push(item);
    }
  });
  const breadcrumbs: any = [{
    label: "Your Cart",
    href: '#'
  }];
  console.log("CustomItems------",CustomItems);
  
  return (
    <div className="cart-page mx-auto mb-[2rem] max-w-[93.5%] pt-8">
      <ContinuetocheckoutButton cartId={cartId} />

      <div className="pt-6 text-center lg:hidden">
        <div className="inline-flex items-center gap-2 text-[20px] font-medium leading-[32px] tracking-[0.15px] text-[#002A37]">
          Subtotal{' '}
          {format.number(checkout?.subtotal?.value || 0, {
            style: 'currency',
            currency: cart?.currencyCode,
          })}
          <BcImage
            alt="Remove"
            width={12}
            height={8}
            className="h-[8px] w-[12px]"
            src={downArrow}
          />
        </div>
      </div>

      <div className="pt-8 text-center lg:hidden">
        <div>Cart #12345</div>
      </div>

      <ComponentsBreadcrumbs className="mt-10" breadcrumbs={breadcrumbs} />

      <h1 className="cart-heading pb-6 pt-0 text-center text-[24px] font-normal leading-[32px] lg:pb-4 lg:text-left lg:text-[24px]">
        {`${t('heading')}(${cartQty}${cartItemsText})`}
      </h1>

      <div className="hidden lg:flex lg:items-center lg:space-x-8">
        <SaveCart cartItems={lineItems} saveCartIcon={heartIcon} />

        <div className="text-left text-[1rem] font-normal leading-[2rem] tracking-[0.03125rem] text-[#7F7F7F]">
          Cart #12345
        </div>
      </div>

      <div className="save-cart pb-8 md:grid md:grid-cols-2 md:gap-8 lg:grid-cols-6">
        <div className="flex w-full items-center justify-center gap-4 lg:hidden">
          <div className="cart-save-item w-auto text-left">
            <SaveCart cartItems={lineItems} saveCartIcon={heartIcon} />
          </div>
          <div className="delete-icon-empty-cart-hidden w-auto text-right">
            <RemoveCart cartId={cart.entityId} icon={deleteIcon} deleteIcon={closeIcon} />
          </div>
        </div>
      </div>
      <div className="cart-right-side-details px-18 w-full pb-0 md:grid md:grid-cols-2 md:!gap-[6rem] lg:grid-cols-3 [@media_(min-width:1200px)]:pb-[40px]">
        <ul className="cart-details-item col-span-2 lg:w-full">
          {updatedLineItemWithoutAccessories.map((product: any ) => (
            <CartItem
              currencyCode={cart.currencyCode}
              key={product.entityId}
              product={product}
              deleteIcon={deleteIcon}
              cartId={cart?.entityId}
              priceAdjustData={product_data_in_cart?.physical_items?.[product?.entityId]}
              ProductType={"product"}
            />
          ))}
          {
          
           CustomItems.length > 0 && CustomItems?.map((data)=>{
              return (
              <CartProductComponent
                key={data.entityId}
                cartId={cart.entityId}
                currencyCode={cart.currencyCode}
                product={data}
                deleteIcon={deleteIcon}
                priceAdjustData={product_data_in_cart?.custom_items &&  product_data_in_cart?.custom_items[data?.entityId]}
                ProductType={"custom"}
              />
              )
            })
          }
        </ul>

        <div className="cart-right-side sticky top-0 col-span-1 col-start-2 -mt-[9em] h-[100px] min-h-[800px] border-t border-[#CCCBCB] py-[1.4em] lg:col-start-3">
          {checkout && <CheckoutSummary checkout={checkout} geography={geography} />}

          <CheckoutButton cartId={cartId} />
          <ApplepayButton cartId={cartId} icon={applePayIcon} />
          <PaypalButton cartId={cartId} icon={paypalIcon} />
          <AmazonpayButton cartId={cartId} icon={amazonPayIcon} />
          <div className="pt-1"></div>
          <p className="pt-2 text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#002A37] underline underline-offset-4">
            Return Policy
          </p>
          <p className="pt-2 text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#002A37] underline underline-offset-4">
            Shipping Policy
          </p>
          <p className="flex items-center pt-2 text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#002A37] underline underline-offset-4">
            <BcImage
              alt="Agent Icon"
              width={10}
              height={8}
              className="mr-1 h-[14px] w-[14px]"
              src={agentIcon}
            />{' '}
            Talk to an Agent
          </p>
        </div>
      </div>

      <CartViewed checkout={checkout} currencyCode={cart.currencyCode} lineItems={lineItems} />
    </div>
  );
}

export const runtime = 'edge';