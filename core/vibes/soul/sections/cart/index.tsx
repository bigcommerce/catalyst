import { BcImage } from '~/components/bc-image';
import { Link } from '~/components/link';
import { Suspense } from 'react';

import { Button } from '@/vibes/soul/primitives/button';
import { DecrementButton } from '@/vibes/soul/sections/cart/decrement-button';
import { DeleteLineItemButton } from '@/vibes/soul/sections/cart/delete-line-item-button';
import { IncrementButton } from '@/vibes/soul/sections/cart/increment-button';

interface Image {
  alt: string;
  src: string;
}

export interface CartLineItem {
  id: string;
  image: Image;
  title: string;
  subtitle: string;
  quantity: number;
  price: string;
}

interface CartSummary {
  title?: string;
  caption?: string;
  subtotalLabel?: string;
  subtotal: string | Promise<string>;
  shippingLabel?: string;
  shipping?: string;
  taxLabel?: string;
  tax?: string | Promise<string>;
  grandTotalLabel?: string;
  grandTotal?: string | Promise<string>;
  ctaLabel?: string;
}

interface CartEmptyState {
  title: string;
  subtitle: string;
  cta: {
    label: string;
    href: string;
  };
}

interface CartProps {
  title?: string;
  lineItems: CartLineItem[] | Promise<CartLineItem[]>;
  summary: CartSummary;
  emptyState: CartEmptyState;
  removeItemAriaLabel?: string;
  loadingAriaLabel?: string;
  removeLineItemAction(id: string): Promise<void>;
  decrementAriaLabel?: string;
  incrementAriaLabel?: string;
  updateLineItemQuantityAction({ id, quantity }: { id: string; quantity: number }): Promise<void>;
  redirectToCheckoutAction(): Promise<void>;
}

export const Cart = function Cart({
  title = 'Cart',
  lineItems,
  summary,
  emptyState,
  removeItemAriaLabel,
  loadingAriaLabel,
  decrementAriaLabel,
  incrementAriaLabel,
  removeLineItemAction,
  updateLineItemQuantityAction,
  redirectToCheckoutAction,
}: CartProps) {
  return (
    <Suspense fallback={<CartSkeleton title={title} />}>
      <CartInner
        title={title}
        lineItems={lineItems}
        summary={summary}
        emptyState={emptyState}
        removeItemAriaLabel={removeItemAriaLabel}
        loadingAriaLabel={loadingAriaLabel}
        decrementAriaLabel={decrementAriaLabel}
        incrementAriaLabel={incrementAriaLabel}
        removeLineItemAction={removeLineItemAction}
        updateLineItemQuantityAction={updateLineItemQuantityAction}
        redirectToCheckoutAction={redirectToCheckoutAction}
      />
    </Suspense>
  );
};

async function CartInner({
  title,
  lineItems,
  summary,
  emptyState,
  removeItemAriaLabel,
  loadingAriaLabel,
  decrementAriaLabel,
  incrementAriaLabel,
  removeLineItemAction,
  updateLineItemQuantityAction,
  redirectToCheckoutAction,
}: CartProps) {
  // const resolvedLineItems = use(Promise.resolve(lineItems))
  const resolvedLineItems = await Promise.resolve(lineItems);

  const totalQuantity = resolvedLineItems.reduce((total, item) => total + item.quantity, 0);

  if (resolvedLineItems.length === 0) {
    return <CartEmptyState {...emptyState} />;
  }

  return (
    <div className="mx-auto max-w-screen-2xl @container">
      <div className="flex w-full flex-col gap-10 px-3 pb-10 pt-24 @xl:px-6 @4xl:flex-row @4xl:gap-20 @4xl:pb-20 @4xl:pt-32 @5xl:px-20">
        {/* Cart Side */}
        <div className="w-full">
          <h1 className="mb-10 font-heading text-4xl font-medium leading-none @xl:text-5xl">
            {title}
            {totalQuantity && <span className="ml-4 text-contrast-200">{totalQuantity}</span>}
          </h1>

          {/* Cart Items */}
          <ul className="flex flex-col gap-5">
            {resolvedLineItems.map(
              ({ id, title: lineItemTitle, image, price, subtitle, quantity }) => (
                <li
                  className="flex flex-col items-start gap-x-5 gap-y-6 @sm:flex-row @sm:items-center @sm:gap-y-4"
                  key={id}
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-contrast-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 @sm:max-w-36">
                    <BcImage
                      fill
                      src={image.src}
                      alt={image.alt}
                      sizes="(max-width: 400px) 100vw, 144px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-grow flex-wrap justify-between gap-y-2">
                    <div className="flex flex-col @xl:w-1/2 @xl:pr-4">
                      <span className="font-medium">{lineItemTitle}</span>
                      <span className="text-contrast-300">{subtitle}</span>
                    </div>
                    <div className="flex w-full flex-wrap items-center justify-between gap-x-5 gap-y-2 @sm:justify-start @xl:w-1/2 @xl:flex-nowrap">
                      <span className="font-medium @xl:ml-auto">{price}</span>

                      {/* Counter */}
                      <div className="flex items-center rounded-lg border">
                        <form
                          action={updateLineItemQuantityAction.bind(null, {
                            id,
                            quantity: quantity - 1,
                          })}
                        >
                          <DecrementButton ariaLabel={decrementAriaLabel} />
                        </form>
                        <span className="flex w-8 select-none justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                          {quantity}
                        </span>
                        <form
                          action={updateLineItemQuantityAction.bind(null, {
                            id,
                            quantity: quantity + 1,
                          })}
                        >
                          <IncrementButton ariaLabel={incrementAriaLabel} />
                        </form>
                      </div>

                      <form action={removeLineItemAction.bind(null, id)}>
                        <DeleteLineItemButton
                          removeItemAriaLabel={removeItemAriaLabel}
                          loadingAriaLabel={loadingAriaLabel}
                        />
                      </form>
                    </div>
                  </div>
                </li>
              ),
            )}
          </ul>
        </div>

        {/* Summary Side */}
        <div className="@4xl:w-1/3">
          <h2 className="mb-10 font-heading text-4xl font-medium leading-none @xl:text-5xl">
            {summary.title ?? 'Summary'}
          </h2>
          <table aria-label="Receipt Summary" className="w-full">
            <caption className="sr-only">{summary.caption ?? 'Receipt Summary'}</caption>
            <tbody>
              <tr className="border-b border-contrast-100">
                <td>{summary.subtotalLabel ?? 'Subtotal'}</td>
                <td className="py-4 text-right">{summary.subtotal}</td>
              </tr>
              {summary.shipping && (
                <tr className="border-b border-contrast-100">
                  <td>{summary.shippingLabel ?? 'Shipping'}</td>
                  <td className="py-4 text-right">{summary.shipping}</td>
                </tr>
              )}
              {summary.tax && (
                <tr>
                  <td>{summary.taxLabel ?? 'Tax'}</td>
                  <td className="py-4 text-right">{summary.tax}</td>
                </tr>
              )}
            </tbody>

            {summary.grandTotal && (
              <tfoot>
                <tr className="text-xl">
                  <th scope="row" className="text-left">
                    {summary.grandTotalLabel ?? 'Grand Total'}
                  </th>
                  <td className="py-10 text-right">{summary.grandTotal}</td>
                </tr>
              </tfoot>
            )}
          </table>
          <form action={redirectToCheckoutAction}>
            <Button className="mt-10 w-full" type="submit">
              {summary.ctaLabel ?? 'Checkout'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function CartEmptyState({ title, subtitle, cta }: CartEmptyState) {
  return (
    <div className="mt-20 flex min-h-96 flex-col items-center justify-center @container">
      <span className="mb-3 text-center font-heading text-2xl font-medium leading-none text-foreground @lg:text-4xl @3xl:text-5xl">
        {title}
      </span>
      <h2 className="mb-10 text-center leading-none text-contrast-300 @3xl:text-lg">{subtitle}</h2>
      <Button asChild>
        <Link href={cta.href}>{cta.label}</Link>
      </Button>
    </div>
  );
}

function CartSkeleton({ title }: { title: string }) {
  return (
    <div className="mx-auto w-full max-w-screen-2xl animate-pulse @container">
      <div className="flex w-full flex-col gap-10 px-3 pb-10 pt-24 @xl:px-6 @4xl:flex-row @4xl:gap-20 @4xl:pb-20 @4xl:pt-32 @5xl:px-20">
        {/* Cart Side */}
        <div className="w-full">
          <h1 className="mb-10 font-heading text-4xl font-medium leading-none @xl:text-5xl">
            {title}
          </h1>

          {/* Cart Line Items */}
          <ul className="flex flex-col gap-5">
            {Array.from({ length: 2 }).map((_, index) => (
              <li
                className="flex flex-col items-start gap-x-5 gap-y-8 @sm:flex-row @sm:items-center @sm:gap-y-4"
                key={index}
              >
                {/* Image */}
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-contrast-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 @sm:max-w-36"></div>
                <div className="flex flex-grow flex-wrap justify-between gap-y-3.5">
                  <div className="flex flex-col gap-3 @xl:w-1/2 @xl:pr-4">
                    {/* Line Item Title */}
                    <div className="h-4 w-44 rounded-md bg-contrast-100" />
                    {/* Subtitle */}
                    <div className="h-3 w-36 rounded-md bg-contrast-100" />
                  </div>
                  <div className="flex w-full flex-wrap items-center justify-between gap-x-5 gap-y-2 @sm:justify-start @xl:w-1/2 @xl:flex-nowrap @xl:justify-end">
                    {/* Price */}
                    <div className="h-4 w-8 rounded-md bg-contrast-100" />
                    {/* Counter */}
                    <div className="h-[44px] w-[120px] rounded-lg bg-contrast-100" />
                    {/* DeleteLineItemButton */}
                    <div className="mr-1 h-6 w-6 rounded-full bg-contrast-100" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary Side */}
        <div className="@4xl:w-1/3">
          {/* Summary Title */}
          <div className="mt-3.5 h-4 w-40 rounded-lg bg-contrast-100 @xl:h-7 @xl:w-52" />

          {/* Subtotal */}
          <div className="mt-[66px] flex justify-between border-b border-contrast-100/50 pb-5">
            <div className="h-4 w-16 rounded-md bg-contrast-100" />
            <div className="h-4 w-9 rounded-md bg-contrast-100" />
          </div>

          {/* Shipping */}
          <div className="mt-5 flex justify-between border-b border-contrast-100/50 pb-5">
            <div className="h-4 w-[70px] rounded-md bg-contrast-100" />
            <div className="h-4 w-8 rounded-md bg-contrast-100" />
          </div>

          {/* Tax */}
          <div className="mt-5 flex justify-between border-b border-contrast-100/50 pb-5">
            <div className="h-4 w-8 rounded-md bg-contrast-100" />
            <div className="h-4 w-8 rounded-md bg-contrast-100" />
          </div>

          {/* Grand Total */}
          {/* <div className="mt-10 flex justify-between border-b border-contrast-100/50 pb-5">
            <div className="h-6 w-20 rounded-lg bg-contrast-100" />
            <div className="h-6 w-16 rounded-lg bg-contrast-100" />
          </div> */}

          {/* Checkout Button */}
          <div className="mt-10 h-[50px] w-full rounded-full bg-contrast-100" />
        </div>
      </div>
    </div>
  );
}
