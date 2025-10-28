'use client';

import { getFormProps, getInputProps, SubmissionResult, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { clsx } from 'clsx';
import { ArrowRight, Minus, Plus, Trash2 } from 'lucide-react';
import {
  ComponentPropsWithoutRef,
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useOptimistic,
} from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/vibes/soul/primitives/button';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';
import { toast } from '@/vibes/soul/primitives/toaster';
import { StickySidebarLayout } from '@/vibes/soul/sections/sticky-sidebar-layout';
import { useEvents } from '~/components/analytics/events';
import { Image } from '~/components/image';

import { CouponCodeForm, CouponCodeFormState } from './coupon-code-form';
import { cartLineItemActionFormDataSchema } from './schema';
import { ShippingForm, ShippingFormState } from './shipping-form';

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

interface ShippingOption {
  label: string;
  value: string;
  price: string;
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

interface Address {
  country: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

interface Shipping {
  action: Action<ShippingFormState, FormData>;
  countries?: Country[];
  states?: States[];
  address?: Address;
  shippingOptions?: ShippingOption[];
  shippingOption?: ShippingOption;
  shippingLabel?: string;
  addLabel?: string;
  changeLabel?: string;
  countryLabel?: string;
  cityLabel?: string;
  stateLabel?: string;
  postalCodeLabel?: string;
  updateShippingOptionsLabel?: string;
  viewShippingOptionsLabel?: string;
  cancelLabel?: string;
  editAddressLabel?: string;
  shippingOptionsLabel?: string;
  updateShippingLabel?: string;
  addShippingLabel?: string;
  showShippingForm?: boolean;
  noShippingOptionsLabel?: string;
}

export interface CartProps<LineItem extends CartLineItem> {
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
  shipping?: Shipping;
  lineItemActionPendingLabel?: string;
}

const defaultEmptyState = {
  title: 'Your cart is empty',
  subtitle: 'Add some products to get started.',
  cta: { label: 'Continue shopping', href: '#' },
};

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --cart-focus: hsl(var(--primary));
 *   --cart-font-family: var(--font-family-body);
 *   --cart-title-font-family: var(--font-family-heading);
 *   --cart-text: hsl(var(--foreground));
 *   --cart-subtitle-text: hsl(var(--contrast-500));
 *   --cart-subtext-text: hsl(var(--contrast-300));
 *   --cart-icon: hsl(var(--contrast-300));
 *   --cart-icon-hover: hsl(var(--foreground));
 *   --cart-border: hsl(var(--contrast-100));
 *   --cart-image-background: hsl(var(--contrast-100));
 *   --cart-button-background: hsl(var(--contrast-100));
 *   --cart-counter-icon: hsl(var(--contrast-300));
 *   --cart-counter-icon-hover: hsl(var(--foreground));
 *   --cart-counter-background: hsl(var(--background));
 *   --cart-counter-background-hover: hsl(var(--contast-100) / 50%);
 * }
 * ```
 */
export function CartClient<LineItem extends CartLineItem>({
  title,
  cart,
  couponCode,
  decrementLineItemLabel,
  incrementLineItemLabel,
  deleteLineItemLabel,
  lineItemAction,
  lineItemActionPendingLabel = 'You have a cart update in progress. Are you sure you want to leave this page? Your changes may be lost.',
  checkoutAction,
  checkoutLabel = 'Checkout',
  emptyState = defaultEmptyState,
  summaryTitle,
  shipping,
}: CartProps<LineItem>) {
  const events = useEvents();
  const [state, formAction, isLineItemActionPending] = useActionState(lineItemAction, {
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

  // Prevent page unload when line item action is pending
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isLineItemActionPending) {
        event.preventDefault();
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        event.returnValue = ''; // Chrome requires returnValue to be set

        return ''; // For older browsers
      }
    };

    if (isLineItemActionPending) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isLineItemActionPending]);

  // Prevent client-side navigation when line item action is pending
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (isLineItemActionPending && event.target instanceof HTMLElement) {
        const link = event.target.closest('a[href]');

        if (
          link instanceof HTMLAnchorElement &&
          link.href &&
          !link.href.startsWith('mailto:') &&
          !link.href.startsWith('tel:')
        ) {
          // eslint-disable-next-line no-alert
          const shouldNavigate = window.confirm(lineItemActionPendingLabel);

          if (!shouldNavigate) {
            event.preventDefault();
            event.stopPropagation();
          }
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        isLineItemActionPending &&
        (event.key === 'Enter' || event.key === ' ') &&
        event.target instanceof HTMLElement
      ) {
        const link = event.target.closest('a[href]');

        if (
          link instanceof HTMLAnchorElement &&
          link.href &&
          !link.href.startsWith('mailto:') &&
          !link.href.startsWith('tel:')
        ) {
          // eslint-disable-next-line no-alert
          const shouldNavigate = window.confirm(lineItemActionPendingLabel);

          if (!shouldNavigate) {
            event.preventDefault();
            event.stopPropagation();
          }
        }
      }
    };

    if (isLineItemActionPending) {
      document.addEventListener('click', handleClick, true);
      document.addEventListener('keydown', handleKeyDown, true);
    }

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isLineItemActionPending, lineItemActionPendingLabel]);

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

  const optimisticQuantity = useMemo(
    () => optimisticLineItems.reduce((total, item) => total + item.quantity, 0),
    [optimisticLineItems],
  );

  if (optimisticQuantity === 0) {
    return <CartEmptyState {...emptyState} />;
  }

  return (
    <StickySidebarLayout
      className="font-[family-name:var(--cart-font-family,var(--font-family-body))] text-[var(--cart-text,hsl(var(--foreground)))]"
      sidebar={
        <div>
          <h2 className="mb-10 font-[family-name:var(--cart-title-font-family,var(--font-family-heading))] text-4xl font-medium leading-none @xl:text-5xl">
            {summaryTitle}
          </h2>
          <dl aria-label="Receipt Summary" className="w-full">
            <div className="divide-y divide-[var(--cart-border,hsl(var(--contrast-100)))]">
              {cart.summaryItems.map((summaryItem, index) => (
                <div className="flex justify-between py-4" key={index}>
                  <dt>{summaryItem.label}</dt>
                  {isLineItemActionPending ? (
                    <Skeleton.Text characterCount={8} className="animate-pulse rounded-md" />
                  ) : (
                    <dd>{summaryItem.value}</dd>
                  )}
                </div>
              ))}

              {shipping && <ShippingForm {...shipping} />}
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
            <div className="flex justify-between border-t border-[var(--cart-border,hsl(var(--contrast-100)))] py-6 text-xl font-bold">
              <dt>{cart.totalLabel ?? 'Total'}</dt>
              {isLineItemActionPending ? (
                <Skeleton.Text characterCount={8} className="animate-pulse rounded-md" />
              ) : (
                <dd>{cart.total}</dd>
              )}
            </div>
          </dl>
          <CheckoutButton
            action={checkoutAction}
            className="mt-4 w-full"
            isCartUpdatePending={isLineItemActionPending}
          >
            {checkoutLabel}
            <ArrowRight size={20} strokeWidth={1} />
          </CheckoutButton>
        </div>
      }
      sidebarPosition="after"
      sidebarSize="1/3"
    >
      <div className="w-full">
        <h1 className="mb-10 font-[family-name:var(--cart-title-font-family,var(--font-family-heading))] text-4xl font-medium leading-none @xl:text-5xl">
          {title}
          <span className="ml-4 text-[var(--cart-subtext-text,hsl(var(--contrast-300)))] contrast-more:text-[var(--cart-subtitle-text,hsl(var(--contrast-500)))]">
            {optimisticQuantity}
          </span>
        </h1>
        {/* Cart Items */}
        <ul className="flex flex-col gap-5">
          {optimisticLineItems.map((lineItem) => (
            <li
              className="flex flex-col items-start gap-x-5 gap-y-4 @container @sm:flex-row"
              key={lineItem.id}
            >
              <div className="relative aspect-square w-full max-w-24 overflow-hidden rounded-xl bg-[var(--cart-image-background,hsl(var(--contrast-100)))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))] focus-visible:ring-offset-4">
                <Image
                  alt={lineItem.image.alt}
                  className="object-cover"
                  fill
                  sizes="(min-width: 28rem) 9rem, (min-width: 24rem) 6rem, 100vw"
                  src={lineItem.image.src}
                />
              </div>
              <div className="flex grow flex-col flex-wrap justify-between gap-y-2 @xl:flex-row">
                <div className="flex w-full flex-1 flex-col @xl:w-1/2 @xl:pr-4">
                  <span className="font-medium">{lineItem.title}</span>
                  <span className="text-[var(--cart-subtext-text,hsl(var(--contrast-300)))] contrast-more:text-[var(--cart-subtitle-text,hsl(var(--contrast-500)))]">
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

                      const intent = formData.get('intent');

                      if (intent === 'increment') {
                        formData.set('quantity', '1');

                        events.onAddToCart?.(formData);
                      }

                      if (intent === 'decrement') {
                        formData.set('quantity', '1');

                        events.onRemoveFromCart?.(formData);
                      }

                      if (intent === 'delete') {
                        formData.set('quantity', lineItem.quantity.toString());

                        events.onRemoveFromCart?.(formData);
                      }
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
      <div className="flex w-full flex-wrap items-center gap-x-5 gap-y-2">
        <span className="font-medium @xl:ml-auto">{lineItem.price}</span>

        {/* Counter */}
        <div className="flex items-center rounded-lg border border-[var(--cart-counter-border,hsl(var(--contrast-100)))]">
          <button
            aria-label={decrementLabel}
            className={clsx(
              'group rounded-l-lg bg-[var(--cart-counter-background,hsl(var(--background)))] p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))] disabled:cursor-not-allowed',
              lineItem.quantity === 1
                ? 'opacity-50'
                : 'hover:bg-[var(--cart-counter-background-hover,hsl(var(--contrast-100)/50%))]',
            )}
            disabled={lineItem.quantity === 1}
            name="intent"
            type="submit"
            value="decrement"
          >
            <Minus
              className={clsx(
                'text-[var(--cart-counter-icon,hsl(var(--contrast-300)))] transition-colors duration-300',
                lineItem.quantity !== 1 &&
                  'group-hover:text-[var(--cart-counter-icon-hover,hsl(var(--foreground)))]',
              )}
              size={18}
              strokeWidth={1.5}
            />
          </button>
          <span className="flex w-8 select-none justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))]">
            {lineItem.quantity}
          </span>
          <button
            aria-label={incrementLabel}
            className={clsx(
              'group rounded-r-lg bg-[var(--cart-counter-background,hsl(var(--background)))] p-3 transition-colors duration-300 hover:bg-[var(--cart-counter-background-hover,hsl(var(--contrast-100)/50%))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))] disabled:cursor-not-allowed',
            )}
            name="intent"
            type="submit"
            value="increment"
          >
            <Plus
              className="text-[var(--cart-counter-icon,hsl(var(--contrast-300)))] transition-colors duration-300 group-hover:text-[var(--cart-counter-icon-hover,hsl(var(--foreground)))]"
              size={18}
              strokeWidth={1.5}
            />
          </button>
        </div>

        <button
          aria-label={deleteLabel}
          className="group -ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300 hover:bg-[var(--cart-button-background,hsl(var(--contrast-100)))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))] focus-visible:ring-offset-4"
          name="intent"
          type="submit"
          value="delete"
        >
          <Trash2
            className="text-[var(--cart-icon,hsl(var(--contrast-300)))] group-hover:text-[var(--cart-icon-hover,hsl(var(--foreground)))]"
            size={20}
            strokeWidth={1}
          />
        </button>
      </div>
    </form>
  );
}

function CheckoutButton({
  action,
  isCartUpdatePending,
  ...props
}: {
  action: Action<SubmissionResult | null, FormData>;
  isCartUpdatePending: boolean;
} & ComponentPropsWithoutRef<typeof Button>) {
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
      <SubmitButton {...props} isCartUpdatePending={isCartUpdatePending} />
    </form>
  );
}

function SubmitButton({
  isCartUpdatePending,
  ...props
}: { isCartUpdatePending: boolean } & ComponentPropsWithoutRef<typeof Button>) {
  const { pending } = useFormStatus();

  return (
    <Button
      {...props}
      disabled={pending || isCartUpdatePending}
      loading={pending || isCartUpdatePending}
      type="submit"
    />
  );
}
