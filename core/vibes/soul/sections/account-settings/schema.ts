import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import {
  FormErrorTranslationMap,
  getPasswordSchema,
  PasswordComplexitySettings,
} from '@/vibes/soul/form/dynamic-form/schema';
import { ExistingResultType } from '~/client/util';

export const updateAccountSchema = z.object({
  firstName: z.string().min(2).trim(),
  lastName: z.string().min(2).trim(),
  email: z.string().email().trim(),
  company: z.string().trim().optional(),
});

export const updateAccountErrorTranslations = (
  t: ExistingResultType<typeof getTranslations<'Account.Settings'>>,
): FormErrorTranslationMap => ({
  firstName: {
    invalid_type: t('FieldErrors.firstNameRequired'),
    too_small: t('FieldErrors.firstNameTooSmall'),
  },
  lastName: {
    invalid_type: t('FieldErrors.lastNameRequired'),
    too_small: t('FieldErrors.lastNameTooSmall'),
  },
  email: {
    invalid_type: t('FieldErrors.emailRequired'),
    invalid_string: t('FieldErrors.emailInvalid'),
  },
});

export const changePasswordErrorTranslations = (
  t: ExistingResultType<typeof getTranslations<'Account.Settings'>>,
  passwordComplexity?: PasswordComplexitySettings | null,
): FormErrorTranslationMap => ({
  currentPassword: {
    invalid_type: t('FieldErrors.currentPasswordRequired'),
  },
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
    invalid_type: t('FieldErrors.confirmPasswordRequired'),
  },
});

export const changePasswordSchema = (
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
