import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { FormErrorTranslationMap } from '@/vibes/soul/form/dynamic-form/schema';
import { ExistingResultType } from '~/client/util';

export const reviewFormErrorTranslations = (
  t: ExistingResultType<typeof getTranslations<'Product.Reviews.Form'>>,
): FormErrorTranslationMap => ({
  title: {
    invalid_type: t('FieldErrors.titleRequired'),
  },
  author: {
    invalid_type: t('FieldErrors.authorRequired'),
  },
  email: {
    invalid_type: t('FieldErrors.emailRequired'),
    invalid_string: t('FieldErrors.emailInvalid'),
  },
  text: {
    invalid_type: t('FieldErrors.textRequired'),
  },
  rating: {
    invalid_type: t('FieldErrors.ratingRequired'),
    too_small: t('FieldErrors.ratingTooSmall'),
    too_big: t('FieldErrors.ratingTooLarge'),
  },
});

export const schema = z.object({
  productEntityId: z.number(),
  title: z.string().min(1),
  author: z.string().min(1),
  email: z.string().email(),
  text: z.string().min(1),
  rating: z.number().min(1).max(5),
});
