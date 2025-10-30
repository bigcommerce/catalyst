'use client';

import { SubmissionResult } from '@conform-to/react';
import { clsx } from 'clsx';
import { useFormatter } from 'next-intl';
import { ReactNode, useCallback, useState } from 'react';

import { DynamicForm, DynamicFormAction } from '@/vibes/soul/form/dynamic-form';
import { Field, FieldGroup } from '@/vibes/soul/form/dynamic-form/schema';
import { Streamable } from '@/vibes/soul/lib/streamable';
import { GiftCertificateCard } from '@/vibes/soul/primitives/gift-certificate-card';
import { toast } from '@/vibes/soul/primitives/toaster';
import { Breadcrumb, Breadcrumbs } from '@/vibes/soul/sections/breadcrumbs';
import { SectionLayout } from '@/vibes/soul/sections/section-layout';

interface Props {
  action: DynamicFormAction<Field>;
  formFields: Array<Field | FieldGroup<Field>>;
  currencyCode?: string;
  ctaLabel?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  breadcrumbs?: Streamable<Breadcrumb[]>;
  logo: string | { src: string; alt: string };
  expiresAt?: string;
  expiresAtLabel?: string;
  settings: {
    minCustomAmount?: number;
    maxCustomAmount?: number;
  };
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --gift-certificate-purchase-subtitle-font-family: var(--font-family-mono);
 *   --gift-certificate-purchase-title-font-family: var(--font-family-heading);
 *   --gift-certificate-description-text: hsl(var(--contrast-500));
 * }
 * ```
 */
export function GiftCertificatePurchaseSection({
  action,
  currencyCode,
  formFields,
  title = 'Purchase a gift certificate',
  description = 'Explore our gift certificates, perfect for any occasion. Choose the amount and personalize your message.',
  subtitle,
  breadcrumbs,
  logo,
  settings,
  expiresAt,
  expiresAtLabel,
  ctaLabel = 'Add to cart',
}: Props) {
  const format = useFormatter();
  const [formattedAmount, setFormattedAmount] = useState<string | undefined>(undefined);
  const handleFormChange = (e: React.FormEvent<HTMLFormElement>) => {
    if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement)) {
      return;
    }

    if (e.target.name !== 'amount') {
      return;
    }

    if (
      e.target.value.trim() === '' ||
      Number.isNaN(Number(e.target.value)) ||
      Number(e.target.value) === 0 ||
      currencyCode == null
    ) {
      setFormattedAmount(undefined);

      return;
    }

    if (e.target instanceof HTMLInputElement) {
      e.target.value = e.target.value.replace(/[^0-9.]/g, '');

      if (settings.maxCustomAmount && Number(e.target.value) > settings.maxCustomAmount) {
        e.target.value = String(settings.maxCustomAmount);
      }
    }

    const formatted = format.number(Number(e.target.value), {
      style: 'currency',
      currency: currencyCode,
    });

    setFormattedAmount(formatted);
  };

  const handleSuccess = useCallback((lastResult: SubmissionResult, successMessage: ReactNode) => {
    toast.success(successMessage);
  }, []);

  return (
    <SectionLayout containerSize="xl">
      {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}

      <div className="flex flex-col justify-center gap-x-16 py-6 @xl:flex-row">
        <div className="flex w-full flex-1 flex-col space-y-6">
          <div className="hidden flex-1 rounded-xl bg-contrast-100 @container @xl:flex">
            <div
              className={clsx(
                'flex flex-1 items-center justify-center p-2 @[250px]:p-4 @[300px]:p-8 @[350px]:p-12 @[450px]:p-16',
              )}
            >
              <GiftCertificateCard
                balance={formattedAmount}
                expiresAt={expiresAt}
                expiresAtLabel={expiresAtLabel}
                logo={logo}
              />
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-6 border-b border-contrast-100 pb-2">
            <div className="mb-4 @xl:mb-0">
              {subtitle != null && (
                <p className="mb-1 font-[family-name:var(--gift-certificate-purchase-subtitle-font-family,var(--font-family-mono))] text-sm uppercase text-contrast-500">
                  {subtitle}
                </p>
              )}
              <h1 className="font-[family-name:var(--gift-certificate-purchase-title-font-family,var(--font-family-heading))] text-2xl font-medium leading-none @xl:text-3xl @4xl:text-4xl">
                {title}
              </h1>
            </div>
            <div className="flex w-full flex-1 flex-col space-y-6">
              <div className="flex flex-1 rounded-xl bg-contrast-100 @container @xl:hidden">
                <div
                  className={clsx(
                    'flex flex-1 items-center justify-center p-2 @[250px]:p-4 @[300px]:p-8 @[350px]:p-12 @[450px]:p-16',
                  )}
                >
                  <GiftCertificateCard
                    balance={formattedAmount}
                    expiresAt={expiresAt}
                    expiresAtLabel={expiresAtLabel}
                    logo={logo}
                  />
                </div>
              </div>
            </div>
            <p className="py-4 text-[var(--gift-certificate-description-text,hsl(var(--contrast-500)))]">
              {description}
            </p>
          </div>
          <DynamicForm
            action={action}
            fields={formFields}
            key={JSON.stringify(formFields)}
            onChange={handleFormChange}
            onSuccess={handleSuccess}
            submitLabel={ctaLabel}
          />
        </div>
      </div>
    </SectionLayout>
  );
}
