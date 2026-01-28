import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { FormErrorTranslationMap } from '@/vibes/soul/form/dynamic-form/schema';
import { ExistingResultType } from '~/client/util';

export const addressFormErrorTranslations = (
  t: ExistingResultType<typeof getTranslations<'Account.Addresses'>>,
): FormErrorTranslationMap => ({
  firstName: {
    invalid_type: t('FieldErrors.firstNameRequired'),
  },
  lastName: {
    invalid_type: t('FieldErrors.lastNameRequired'),
  },
  address1: {
    invalid_type: t('FieldErrors.addressLine1Required'),
  },
  city: {
    invalid_type: t('FieldErrors.cityRequired'),
  },
  countryCode: {
    invalid_type: t('FieldErrors.countryRequired'),
  },
  stateOrProvince: {
    invalid_type: t('FieldErrors.stateRequired'),
  },
  postalCode: {
    invalid_type: t('FieldErrors.postalCodeRequired'),
  },
});

export const schema = z
  .object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    company: z.string().optional(),
    address1: z.string(),
    address2: z.string().optional(),
    city: z.string(),
    stateOrProvince: z.string().optional(),
    postalCode: z.string().optional(),
    phone: z.string().optional(),
    countryCode: z.string(),
  })
  .passthrough();
