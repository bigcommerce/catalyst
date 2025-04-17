'use client';

import { useTranslations } from 'next-intl';

import { Error as ErrorSection } from '@/vibes/soul/sections/error';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ reset }: Props) {
  const t = useTranslations('Error');

  return <ErrorSection ctaAction={reset} subtitle={t('subtitle')} title={t('title')} />;
}
