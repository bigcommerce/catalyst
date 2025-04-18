import { Stream, Streamable } from '@/ui/lib/streamable';
import { ButtonLink } from '@/ui/primitives/button-link';
import * as Skeleton from '@/ui/primitives/skeleton';
import { SectionLayout } from '@/ui/sections/section-layout';
import { StickySidebarLayout } from '@/ui/sections/sticky-sidebar-layout';

import { CartClient, Cart as CartData, CartLineItem, CartProps } from './client';

export { type CartLineItem } from './client';

export function Cart<LineItem extends CartLineItem>({
  cart: streamableCart,
  decrementLineItemLabel: streamableDecrementLineItemLabel,
  title = 'Cart',
  summaryTitle = 'Summary',
  ...props
}: Omit<CartProps<LineItem>, 'cart'> & {
  cart: Streamable<CartData<LineItem>>;
}) {
  return (
    <Stream
      fallback={<CartSkeleton summaryTitle={summaryTitle} title={title} />}
      value={streamableCart}
    >
      {(cart) => <CartClient {...props} cart={cart} summaryTitle={summaryTitle} title={title} />}
    </Stream>
  );
}

export interface CartSkeletonProps {
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
      className="group/cart text-[var(--cart-text,hsl(var(--foreground)))]"
      sidebar={
        <div>
          <h2 className="mb-10 font-[family-name:var(--cart-title-font-family,var(--font-family-heading))] text-4xl leading-none font-medium @xl:text-5xl">
            {summaryTitle}
          </h2>
          <div className="group-has-[[data-pending]]/cart:animate-pulse">
            <div className="w-full" data-pending>
              <div className="divide-y divide-[var(--skeleton,hsl(var(--contrast-300)/15%))]">
                {Array.from({ length: summaryPlaceholderCount }).map((_, index) => (
                  <div className="py-4" key={index}>
                    <div className="flex items-center justify-between">
                      <Skeleton.Text characterCount={10} className="rounded-md" />
                      <Skeleton.Text characterCount={8} className="rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t border-[var(--skeleton,hsl(var(--contrast-300)/15%))] py-6 text-xl font-bold">
                <div className="flex items-center justify-between">
                  <Skeleton.Text characterCount={8} className="rounded-md" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton.Text characterCount={8} className="rounded-md" />
                </div>
              </div>
            </div>
          </div>
          <Skeleton.Box className="mt-4 h-[58px] w-full rounded-full" />
        </div>
      }
      sidebarPosition="after"
      sidebarSize="1/3"
    >
      <div>
        <h1 className="mb-10 font-[family-name:var(--cart-title-font-family,var(--font-family-heading))] text-4xl leading-none font-medium @xl:text-5xl">
          {title}
        </h1>
        {/* Cart Line Items */}
        <div className="group-has-[[data-pending]]/cart:animate-pulse">
          <ul className="flex flex-col gap-5" data-pending>
            {Array.from({ length: placeholderCount }).map((_, index) => (
              <li
                className="@container flex flex-col items-start gap-x-5 gap-y-4 @sm:flex-row"
                key={index}
              >
                {/* Image */}
                <Skeleton.Box className="aspect-square w-full max-w-24 rounded-xl" />
                <div className="flex grow flex-col flex-wrap justify-between gap-y-2 @xl:flex-row">
                  <div className="flex w-full flex-1 flex-col @xl:w-1/2 @xl:pr-4">
                    {/* Line Item Title */}
                    <Skeleton.Text characterCount={15} className="rounded-md" />
                    {/* Subtitle */}
                    <Skeleton.Text characterCount={10} className="rounded-md" />
                  </div>
                  {/* Counter */}
                  <div>
                    <div className="flex w-full flex-wrap items-center gap-x-5 gap-y-2">
                      {/* Price */}
                      <Skeleton.Text characterCount={5} className="rounded-md" />
                      {/* Counter */}
                      <Skeleton.Box className="h-[44px] w-[118px] rounded-lg" />
                      {/* DeleteLineItemButton */}
                      <Skeleton.Box className="-ml-1 h-8 w-8 rounded-full" />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
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
    <SectionLayout className="text-center font-[family-name:var(--cart-font-family,var(--font-family-body))]">
      <h1 className="mb-3 text-center font-[family-name:var(--cart-title-font-family,var(--font-family-heading))] text-3xl leading-none text-[var(--cart-title,hsl(var(--foreground)))] @xl:text-4xl">
        {title}
      </h1>
      <p className="leading-normaltext-[var(--cart-subtitle,hsl(var(--contrast-500)))] mb-6 text-center @3xl:text-lg">
        {subtitle}
      </p>
      <ButtonLink href={cta.href}>{cta.label}</ButtonLink>
    </SectionLayout>
  );
}
