/* eslint-disable react/jsx-no-bind */
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Field } from '@/vibes/soul/form/dynamic-form/schema';
import { AccountSettingsSection } from '@/vibes/soul/sections/account-settings';
import { formFieldTransformer } from '~/data-transformers/form-field-transformer';
import {
  ACCOUNT_SETTINGS_FIELDS_TO_EXCLUDE,
  mapFormFieldValueToName,
} from '~/data-transformers/form-field-transformer/utils';
import { exists } from '~/lib/utils';

import { changePassword } from './_actions/change-password';
import { updateCustomer } from './_actions/update-customer';
import { updateNewsletterSubscription } from './_actions/update-newsletter-subscription';
import { getAccountSettingsQuery } from './page-data';

function withDefaultValue(field: Field, value: unknown): Field {
  if (field.type === 'checkbox-group') {
    return { ...field, defaultValue: Array.isArray(value) ? value.map(String) : undefined };
  }

  if (typeof value !== 'string') {
    return field;
  }

  switch (field.type) {
    case 'radio-group':
    case 'select':
    case 'swatch-radio-group':
    case 'card-radio-group':
    case 'button-radio-group':
    case 'checkbox':
    case 'number':
    case 'text':
    case 'textarea':
    case 'date':
    case 'email':
    case 'hidden':
      return { ...field, defaultValue: value };

    default:
      return field;
  }
}

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'Account.Settings' });

  return {
    title: t('title'),
  };
}

export default async function Settings({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Account.Settings');

  const accountSettings = await getAccountSettingsQuery();

  if (!accountSettings) {
    notFound();
  }

  const newsletterSubscriptionEnabled = accountSettings.newsletterSettings?.showNewsletterSignup;
  const isAccountSubscribed = accountSettings.customerInfo.isSubscribedToNewsletter;

  const updateNewsletterSubscriptionActionWithCustomerInfo = updateNewsletterSubscription.bind(
    null,
    {
      customerInfo: accountSettings.customerInfo,
    },
  );

  const customFieldValues = accountSettings.customerFormFieldValues.reduce<Record<string, unknown>>(
    (acc, field) => ({ ...acc, ...mapFormFieldValueToName(field) }),
    {},
  );

  const updateAccountCustomFields = accountSettings.customerFields
    .filter((field) => !ACCOUNT_SETTINGS_FIELDS_TO_EXCLUDE.includes(field.entityId))
    .map(formFieldTransformer)
    .filter(exists)
    .map((field) => withDefaultValue(field, customFieldValues[field.name]));

  const updateCustomerWithFields = updateCustomer.bind(null, {
    fields: updateAccountCustomFields,
  });

  return (
    <AccountSettingsSection
      account={accountSettings.customerInfo}
      changePasswordAction={changePassword}
      changePasswordSubmitLabel={t('cta')}
      changePasswordTitle={t('changePassword')}
      confirmPasswordLabel={t('confirmPassword')}
      currentPasswordLabel={t('currentPassword')}
      isAccountSubscribed={isAccountSubscribed}
      newPasswordLabel={t('newPassword')}
      newsletterSubscriptionCtaLabel={t('cta')}
      newsletterSubscriptionEnabled={newsletterSubscriptionEnabled}
      newsletterSubscriptionLabel={t('NewsletterSubscription.label')}
      newsletterSubscriptionTitle={t('NewsletterSubscription.title')}
      passwordComplexitySettings={accountSettings.passwordComplexitySettings}
      title={t('title')}
      updateAccountAction={updateCustomerWithFields}
      updateAccountCustomFields={updateAccountCustomFields}
      updateAccountSubmitLabel={t('cta')}
      updateNewsletterSubscriptionAction={updateNewsletterSubscriptionActionWithCustomerInfo}
    />
  );
}
