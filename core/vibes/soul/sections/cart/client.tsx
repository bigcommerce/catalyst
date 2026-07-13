'use client';

import { SubmissionResult, useForm } from '@conform-to/react';
import { clsx } from 'clsx';
import debounce from 'lodash.debounce';
import { ArrowRight, GiftIcon, Minus, Plus, Trash2 } from 'lucide-react';
import {
  ComponentPropsWithoutRef,
  FormEvent,
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/vibes/soul/primitives/button';
import { Price, PriceLabel } from '@/vibes/soul/primitives/price-label';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';
import { toast } from '@/vibes/soul/primitives/toaster';
import {
  GiftCertificateCodeForm,
  GiftCertificateCodeFormState,
} from '@/vibes/soul/sections/cart/gift-certificate-code-form';
import { StickySidebarLayout } from '@/vibes/soul/sections/sticky-sidebar-layout';
import { useEvents } from '~/components/analytics/events';
import { Image } from '~/components/image';

import { CouponCodeForm, CouponCodeFormState } from './coupon-code-form';
import { ShippingForm, ShippingFormState } from './shipping-form';

import { CartEmptyState } from '.';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

interface CartLineIteminventoryMessages {
  outOfStockMessage?: string;
  quantityReadyToShipMessage?: string;
  quantityBackorderedMessage?: string;
  quantityOutOfStockMessage?: string;
  backorderMessage?: string;
}

export interface CartLineItem {
  typename: string;
  id: string;
  title: string;
  image?: { alt: string; src: string };
  subtitle: string;
  quantity: number;
  price: Price;
  href?: string;
  inventoryMessages?: CartLineIteminventoryMessages;
}

export interface CartGiftCertificateLineItem extends CartLineItem {
  sender: {
    name: string;
    email: string;
  };
  recipient: {
    name: string;
    email: string;
  };
  message?: string;
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
  totalSubtitle?: string;
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

interface GiftCertificate {
  action: Action<GiftCertificateCodeFormState, FormData>;
  giftCertificateCodes?: string[];
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
  checkoutAction: Action<SubmissionResult | null, FormData> | string;
  checkoutLabel?: string;
  deleteLineItemLabel?: string;
  decrementLineItemLabel?: string;
  incrementLineItemLabel?: string;
  cart: Cart<LineItem>;
  couponCode?: CouponCode;
  giftCertificate?: GiftCertificate;
  shipping?: Shipping;
  lineItemActionPendingLabel?: string;
}

const defaultEmptyState = {
  title: 'Your cart is empty',
  subtitle: 'Add some products to get started.',
  cta: { label: 'Continue shopping', href: '#' },
};

type PendingLineItemIntent = { intent: 'update'; quantity: number } | { intent: 'delete' };

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
  giftCertificate,
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

  // Server actions run strictly serially, so rapid clicks coalesce into pending intents
  // (one per line item, newer clicks overwrite) flushed at most one action at a time.
  // Instance-level on purpose: if a consumer remounts this section mid-flight (e.g. by
  // keying it on cart version), intents die with the instance and the UI snaps back to
  // server truth, instead of a longer-lived dispatcher deadlocking on an action React
  // silently dropped at unmount.
  const [pendingLineItemIntents] = useState(() => new Map<string, PendingLineItemIntent>());
  const inFlightIntentRef = useRef<{ id: string; entry: PendingLineItemIntent } | null>(null);

  // Bumped whenever pendingLineItemIntents changes so renders re-read the mutable map.
  const [, setPendingIntentsRevision] = useState(0);

  const isCartMutationPending = isLineItemActionPending || pendingLineItemIntents.size > 0;

  useEffect(() => {
    if (form.errors) {
      form.errors.forEach((error) => {
        toast.error(error);
      });
    }
  }, [form.errors]);

  const flushNextIntent = () => {
    if (inFlightIntentRef.current !== null) return;

    // Resolve each intent against server truth once: an intent is stale if its row is
    // gone or already matches the confirmed quantity.
    const resolved = Array.from(pendingLineItemIntents.entries()).map(([intentId, intentEntry]) => {
      const item = cart.lineItems.find((lineItem) => lineItem.id === intentId);

      return {
        id: intentId,
        entry: intentEntry,
        item,
        isStale:
          !item || (intentEntry.intent === 'update' && intentEntry.quantity === item.quantity),
      };
    });

    const staleEntries = resolved.filter(({ isStale }) => isStale);

    if (staleEntries.length > 0) {
      staleEntries.forEach(({ id: staleId }) => pendingLineItemIntents.delete(staleId));
      setPendingIntentsRevision((revision) => revision + 1);
    }

    const next = resolved.find(({ isStale }) => !isStale);

    if (!next?.item) return;

    const { id, entry, item: confirmedItem } = next;

    inFlightIntentRef.current = { id, entry };

    const formData = new FormData();

    formData.append('id', id);
    formData.append('intent', entry.intent);

    if (entry.intent === 'update') {
      formData.append('quantity', entry.quantity.toString());
    }

    // Analytics fire once per flush with the net change, not once per click.
    const analyticsFormData = new FormData();

    analyticsFormData.append('id', id);
    analyticsFormData.append('intent', entry.intent);

    if (entry.intent === 'update') {
      const netChange = entry.quantity - confirmedItem.quantity;

      analyticsFormData.append('quantity', Math.abs(netChange).toString());

      if (netChange > 0) events.onAddToCart?.(analyticsFormData);
      if (netChange < 0) events.onRemoveFromCart?.(analyticsFormData);
    } else {
      analyticsFormData.append('quantity', confirmedItem.quantity.toString());
      events.onRemoveFromCart?.(analyticsFormData);
    }

    startTransition(() => {
      formAction(formData);
    });
  };

  const flushRef = useRef(flushNextIntent);

  useEffect(() => {
    flushRef.current = flushNextIntent;
  });

  // Trailing debounce with no maxWait: a mid-burst flush would spend a request on a
  // quantity the user is still changing, and the final absolute value supersedes it
  // anyway. The pagehide and nav-guard flushes cover leaving before the timer fires.
  const debouncedFlush = useMemo(() => debounce(() => flushRef.current(), 400), []);

  useEffect(() => () => debouncedFlush.cancel(), [debouncedFlush]);

  const queueLineItemIntent = (id: string, entry: PendingLineItemIntent) => {
    pendingLineItemIntents.set(id, entry);
    setPendingIntentsRevision((revision) => revision + 1);
    debouncedFlush();

    // Quantity clicks coalesce inside the debounce window, but removal flushes right away.
    if (entry.intent === 'delete') {
      debouncedFlush.flush();
    }
  };

  // Settle observer: when a flush completes, clear its intent and flush any backlog
  // queued while it was in flight (flushNextIntent prunes intents the settled action
  // already confirmed). The section is keyed stably, so this instance survives the
  // revalidation and dispatching from here is safe.
  useEffect(() => {
    if (isLineItemActionPending) return;
    if (inFlightIntentRef.current === null) return;

    const { id, entry } = inFlightIntentRef.current;

    inFlightIntentRef.current = null;

    // Clear the intent we just flushed unless newer clicks replaced it mid-flight; if
    // the action failed this reverts the row to server truth (the error toast explains why).
    if (pendingLineItemIntents.get(id) === entry) {
      pendingLineItemIntents.delete(id);
      setPendingIntentsRevision((revision) => revision + 1);
    }

    if (pendingLineItemIntents.size > 0) {
      flushRef.current();
    }
  }, [isLineItemActionPending, state, pendingLineItemIntents]);

  // A full page unload can't wait on the debounce timer.
  useEffect(() => {
    const flushPendingIntents = () => debouncedFlush.flush();

    window.addEventListener('pagehide', flushPendingIntents);

    return () => window.removeEventListener('pagehide', flushPendingIntents);
  }, [debouncedFlush]);

  // Prevent page unload when a cart mutation is pending
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isCartMutationPending) {
        event.preventDefault();
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        event.returnValue = ''; // Chrome requires returnValue to be set

        return ''; // For older browsers
      }
    };

    if (isCartMutationPending) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isCartMutationPending]);

  // Prevent client-side navigation when a cart mutation is pending
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (isCartMutationPending && event.target instanceof HTMLElement) {
        const link = event.target.closest('a[href]');

        if (
          link instanceof HTMLAnchorElement &&
          link.href &&
          !link.href.startsWith('mailto:') &&
          !link.href.startsWith('tel:')
        ) {
          // eslint-disable-next-line no-alert
          const shouldNavigate = window.confirm(lineItemActionPendingLabel);

          if (shouldNavigate) {
            // Dispatch any debounced intent now, while this instance can still send it.
            debouncedFlush.flush();
          } else {
            event.preventDefault();
            event.stopPropagation();
          }
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        isCartMutationPending &&
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

          if (shouldNavigate) {
            // Dispatch any debounced intent now, while this instance can still send it.
            debouncedFlush.flush();
          } else {
            event.preventDefault();
            event.stopPropagation();
          }
        }
      }
    };

    if (isCartMutationPending) {
      document.addEventListener('click', handleClick, true);
      document.addEventListener('keydown', handleKeyDown, true);
    }

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isCartMutationPending, lineItemActionPendingLabel, debouncedFlush]);

  // Server truth (the revalidation-refreshed cart prop, not useActionState's mount-frozen
  // state) overlaid with pending intents; pendingIntentsRevision invalidates this on change.
  const displayLineItems: CartLineItem[] = cart.lineItems
    .filter((item) => pendingLineItemIntents.get(item.id)?.intent !== 'delete')
    .map((item) => {
      const pending = pendingLineItemIntents.get(item.id);

      return pending?.intent === 'update' ? { ...item, quantity: pending.quantity } : item;
    });

  const displayTotalQuantity = displayLineItems.reduce((total, item) => total + item.quantity, 0);

  if (displayTotalQuantity === 0) {
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
                  {isCartMutationPending ? (
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
            {giftCertificate && (
              <GiftCertificateCodeForm
                action={giftCertificate.action}
                ctaLabel={giftCertificate.ctaLabel}
                disabled={giftCertificate.disabled}
                giftCertificateCodes={giftCertificate.giftCertificateCodes}
                label={giftCertificate.label}
                placeholder={giftCertificate.placeholder}
                removeLabel={giftCertificate.removeLabel}
              />
            )}
            <div className="border-t border-[var(--cart-border,hsl(var(--contrast-100)))] py-6">
              <div className="flex justify-between text-xl font-bold">
                <dt>{cart.totalLabel ?? 'Total'}</dt>
                {isCartMutationPending ? (
                  <Skeleton.Text characterCount={8} className="animate-pulse rounded-md" />
                ) : (
                  <dd>{cart.total}</dd>
                )}
              </div>
              {cart.totalSubtitle != null && (
                <div className="mt-1 flex justify-end text-sm font-normal opacity-70">
                  {cart.totalSubtitle}
                </div>
              )}
            </div>
          </dl>
          <CheckoutButton
            action={checkoutAction}
            className="mt-4 w-full"
            isCartUpdatePending={isCartMutationPending}
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
            {displayTotalQuantity}
          </span>
        </h1>
        {/* Cart Items */}
        <ul className="flex flex-col gap-5">
          {displayLineItems.map((lineItem) => (
            <li
              className="flex flex-col items-start gap-x-5 gap-y-4 @container @sm:flex-row"
              key={lineItem.id}
            >
              <div className="relative aspect-square w-full max-w-24 overflow-hidden rounded-xl bg-[var(--cart-image-background,hsl(var(--contrast-100)))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))] focus-visible:ring-offset-4">
                {lineItem.typename === 'CartGiftCertificate' ? (
                  <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
                    <GiftIcon className="h-full w-full text-[var(--cart-icon,hsl(var(--contrast-300)))]" />
                  </div>
                ) : (
                  lineItem.image != null && (
                    <Image
                      alt={lineItem.image.alt}
                      className="object-cover"
                      fill
                      sizes="(min-width: 28rem) 9rem, (min-width: 24rem) 6rem, 100vw"
                      src={lineItem.image.src}
                    />
                  )
                )}
              </div>
              <div className="flex grow flex-col flex-wrap justify-between gap-y-2 @xl:flex-row">
                <div className="flex w-full flex-1 flex-col @xl:w-1/2 @xl:pr-4">
                  <span className="font-medium">{lineItem.title}</span>
                  <span className="text-[var(--cart-subtext-text,hsl(var(--contrast-400)))] contrast-more:text-[var(--cart-subtitle-text,hsl(var(--contrast-500)))]">
                    {lineItem.subtitle}
                  </span>
                </div>
                <CounterForm
                  action={formAction}
                  decrementLabel={decrementLineItemLabel}
                  deleteLabel={deleteLineItemLabel}
                  incrementLabel={incrementLineItemLabel}
                  lineItem={lineItem}
                  onDelete={() => queueLineItemIntent(lineItem.id, { intent: 'delete' })}
                  onUpdateQuantity={(quantity) =>
                    queueLineItemIntent(lineItem.id, { intent: 'update', quantity })
                  }
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
  onDelete,
  onUpdateQuantity,
  incrementLabel = 'Increase count',
  decrementLabel = 'Decrease count',
  deleteLabel = 'Remove item',
}: {
  lineItem: CartLineItem;
  incrementLabel?: string;
  decrementLabel?: string;
  deleteLabel?: string;
  action: (payload: FormData) => void;
  onDelete: () => void;
  onUpdateQuantity: (quantity: number) => void;
}) {
  // Every control is its own micro-form (`display: contents`, so layout is unaffected)
  // rather than one form per line item, because the quantity buttons each need their own
  // hidden `quantity` field and forms can't nest. Without JS, each posts its pre-computed
  // absolute quantity (or delete) straight to the server action. With JS, onSubmit
  // intercepts and routes through the coalescing dispatcher instead, so rapid clicks
  // debounce into one request rather than one per click.
  const handleDeleteSubmit = (event: FormEvent) => {
    event.preventDefault();
    onDelete();
  };

  const handleUpdateQuantitySubmit = (quantity: number) => (event: FormEvent) => {
    event.preventDefault();
    onUpdateQuantity(quantity);
  };

  if (lineItem.typename === 'CartGiftCertificate') {
    return (
      <form action={action} onSubmit={handleDeleteSubmit}>
        <input name="id" type="hidden" value={lineItem.id} />
        <input name="intent" type="hidden" value="delete" />
        <div className="flex w-full flex-wrap items-center gap-x-5 gap-y-2">
          {typeof lineItem.price === 'string' && (
            <span className="font-medium @xl:ml-auto">{lineItem.price}</span>
          )}

          <span className="flex flex-1 select-none justify-center px-14 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))]">
            {lineItem.quantity}
          </span>

          <button
            aria-label={deleteLabel}
            className="group -ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300 hover:bg-[var(--cart-button-background,hsl(var(--contrast-100)))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))] focus-visible:ring-offset-4"
            type="submit"
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

  return (
    <div className="flex w-full flex-wrap items-center gap-x-5 gap-y-2">
      <PriceLabel className="mt-3 self-start @xl:ml-auto" price={lineItem.price} />
      <div className="flex size-min flex-col gap-y-0">
        <div className="mb-1 mt-1 flex items-center gap-x-5">
          {/* Counter */}
          <div
            className={clsx(
              'flex items-center rounded-lg border border-[var(--cart-counter-border,hsl(var(--contrast-100)))]',
              (lineItem.inventoryMessages?.outOfStockMessage != null ||
                lineItem.inventoryMessages?.quantityOutOfStockMessage != null) &&
                'border-red-500',
            )}
          >
            <form
              action={action}
              className="contents"
              onSubmit={handleUpdateQuantitySubmit(lineItem.quantity - 1)}
            >
              <input name="id" type="hidden" value={lineItem.id} />
              <input name="intent" type="hidden" value="update" />
              <input name="quantity" type="hidden" value={lineItem.quantity - 1} />
              <button
                aria-label={decrementLabel}
                className={clsx(
                  'group rounded-l-lg bg-[var(--cart-counter-background,hsl(var(--background)))] p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))] disabled:cursor-not-allowed',
                  lineItem.quantity === 1
                    ? 'opacity-50'
                    : 'hover:bg-[var(--cart-counter-background-hover,hsl(var(--contrast-100)/50%))]',
                )}
                disabled={lineItem.quantity === 1}
                type="submit"
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
            </form>
            <span className="flex w-8 select-none justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))]">
              {lineItem.quantity}
            </span>
            <form
              action={action}
              className="contents"
              onSubmit={handleUpdateQuantitySubmit(lineItem.quantity + 1)}
            >
              <input name="id" type="hidden" value={lineItem.id} />
              <input name="intent" type="hidden" value="update" />
              <input name="quantity" type="hidden" value={lineItem.quantity + 1} />
              <button
                aria-label={incrementLabel}
                className={clsx(
                  'group rounded-r-lg bg-[var(--cart-counter-background,hsl(var(--background)))] p-3 transition-colors duration-300 hover:bg-[var(--cart-counter-background-hover,hsl(var(--contrast-100)/50%))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))] disabled:cursor-not-allowed',
                )}
                type="submit"
              >
                <Plus
                  className="text-[var(--cart-counter-icon,hsl(var(--contrast-300)))] transition-colors duration-300 group-hover:text-[var(--cart-counter-icon-hover,hsl(var(--foreground)))]"
                  size={18}
                  strokeWidth={1.5}
                />
              </button>
            </form>
          </div>
          <form action={action} className="contents" onSubmit={handleDeleteSubmit}>
            <input name="id" type="hidden" value={lineItem.id} />
            <input name="intent" type="hidden" value="delete" />
            <button
              aria-label={deleteLabel}
              className="group -ml-1 mt-1.5 flex h-8 w-8 shrink-0 items-center justify-center self-start rounded-full transition-colors duration-300 hover:bg-[var(--cart-button-background,hsl(var(--contrast-100)))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))] focus-visible:ring-offset-4"
              type="submit"
            >
              <Trash2
                className="text-[var(--cart-icon,hsl(var(--contrast-300)))] group-hover:text-[var(--cart-icon-hover,hsl(var(--foreground)))]"
                size={20}
                strokeWidth={1}
              />
            </button>
          </form>
        </div>
        {lineItem.inventoryMessages?.outOfStockMessage != null && (
          <span className="text-xs/5 font-light text-red-500">
            {lineItem.inventoryMessages.outOfStockMessage}
          </span>
        )}
        {lineItem.inventoryMessages?.quantityOutOfStockMessage != null && (
          <span className="mb-3 text-xs/5 font-light text-red-500">
            {lineItem.inventoryMessages.quantityOutOfStockMessage}
          </span>
        )}
        {lineItem.inventoryMessages?.quantityReadyToShipMessage != null && (
          <span className="text-xs/5 font-light">
            {lineItem.inventoryMessages.quantityReadyToShipMessage}
          </span>
        )}
        {lineItem.inventoryMessages?.quantityBackorderedMessage != null && (
          <span className="text-xs/5 font-light">
            {lineItem.inventoryMessages.quantityBackorderedMessage}
          </span>
        )}
        {lineItem.inventoryMessages?.backorderMessage != null && (
          <span className="text-xs/5 font-light">
            {lineItem.inventoryMessages.backorderMessage}
          </span>
        )}
      </div>
    </div>
  );
}

function CheckoutButton({
  action,
  isCartUpdatePending,
  ...props
}: {
  action: Action<SubmissionResult | null, FormData> | string;
  isCartUpdatePending: boolean;
} & ComponentPropsWithoutRef<typeof Button>) {
  const [lastResult, formAction] = useActionState(
    async (state: SubmissionResult | null, formData: FormData) => {
      if (typeof action === 'string') {
        window.location.assign(action);

        // The page normally unloads before this settles. If the navigation is
        // cancelled instead (Esc, "Stay" on the beforeunload prompt, a stalled
        // redirect) or the page is restored from bfcache, settle so the button
        // re-enables as a retry, rather than spinning forever with subsequent
        // clicks queued behind a never-resolving action.
        await new Promise<void>((resolve) => {
          let fallbackTimer: ReturnType<typeof setTimeout>;

          const settle = () => {
            clearTimeout(fallbackTimer);
            window.removeEventListener('pageshow', settle);
            resolve();
          };

          fallbackTimer = setTimeout(settle, 8000);
          window.addEventListener('pageshow', settle);
        });

        return null;
      }

      return action(state, formData);
    },
    null,
  );

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
