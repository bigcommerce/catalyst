import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import {
  FormErrorTranslationMap,
  getPasswordSchema,
  PasswordComplexitySettings,
} from '@/vibes/soul/form/dynamic-form/schema';
import { ExistingResultType } from '~/client/util';

export const resetPasswordErrorTranslations = (
  t: ExistingResultType<typeof getTranslations<'Auth.ChangePassword'>>,
  passwordComplexity?: PasswordComplexitySettings | null,
): FormErrorTranslationMap => ({
  password: {
    invalid_type: t('FieldErrors.passwordRequired'),
    too_small: t('FieldErrors.passwordTooSmall', {
      minLength: passwordComplexity?.minimumPasswordLength ?? 0,
    }),
    lowercase_required: t('FieldErrors.passwordLowercaseRequired'),
    uppercase_required: t('FieldErrors.passwordUppercaseRequired'),
    number_required: t('FieldErrors.passwordNumberRequired', {
      minNumbers: passwordComplexity?.minimumNumbers ?? 1,
    }),
    special_character_required: t('FieldErrors.passwordSpecialCharacterRequired'),
    passwords_must_match: t('FieldErrors.passwordsMustMatch'),
  },
  confirmPassword: {
    invalid_type: t('FieldErrors.passwordRequired'),
  },
});

export const resetPasswordSchema = (
  passwordComplexity?: PasswordComplexitySettings | null,
  errorTranslations?: FormErrorTranslationMap,
) => {
  const passwordSchema = getPasswordSchema(passwordComplexity, errorTranslations);

  return z
    .object({
      currentPassword: z.string().trim(),
      password: passwordSchema,
      confirmPassword: z.string(),
    })
    .superRefine(({ confirmPassword, password }, ctx) => {
      if (confirmPassword !== password) {
        ctx.addIssue({
          code: 'custom',
          message:
            errorTranslations?.password?.passwords_must_match ?? 'The passwords do not match',
          path: ['confirmPassword'],
        });
      }
    });
};
