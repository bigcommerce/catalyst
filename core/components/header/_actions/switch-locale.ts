'use server';

import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';

import { localeSchema } from '@/vibes/soul/primitives/navigation/schema';
import { defaultLocale, redirect } from '~/i18n/routing';

export const switchLocale = async (_prevState: SubmissionResult | null, payload: FormData) => {
  const t = await getTranslations('Components.Header.Locale');

  const submission = parseWithZod(payload, { schema: localeSchema });

  if (submission.status !== 'success') {
    return submission.reply({ formErrors: [t('invalidLocale')] });
  }

  await Promise.resolve();

  revalidatePath('/');

  // Since `redirect` doesn't prepend the local to the redirect url
  // when navigating the a default locale link, we need to prepend
  // it ourselves to ensure the redirect happens.
  if (submission.value.id === defaultLocale) {
    redirect({
      href: `/${submission.value.id}`,
      locale: submission.value.id,
    });
  } else {
    redirect({
      href: `/`,
      locale: submission.value.id,
    });
  }

  return submission.reply({ resetForm: true });
};
