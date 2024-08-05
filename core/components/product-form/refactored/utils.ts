import { Field } from './types';

export const createUrl = (pathname: string, params: URLSearchParams) => {
  const paramsString = params.toString();
  const queryString = `${paramsString.length ? '?' : ''}${paramsString}`;

  return `${pathname}${queryString}`;
};

export const validate = ({
  field,
  data,
}: {
  field: Field;
  data: FormDataEntryValue | null;
}): { isValid: boolean; errorMessage?: string } => {
  if (field.required && !data) {
    return { isValid: false, errorMessage: `${field.name} is required.` };
  }

  if ('min' in field && typeof field.min === 'number' && Number(data) < field.min) {
    return {
      isValid: false,
      errorMessage: `${field.label} should be greater than ${field.min}`,
    };
  }

  if (
    'max' in field &&
    field.max != null &&
    typeof field.max === 'number' &&
    Number(data) > field.max
  ) {
    return {
      isValid: false,
      errorMessage: `${field.label} should be less than ${field.max}`,
    };
  }

  if (
    'pattern' in field &&
    field.pattern != null &&
    typeof field.pattern === 'string' &&
    !new RegExp(field.pattern).test(String(data))
  ) {
    return {
      isValid: false,
      errorMessage: `${field.label} should match the pattern ${field.pattern}`,
    };
  }

  return { isValid: true };
};
