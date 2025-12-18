import { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ForgotPasswordSection } from '@/vibes/soul/sections/forgot-password-section';

import { resetPassword } from './_actions/reset-password';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // MIGRATED: With Cache Components, generateMetadata accessing async data causes blocking
  // Using static metadata to avoid blocking route errors
  // TODO: Consider using "use cache" if dynamic metadata is needed
  return {
    title: 'Forgot Password',
  };
}

async function ForgotPasswordContent({ localePromise }: { localePromise: Promise<{ locale: string }> }) {
  const { locale } = await localePromise;
  
  // MIGRATED: setRequestLocale and getTranslations must be inside Suspense boundary
  // to avoid blocking route errors with Cache Components
  setRequestLocale(locale);
  const t = await getTranslations('Auth.Login.ForgotPassword');

  return (
    <ForgotPasswordSection action={resetPassword} subtitle={t('subtitle')} title={t('title')} />
  );
}

export default function Reset(props: Props) {
  // MIGRATED: Page component is fully synchronous, all async operations are inside Suspense
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordContent localePromise={props.params} />
    </Suspense>
  );
}
