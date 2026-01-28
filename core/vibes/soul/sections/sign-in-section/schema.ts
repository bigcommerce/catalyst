import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { FormErrorTranslationMap } from '@/vibes/soul/form/dynamic-form/schema';
import { ExistingResultType } from '~/client/util';

export const loginErrorTranslations = (
  t: ExistingResultType<typeof getTranslations<'Auth.Login'>>,
): FormErrorTranslationMap => ({
  email: {
    invalid_type: t('FieldErrors.emailRequired'),
    invalid_string: t('FieldErrors.emailInvalid'),
  },
  password: {
    invalid_type: t('FieldErrors.passwordRequired'),
  },
});

export const schema = z.object({
  email: z.string().email(),
  password: z.string(),
});
