/* eslint-disable react/jsx-no-bind */
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { AccountSettingsSection } from '@/vibes/soul/sections/account-settings';

import { getSessionCustomerAccessToken } from '~/auth';

import { changePassword } from './_actions/change-password';
import { updateCustomer } from './_actions/update-customer';
import { updateNewsletterSubscription } from './_actions/update-newsletter-subscription';
import { getAccountSettingsQuery } from './page-data';

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

async function SettingsContent({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const [t, customerAccessToken] = await Promise.all([
    getTranslations('Account.Settings'),
    getSessionCustomerAccessToken(),
  ]);
  const accountSettings = await getAccountSettingsQuery({}, customerAccessToken);

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
      updateAccountAction={updateCustomer}
      updateAccountSubmitLabel={t('cta')}
      updateNewsletterSubscriptionAction={updateNewsletterSubscriptionActionWithCustomerInfo}
    />
  );
}

export default function Settings(props: Props) {
  return (
    <Suspense>
      <SettingsContent {...props} />
    </Suspense>
  );
}
