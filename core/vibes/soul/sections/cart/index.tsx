'use client';

import { getFormProps, getInputProps, SubmissionResult, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { clsx } from 'clsx';
import { ArrowRight, Minus, Plus, Trash2 } from 'lucide-react';
import { startTransition, Suspense, use, useActionState, useEffect, useOptimistic } from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/vibes/soul/primitives/button';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { StickySidebarLayout } from '@/vibes/soul/sections/sticky-sidebar-layout';
import { Image } from '~/components/image';

import { cartLineItemActionFormDataSchema } from './schema';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

export interface CartLineItem {
  id: string;
  image: { alt: string; src: string };
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

interface CartState<LineItem extends CartLineItem> {
  lineItems: LineItem[];
  lastResult: SubmissionResult | null;
}

interface CartProps<LineItem extends CartLineItem> {
  title?: string;
  lineItems: LineItem[] | Promise<LineItem[]>;
  summary: CartSummary;
  emptyState: CartEmptyState;
  lineItemAction: Action<CartState<LineItem>, FormData>;
  checkoutAction: Action<SubmissionResult | null, FormData>;
  deleteLineItemLabel?: string;
  decrementLineItemLabel?: string;
  incrementLineItemLabel?: string;
}

export function Cart<LineItem extends CartLineItem>({
  title = 'Cart',
  lineItems,
  lineItemAction,
  checkoutAction,
  summary,
  emptyState,
  deleteLineItemLabel,
  decrementLineItemLabel,
  incrementLineItemLabel,
}: CartProps<LineItem>) {
  return (
    <Suspense fallback={<CartSkeleton title={title} />}>
      <CartInner
        checkoutAction={checkoutAction}
        decrementLineItemLabel={decrementLineItemLabel}
        deleteLineItemLabel={deleteLineItemLabel}
        emptyState={emptyState}
        incrementLineItemLabel={incrementLineItemLabel}
        lineItemAction={lineItemAction}
        lineItems={lineItems}
        summary={summary}
        title={title}
      />
    </Suspense>
  );
}

function CartInner<LineItem extends CartLineItem>({
  title,
  lineItems,
  summary = {
    title: 'Summary',
    subtotalLabel: 'Subtotal',
    subtotal: '$0.00',
    shippingLabel: 'Shipping',
    shipping: '$0.00',
    taxLabel: 'Tax',
    tax: '$0.00',
    grandTotalLabel: 'Grand Total',
    grandTotal: '$0.00',
  },
  emptyState,
  decrementLineItemLabel,
  incrementLineItemLabel,
  deleteLineItemLabel,
  lineItemAction,
  checkoutAction,
}: CartProps<LineItem>) {
  const resolvedLineItems = lineItems instanceof Promise ? use(lineItems) : lineItems;

  const [state, formAction] = useActionState(lineItemAction, {
    lineItems: resolvedLineItems,
    lastResult: null,
  });

  const [optimisticLineItems, setOptimisticLineItems] = useOptimistic<CartLineItem[], FormData>(
    state.lineItems,
    (prevState, formData) => {
      const submission = parseWithZod(formData, { schema: cartLineItemActionFormDataSchema });

      if (submission.status !== 'success') return prevState;

      switch (submission.value.intent) {
        case 'increment': {
          const { id } = submission.value;

          return prevState.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
          );
        }

        case 'decrement': {
          const { id } = submission.value;

          return prevState.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
          );
        }

        case 'delete': {
          const { id } = submission.value;

          return prevState.filter((item) => item.id !== id);
        }

        default:
          return prevState;
      }
    },
  );

  const optimisticQuantity = optimisticLineItems.reduce((total, item) => total + item.quantity, 0);

  if (optimisticLineItems.length === 0) {
    return <CartEmptyState {...emptyState} />;
  }

  return (
    <StickySidebarLayout
      sidebar={
        <>
          <h2 className="mb-10 font-heading text-4xl font-medium leading-none @xl:text-5xl">
            {summary.title}
          </h2>
          <table aria-label="Receipt Summary" className="w-full">
            <caption className="sr-only">{summary.caption}</caption>
            <tbody>
              <tr className="border-b border-contrast-100">
                <td>{summary.subtotalLabel}</td>
                <td className="py-4 text-right">{summary.subtotal}</td>
              </tr>
              {summary.shipping != null && summary.shipping !== '' && (
                <tr className="border-b border-contrast-100">
                  <td>{summary.shippingLabel}</td>
                  <td className="py-4 text-right">{summary.shipping}</td>
                </tr>
              )}
              {summary.tax != null && summary.tax !== '' && (
                <tr>
                  <td>{summary.taxLabel}</td>
                  <td className="py-4 text-right">{summary.tax}</td>
                </tr>
              )}
            </tbody>

            {summary.grandTotal != null && summary.grandTotal !== '' && (
              <tfoot>
                <tr className="text-xl">
                  <th className="text-left" scope="row">
                    {summary.grandTotalLabel}
                  </th>
                  <td className="py-10 text-right">{summary.grandTotal}</td>
                </tr>
              </tfoot>
            )}
          </table>
          <CheckoutButton action={checkoutAction} className="mt-10 w-full">
            {summary.ctaLabel}
            <ArrowRight size={20} strokeWidth={1} />
          </CheckoutButton>
        </>
      }
      sidebarPosition="after"
      sidebarSize="1/3"
    >
      <div className="w-full">
        <h1 className="mb-10 font-heading text-4xl font-medium leading-none @xl:text-5xl">
          {title}
          <span className="ml-4 text-contrast-200">{optimisticQuantity}</span>
        </h1>

        {/* Cart Items */}
        <ul className="flex flex-col gap-5 @container">
          {optimisticLineItems.map((lineItem) => (
            <li
              className="flex flex-col items-start gap-x-5 gap-y-6 @container @sm:flex-row @sm:gap-y-4"
              key={lineItem.id}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-contrast-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 @sm:max-w-24 @md:max-w-36">
                <Image
                  alt={lineItem.image.alt}
                  className="object-cover"
                  fill
                  sizes="(min-width: 28rem) 9rem, (min-width: 24rem) 6rem, 100vw"
                  src={lineItem.image.src}
                />
              </div>
              <div className="flex flex-grow flex-col flex-wrap justify-between gap-y-2 @xl:flex-row">
                <div className="flex w-full flex-1 flex-col @xl:w-1/2 @xl:pr-4">
                  <span className="font-medium">{lineItem.title}</span>
                  <span className="text-contrast-300">{lineItem.subtitle}</span>
                </div>
                <CounterForm
                  action={formAction}
                  decrementLabel={decrementLineItemLabel}
                  deleteLabel={deleteLineItemLabel}
                  incrementLabel={incrementLineItemLabel}
                  lineItem={lineItem}
                  onSubmit={(formData) => {
                    startTransition(() => {
                      formAction(formData);
                      setOptimisticLineItems(formData);
                    });
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </StickySidebarLayout>
  );
}

function CounterForm({
  lineItem,
  action,
  onSubmit,
  incrementLabel = 'Increase count',
  decrementLabel = 'Decrease count',
  deleteLabel = 'Remove item',
}: {
  lineItem: CartLineItem;
  incrementLabel?: string;
  decrementLabel?: string;
  deleteLabel?: string;
  action: (payload: FormData) => void;
  onSubmit: (formData: FormData) => void;
}) {
  const [form, fields] = useForm({
    defaultValue: { id: lineItem.id },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: cartLineItemActionFormDataSchema });
    },
    onSubmit(event, { formData }) {
      event.preventDefault();

      onSubmit(formData);
    },
  });

  return (
    <form {...getFormProps(form)} action={action}>
      <input {...getInputProps(fields.id, { type: 'hidden' })} key={fields.id.id} />
      <div className="flex w-full flex-wrap items-center justify-between gap-x-5 gap-y-2 @sm:justify-start @xl:w-1/2 @xl:flex-nowrap">
        <span className="font-medium @xl:ml-auto">{lineItem.price}</span>

        {/* Counter */}
        <div className="flex items-center rounded-lg border">
          <button
            aria-label={decrementLabel}
            className={clsx(
              'group rounded-l-lg p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              lineItem.quantity === 1 ? 'opacity-50' : 'hover:bg-contrast-100/50',
            )}
            disabled={lineItem.quantity === 1}
            name="intent"
            type="submit"
            value="decrement"
          >
            <Minus
              className={clsx(
                'text-contrast-300 transition-colors duration-300',
                lineItem.quantity !== 1 && 'group-hover:text-foreground',
              )}
              size={18}
              strokeWidth={1.5}
            />
          </button>
          <span className="flex w-8 select-none justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            {lineItem.quantity}
          </span>
          <button
            aria-label={incrementLabel}
            className={clsx(
              'group rounded-r-lg p-3 transition-colors duration-300 hover:bg-contrast-100/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            )}
            name="intent"
            type="submit"
            value="increment"
          >
            <Plus
              className="text-contrast-300 transition-colors duration-300 group-hover:text-foreground"
              size={18}
              strokeWidth={1.5}
            />
          </button>
        </div>

        <button
          aria-label={deleteLabel}
          className="-ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300 hover:bg-contrast-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
          name="intent"
          type="submit"
          value="delete"
        >
          <Trash2 size={20} strokeWidth={1} />
        </button>
      </div>
    </form>
  );
}

function CheckoutButton({
  action,
  ...rest
}: { action: Action<SubmissionResult | null, FormData> } & React.ComponentPropsWithoutRef<
  typeof Button
>) {
  const [lastResult, formAction] = useActionState(action, null);

  useEffect(() => {
    if (lastResult?.error) {
      console.log(lastResult.error);
    }
  }, [lastResult?.error]);

  return (
    <form action={formAction}>
      <SubmitButton {...rest} />
    </form>
  );
}

function SubmitButton(props: React.ComponentPropsWithoutRef<typeof Button>) {
  const { pending } = useFormStatus();

  return <Button {...props} disabled={pending} loading={pending} type="submit" />;
}

export function CartEmptyState({ title, subtitle, cta }: CartEmptyState) {
  return (
    <div className="@container">
      <div className="px-4 py-10 text-center @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20">
        <h1 className="mb-3 text-center font-heading text-2xl leading-none text-foreground @lg:text-4xl @3xl:text-5xl">
          {title}
        </h1>
        <p className="mb-10 text-center leading-normal text-contrast-500 @3xl:text-lg">
          {subtitle}
        </p>
        <ButtonLink href={cta.href}>{cta.label}</ButtonLink>
      </div>
    </div>
  );
}

export function CartSkeleton({ title = 'Cart' }: { title?: string }) {
  return (
    <StickySidebarLayout
      className="animate-pulse"
      sidebar={
        <>
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
        </>
      }
      sidebarPosition="after"
      sidebarSize="1/3"
    >
      <div className="w-full">
        <h1 className="mb-10 font-heading text-4xl font-medium leading-none @xl:text-5xl">
          {title}
        </h1>

        {/* Cart Line Items */}
        <ul className="flex flex-col gap-5">
          {Array.from({ length: 2 }).map((_, index) => (
            <li
              className="flex flex-col items-start gap-x-5 gap-y-6 @container @sm:flex-row @sm:gap-y-4"
              key={index}
            >
              {/* Image */}
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-contrast-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 @sm:max-w-24 @md:max-w-36" />
              <div className="flex flex-grow flex-col flex-wrap justify-between gap-y-4 @xl:flex-row">
                <div className="flex w-full flex-1 flex-col @xl:w-1/2 @xl:pr-4">
                  {/* Line Item Title */}
                  <div className="mb-3 h-4 w-44 rounded-md bg-contrast-100" />
                  {/* Subtitle */}
                  <div className="h-3 w-36 rounded-md bg-contrast-100" />
                </div>
                <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 @sm:justify-start @xl:w-1/2 @xl:flex-nowrap @xl:justify-end">
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
    </StickySidebarLayout>
  );
}
