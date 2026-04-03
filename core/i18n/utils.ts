import { parseWithZod as conformParseWithZod } from '@conform-to/zod';
import { z, ZodIssueOptionalMessage } from 'zod';

import { FormErrorTranslationMap } from '@/vibes/soul/form/dynamic-form/schema';

export function createErrorMap(errorTranslations?: FormErrorTranslationMap) {
  return (issue: ZodIssueOptionalMessage) => {
    const field = issue.path[0];
    const fieldKey = typeof field === 'string' ? field : '';
    const errorMessage = errorTranslations?.[fieldKey]?.[issue.code];

    return { message: errorMessage ?? issue.message ?? 'Invalid input' };
  };
}

export function parseWithZodTranslatedErrors<Schema extends z.ZodType>(
  formData: FormData,
  options: {
    schema: Schema;
    errorTranslations?: FormErrorTranslationMap;
  },
) {
  const errorMap = createErrorMap(options.errorTranslations);

  return conformParseWithZod(formData, {
    schema: options.schema,
    errorMap,
  });
}
