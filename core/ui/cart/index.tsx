import { type SubmissionResult } from '@conform-to/react';

import { type Streamable } from '@/vibes/soul/lib/streamable';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

interface CartLineItem {
  id: string;
  image: { alt: string; src: string };
  title: string;
  subtitle: string;
  quantity: number;
  price: string;
}

interface CartSummaryItem {
  label: string;
  value: string;
}

interface CartDataData<LineItem extends CartLineItem = CartLineItem> {
  lineItems: LineItem[];
  summaryItems: CartSummaryItem[];
  total: string;
}

interface CartState<LineItem extends CartLineItem = CartLineItem> {
  lineItems: LineItem[];
  lastResult: SubmissionResult | null;
}

interface CouponCodeState {
  couponCodes: string[];
  lastResult: SubmissionResult | null;
}

interface CouponCode {
  action: Action<CouponCodeState, FormData>;
  couponCodes?: string[];
}

interface Address {
  country: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

interface ShippingOption {
  label: string;
  value: string;
  price: string;
}

interface ShippingState {
  lastResult: SubmissionResult | null;
  address: Address | null;
  shippingOptions: ShippingOption[] | null;
  shippingOption: ShippingOption | null;
  form: 'address' | 'shipping' | null;
}

interface Country {
  label: string;
  value: string;
}

interface States {
  country: string;
  states: Array<{
    label: string;
    value: string;
  }>;
}

interface Shipping {
  action: Action<ShippingState, FormData>;
  countries: Country[];
  states: States[];
  address?: Address;
  shippingOptions?: ShippingOption[];
  shippingOption?: ShippingOption;
}

export interface CartData<
  LineItem extends CartLineItem = CartLineItem,
  Data extends CartDataData<LineItem> = CartDataData<LineItem>,
  Coupon extends CouponCode = CouponCode,
  ShippingInfo extends Shipping = Shipping,
> {
  lineItemAction: Action<CartState<LineItem>, FormData>;
  checkoutAction: Action<SubmissionResult | null, FormData>;
  cart: Streamable<Data>;
  couponCode?: Coupon;
  shipping?: ShippingInfo;
}
