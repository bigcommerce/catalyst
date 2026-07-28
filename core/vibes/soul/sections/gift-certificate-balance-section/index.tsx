'use client';

import { FormMetadata, getFormProps, SubmissionResult, useForm } from '@conform-to/react';
import React, { useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';

import { FormStatus } from '@/vibes/soul/form/form-status';
import { Input } from '@/vibes/soul/form/input';
import { Streamable } from '@/vibes/soul/lib/streamable';
import { Button } from '@/vibes/soul/primitives/button';
import { GiftCertificateCard } from '@/vibes/soul/primitives/gift-certificate-card';
import { Breadcrumb, Breadcrumbs } from '@/vibes/soul/sections/breadcrumbs';
import { SectionLayout } from '@/vibes/soul/sections/section-layout';

type Action<S, P> = (state: Awaited<S>, payload: P) => S | Promise<S>;

interface State {
  lastResult: SubmissionResult | null;
  data: GiftCertificateData | null;
  errorMessage?: string;
}

type GetGiftCertificateByCodeAction = Action<State, FormData>;

interface Props {
  action: GetGiftCertificateByCodeAction;
  title?: string;
  description?: string;
  breadcrumbs?: Streamable<Breadcrumb[]>;
  logo: string | { src: string; alt: string };
  checkBalanceLabel?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  expiresAtLabel?: string;
  purchasedDateLabel?: string;
  senderLabel?: string;
}

export type GiftCertificateStatus = 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'DISABLED';

export interface GiftCertificateData {
  code: string;
  currencyCode: string;
  amount: string;
  balance: string;
  purchasedAt: string;
  expiresAt?: string | null;
  senderName: string | null;
  recipientName: string | null;
  status: GiftCertificateStatus;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --gift-certificate-title-font-family: var(--font-family-heading);
 *   --gift-certificate-title: hsl(var(--foreground));
 * }
 * ```
 */
export function GiftCertificateCheckBalanceSection({
  action,
  title = 'Check balance',
  description = 'You can check the balance and get the information about your gift certificate by typing the code in the box below.',
  breadcrumbs,
  logo,
  expiresAtLabel,
  inputLabel = 'Code',
  inputPlaceholder = 'Enter code',
  checkBalanceLabel = 'Check balance',
  purchasedDateLabel = 'Purchased at',
  senderLabel = 'Sender',
}: Props) {
  const defaultValue = useRef<string>('');
  const [{ lastResult, data, errorMessage }, formAction, isPending] = useActionState(action, {
    lastResult: null,
    data: null,
  });

  const [form] = useForm({
    lastResult,
    defaultValue: {
      code: defaultValue.current,
    },
  });

  const DetailsSection = () => (
    <div className="flex flex-1 flex-col items-center justify-center space-y-4">
      <GiftCertificateCard
        balance={data?.balance}
        expiresAt={data?.expiresAt}
        expiresAtLabel={expiresAtLabel}
        loading={isPending}
        logo={logo}
        status={data?.status}
      />
      <dl className="flex w-full flex-row">
        {!isPending && (
          <>
            {data?.senderName != null && (
              <div className="flex flex-1 flex-col">
                <dt className="font-mono text-xs uppercase">{senderLabel}</dt>
                <dd className="text-sm font-bold">{data.senderName}</dd>
              </div>
            )}
            {data?.purchasedAt != null && (
              <div className="flex flex-1 flex-col">
                <dt className="font-mono text-xs uppercase">{purchasedDateLabel}</dt>
                <dd className="text-sm font-bold">{data.purchasedAt}</dd>
              </div>
            )}
          </>
        )}
      </dl>
    </div>
  );

  return (
    <SectionLayout containerSize="xl">
      {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}

      <div className="flex flex-col justify-center gap-x-4 py-10 @md:gap-x-6 @lg:gap-x-8 @xl:flex-row @xl:gap-y-24 @2xl:gap-x-12 @4xl:gap-x-24">
        <div className="flex w-full flex-1 flex-col space-y-6">
          <h1 className="font-[family-name:var(--gift-certificate-title-font-family,var(--font-family-heading))] text-4xl font-medium leading-none text-[var(--gift-certificate-title,hsl(var(--foreground)))] @xl:text-5xl">
            {title}
          </h1>
          <div className="text-contrast-500">
            <p>{description}</p>
          </div>
          <div className="flex flex-1 @container @xl:hidden">
            <DetailsSection />
          </div>
          <div className="flex flex-col @xl:space-y-4">
            {errorMessage != null && <FormStatus type="error">{errorMessage}</FormStatus>}
            <CheckBalanceForm
              action={formAction}
              checkBalanceLabel={checkBalanceLabel}
              defaultValueRef={defaultValue}
              form={form}
              inputLabel={inputLabel}
              inputPlaceholder={inputPlaceholder}
            />
          </div>
        </div>

        <div className="hidden flex-1 @container @xl:flex">
          <DetailsSection />
        </div>
      </div>
    </SectionLayout>
  );
}

function CheckBalanceForm({
  action,
  form,
  defaultValueRef,
  inputLabel,
  inputPlaceholder,
  checkBalanceLabel,
}: {
  action: (payload: FormData) => void;
  form: FormMetadata<{ code: string }>;
  defaultValueRef: React.RefObject<string>;
  inputLabel: string;
  inputPlaceholder: string;
  checkBalanceLabel: string;
}) {
  return (
    <form
      {...getFormProps(form)}
      action={action}
      className="flex flex-col items-end space-x-2 space-y-2 @xl:flex-row"
    >
      <Input
        className="flex-1"
        label={inputLabel}
        name="code"
        onChange={(e) => {
          defaultValueRef.current = e.target.value;
        }}
        placeholder={inputPlaceholder}
        required
        style={{ height: '48px' }}
      />
      <SubmitButton label={checkBalanceLabel} />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button
      className="max-h-12 w-full @xl:w-auto"
      loading={pending}
      size="medium"
      type="submit"
      variant="secondary"
    >
      {label}
    </Button>
  );
}
