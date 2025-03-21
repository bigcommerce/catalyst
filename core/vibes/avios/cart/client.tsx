'use client';

import { Button, Section, SubHeading } from '@alto-avios/alto-ui';
import { getFormProps, getInputProps, SubmissionResult, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { clsx } from 'clsx';
import { ArrowRight, Minus, Plus, Trash2 } from 'lucide-react';
import { startTransition, useActionState, useEffect, useOptimistic } from 'react';
import { useFormStatus } from 'react-dom';

import { toast } from '@/vibes/soul/primitives/toaster';
import { StickySidebarLayout } from '@/vibes/soul/sections/sticky-sidebar-layout';
import { Image } from '~/components/image';

import { CouponCodeForm, CouponCodeFormState } from './coupon-code-form';
import { cartLineItemActionFormDataSchema } from './schema';

import { CartEmptyState } from '.';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

export interface CartLineItem {
  id: string;
  image: { alt: string; src: string };
  title: string;
  subtitle: string;
  quantity: number;
  price: string;
}

export interface CartSummaryItem {
  label: string;
  value: string;
}

export interface CartState<LineItem extends CartLineItem> {
  lineItems: LineItem[];
  lastResult: SubmissionResult | null;
}

export interface Cart<LineItem extends CartLineItem> {
  lineItems: LineItem[];
  summaryItems: CartSummaryItem[];
  total: string;
  totalLabel?: string;
}

interface CouponCode {
  action: Action<CouponCodeFormState, FormData>;
  couponCodes?: string[];
  ctaLabel?: string;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  removeLabel?: string;
}

export interface Props<LineItem extends CartLineItem> {
  title?: string;
  summaryTitle?: string;
  emptyState?: CartEmptyState;
  lineItemAction: Action<CartState<LineItem>, FormData>;
  checkoutAction: Action<SubmissionResult | null, FormData>;
  checkoutLabel?: string;
  deleteLineItemLabel?: string;
  decrementLineItemLabel?: string;
  incrementLineItemLabel?: string;
  cart: Cart<LineItem>;
  couponCode?: CouponCode;
}

const defaultEmptyState = {
  title: 'Your cart is empty',
  subtitle: 'Add some products to get started.',
  cta: { label: 'Continue shopping', href: '#' },
};

export function CartClient<LineItem extends CartLineItem>({
  title,
  cart,
  couponCode,
  decrementLineItemLabel,
  incrementLineItemLabel,
  deleteLineItemLabel,
  lineItemAction,
  checkoutAction,
  checkoutLabel = 'Checkout',
  emptyState = defaultEmptyState,
  summaryTitle,
}: Props<LineItem>) {
  const [state, formAction] = useActionState(lineItemAction, {
    lineItems: cart.lineItems,
    lastResult: null,
  });

  const [form] = useForm({ lastResult: state.lastResult });

  useEffect(() => {
    if (form.errors) {
      form.errors.forEach((error) => {
        toast.error(error);
      });
    }
  }, [form.errors]);

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

  if (optimisticQuantity === 0) {
    return <CartEmptyState {...emptyState} />;
  }

  return (
    <StickySidebarLayout
      sidebar={
        <Section paddingX="2xl" paddingY="2xl">
          <div>
            <h2 className="text-4xl @xl:text-5xl mb-10 font-heading font-medium leading-none">
              {summaryTitle}
            </h2>
            <dl aria-label="Receipt Summary" className="w-full">
              <div className="divide-y divide-contrast-100">
                {cart.summaryItems.map((summaryItem, index) => (
                  <div className="flex justify-between py-4" key={index}>
                    <dt>{summaryItem.label}</dt>
                    <dd>{summaryItem.value}</dd>
                  </div>
                ))}
              </div>

              {couponCode && (
                <CouponCodeForm
                  action={couponCode.action}
                  couponCodes={couponCode.couponCodes}
                  ctaLabel={couponCode.ctaLabel}
                  disabled={couponCode.disabled}
                  label={couponCode.label}
                  placeholder={couponCode.placeholder}
                  removeLabel={couponCode.removeLabel}
                />
              )}

              <div className="border-t border-contrast-100 text-xl flex justify-between py-6 font-bold">
                <dt>{cart.totalLabel ?? 'Total'}</dt>
                <dl>{cart.total}</dl>
              </div>
            </dl>

            <CheckoutButton action={checkoutAction}>
              {checkoutLabel}
              <ArrowRight size={20} strokeWidth={1} />
            </CheckoutButton>
          </div>
        </Section>
      }
      sidebarPosition="after"
      sidebarSize="1/3"
    >
      <Section paddingLeft="sm">
        <div className="w-full">
          <SubHeading as="h1" foregroundColor="default" size="xs">
            {title}
            <span className="ml-4">{optimisticQuantity}</span>
          </SubHeading>

          {/* Cart Items */}
          <ul className="mt-5 flex flex-col gap-5">
            {optimisticLineItems.map((lineItem) => (
              <li
                className="flex flex-col items-start gap-x-5 gap-y-4 @container @sm:flex-row"
                key={lineItem.id}
              >
                <div className="bg-contrast-100 focus-visible:ring-primary relative aspect-square w-full max-w-24 overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-4">
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
                    <span className="text-contrast-300 contrast-more:text-contrast-500">
                      {lineItem.subtitle}
                    </span>
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
      </Section>
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
      <div className="flex w-full flex-wrap items-center gap-x-5 gap-y-2">
        <span className="font-medium @xl:ml-auto">{lineItem.price}</span>

        {/* Counter */}
        <div className="border flex items-center rounded-lg">
          <button
            aria-label={decrementLabel}
            className={clsx(
              'focus-visible:ring-primary group rounded-l-lg p-3 focus-visible:outline-none focus-visible:ring-2',
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
          <span className="focus-visible:ring-primary flex w-8 select-none justify-center focus-visible:outline-none focus-visible:ring-2">
            {lineItem.quantity}
          </span>
          <button
            aria-label={incrementLabel}
            className={clsx(
              'hover:bg-contrast-100/50 focus-visible:ring-primary group rounded-r-lg p-3 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2',
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
          className="rounded-full hover:bg-contrast-100 focus-visible:ring-primary -ml-1 flex h-8 w-8 shrink-0 items-center justify-center transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-4"
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

  const [form] = useForm({ lastResult });

  useEffect(() => {
    if (form.errors) {
      form.errors.forEach((error) => {
        toast.error(error);
      });
    }
  }, [form.errors]);

  return (
    <form action={formAction}>
      <SubmitButton {...rest} />
    </form>
  );
}

function SubmitButton(props: React.ComponentPropsWithoutRef<typeof Button>) {
  const { pending } = useFormStatus();

  return <Button {...props} isDisabled={pending} isLoading={pending} type="submit" />;
}
