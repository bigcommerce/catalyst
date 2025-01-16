'use server';

import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { setPreferredCurrencyCode } from '~/lib/currency';

import { CurrencyCodeSchema } from '../schema';

const currencySwitchSchema = z.object({
  id: CurrencyCodeSchema,
});

export const switchCurrency = async (_prevState: SubmissionResult | null, payload: FormData) => {
  const t = await getTranslations('Components.Header.Currency');

  const submission = parseWithZod(payload, { schema: currencySwitchSchema });

  if (submission.status !== 'success') {
    return submission.reply({ formErrors: [t('invalidCurrency')] });
  }

  await setPreferredCurrencyCode(submission.value.id);

  revalidatePath('/');

  return submission.reply({ resetForm: true });
};
