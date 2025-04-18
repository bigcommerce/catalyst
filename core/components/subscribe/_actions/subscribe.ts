'use server';

import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getTranslations } from 'next-intl/server';

import { schema } from '@/ui/primitives/inline-email-form/schema';

export const subscribe = async (
  _lastResult: { lastResult: SubmissionResult | null },
  formData: FormData,
) => {
  const t = await getTranslations('Components.Subscribe');

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return { lastResult: submission.reply() };
  }

  // Simulate a network request
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return { lastResult: submission.reply(), successMessage: t('success') };
};
