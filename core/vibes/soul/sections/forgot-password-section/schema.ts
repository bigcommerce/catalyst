import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { FormErrorTranslationMap } from '@/vibes/soul/form/dynamic-form/schema';
import { ExistingResultType } from '~/client/util';

export const forgotPasswordErrorTranslations = (
  t: ExistingResultType<typeof getTranslations<'Auth.Login.ForgotPassword'>>,
): FormErrorTranslationMap => ({
  email: {
    invalid_type: t('FieldErrors.emailRequired'),
    invalid_string: t('FieldErrors.emailInvalid'),
  },
});

export const schema = z.object({
  email: z.string().email().trim(),
});
