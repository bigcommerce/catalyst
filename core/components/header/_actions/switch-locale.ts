'use server';

import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { revalidatePath } from 'next/cache';

import { localeSchema } from '@/vibes/soul/primitives/navigation/schema';
import { defaultLocale, redirect } from '~/i18n/routing';

export const switchLocale = async (_prevState: SubmissionResult | null, payload: FormData) => {
  const submission = parseWithZod(payload, { schema: localeSchema });

  if (submission.status !== 'success') {
    return submission.reply({ formErrors: ['Invalid locale'] });
  }

  await Promise.resolve();

  revalidatePath('/');

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
