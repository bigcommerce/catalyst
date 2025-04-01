import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { SectionLayout } from '@/vibes/soul/sections/section-layout';
import { StickySidebarLayout } from '@/vibes/soul/sections/sticky-sidebar-layout';

import { CartClient, Cart as CartData, CartLineItem, Props as CartProps } from './client';

export { type CartLineItem } from './client';

export function Cart<LineItem extends CartLineItem>({
  cart: streamableCart,
  decrementLineItemLabel: streamableDecrementLineItemLabel,
  title = 'Cart',
  summaryTitle = 'Summary',
  ...rest
}: Omit<CartProps<LineItem>, 'cart'> & {
  cart: Streamable<CartData<LineItem>>;
}) {
  return (
    <Stream
      fallback={<CartSkeleton summaryTitle={summaryTitle} title={title} />}
      value={streamableCart}
    >
      {(cart) => <CartClient {...rest} cart={cart} summaryTitle={summaryTitle} title={title} />}
    </Stream>
  );
}

interface CartSkeletonProps {
  className?: string;
  placeholderCount?: number;
  summaryPlaceholderCount?: number;
  title?: string;
  summaryTitle?: string;
}

export function CartSkeleton({
  title = 'Cart',
  summaryTitle = 'Summary',
  placeholderCount = 2,
  summaryPlaceholderCount = 3,
}: CartSkeletonProps) {
  return (
    <StickySidebarLayout
      sidebar={
        <div>
          <h2 className="font-heading mb-10 text-4xl leading-none font-medium @xl:text-5xl">
            {summaryTitle}
          </h2>
          <div className="w-full">
            <div className="divide-contrast-100 divide-y">
              {Array.from({ length: summaryPlaceholderCount }).map((_, index) => (
                <div className="py-4" key={index}>
                  <div className="flex h-[1lh] w-full items-center justify-between">
                    <div className="bg-contrast-100 h-[1ch] w-16 rounded-md" />
                    <div className="bg-contrast-100 h-[1ch] w-9 rounded-md" />
                  </div>
                </div>
              ))}
            </div>

            <div className="border-contrast-100 flex justify-between border-t py-6 text-xl font-bold">
              <div className="flex h-[1lh] w-full items-center">
                <div className="bg-contrast-100 h-[1ex] w-[5ch] rounded-md" />
              </div>
              <div className="flex h-[1lh] w-full items-center justify-end">
                <div className="bg-contrast-100 h-[1ex] w-[5ch] rounded-md" />
              </div>
            </div>
          </div>

          <div className="bg-contrast-100 mt-4 h-[58px] w-full rounded-full" />
        </div>
      }
      sidebarPosition="after"
      sidebarSize="1/3"
    >
      <div>
        <h1 className="font-heading mb-10 text-4xl leading-none font-medium @xl:text-5xl">
          {title}
        </h1>

        {/* Cart Line Items */}
        <ul className="flex flex-col gap-5">
          {Array.from({ length: placeholderCount }).map((_, index) => (
            <li
              className="@container flex flex-col items-start gap-x-5 gap-y-4 @sm:flex-row"
              key={index}
            >
              {/* Image */}
              <div className="bg-contrast-100 focus-visible:ring-primary relative aspect-square w-full max-w-24 overflow-hidden rounded-xl focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-hidden" />
              <div className="flex grow flex-col flex-wrap justify-between gap-y-2 @xl:flex-row">
                <div className="flex w-full flex-1 flex-col @xl:w-1/2 @xl:pr-4">
                  {/* Line Item Title */}
                  <div className="flex h-[1lh] w-full items-center">
                    <div className="bg-contrast-100 h-[1ex] w-44 rounded-md" />
                  </div>
                  {/* Subtitle */}
                  <div className="flex h-[1lh] w-full items-center">
                    <div className="bg-contrast-100 h-[1ex] w-32 rounded-md" />
                  </div>
                </div>
                {/* Counter */}
                <div>
                  <div className="flex w-full flex-wrap items-center gap-x-5 gap-y-2">
                    {/* Price */}
                    <span className="flex h-[1lh] items-center @xl:ml-auto">
                      <div className="bg-contrast-100 h-[1em] w-[3ch] rounded-md" />
                    </span>
                    {/* Counter */}
                    <div className="bg-contrast-100 h-[44px] w-[118px] rounded-lg" />
                    {/* DeleteLineItemButton */}
                    <div className="bg-contrast-100 -ml-1 h-8 w-8 rounded-full" />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </StickySidebarLayout>
  );
}

export interface CartEmptyState {
  title: string;
  subtitle: string;
  cta: {
    label: string;
    href: string;
  };
}

export function CartEmptyState({ title, subtitle, cta }: CartEmptyState) {
  return (
    <SectionLayout className="text-center">
      <h1 className="font-heading text-foreground mb-3 text-center text-3xl leading-none @xl:text-4xl">
        {title}
      </h1>
      <p className="text-contrast-500 mb-6 text-center leading-normal @3xl:text-lg">{subtitle}</p>
      <ButtonLink href={cta.href}>{cta.label}</ButtonLink>
    </SectionLayout>
  );
}
