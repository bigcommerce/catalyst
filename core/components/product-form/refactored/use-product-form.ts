import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

import { type Props as CheckboxInputProps } from './inputs/checkbox-input';
import { type Props as NumberInputProps } from './inputs/number-input';
import { type Props as RadioGroupProps } from './inputs/radio-group';
import { type Props as SelectInputProps } from './inputs/select-input';
import { type Props as SwatchGroupProps } from './inputs/swatch-group';
import { type Props as TextInputProps } from './inputs/text-input';
import { Field } from './types';
import { createUrl, validate } from './utils';

export type Input =
  | { type: 'radio'; props: RadioGroupProps }
  | { type: 'swatch'; props: SwatchGroupProps }
  | { type: 'number'; props: NumberInputProps }
  | { type: 'text'; props: TextInputProps }
  | { type: 'checkbox'; props: CheckboxInputProps }
  | { type: 'select'; props: SelectInputProps };

interface Props {
  fields: Field[];
}

export const useFormState = ({ fields }: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [touched, setTouched] = useState(new Map<string, true | undefined>());
  const [errors, setErrors] = useState(new Map<string, string | undefined>());
  const updateParams = useCallback(
    ({ key, value }: { key: string; value: string | undefined }) => {
      const currentParams = Array.from(searchParams.entries());
      const newParams = currentParams.filter(([k]) => k !== key);

      if (value) {
        newParams.push([key, value]);
      }

      return createUrl(pathname, new URLSearchParams(newParams));
    },
    [pathname, searchParams],
  );

  const handleSubmit =
    (action: (formData: FormData) => void) => (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = new FormData(e.currentTarget);
      const nextTouched = new Map(touched);
      const nextErrors = new Map(errors);

      // eslint-disable-next-line no-restricted-syntax
      for (const field of fields) {
        nextTouched.set(field.name, true);

        const { isValid, errorMessage } = validate({
          field,
          data: formData.get(field.name),
        });

        if (!isValid) {
          nextErrors.set(field.name, errorMessage);
        } else {
          nextErrors.set(field.name, undefined);
        }
      }

      setTouched(nextTouched);
      setErrors(nextErrors);

      if (Array.from(nextErrors.values()).some((error) => Boolean(error))) {
        return;
      }

      action(formData);
    };

  const inputs: Input[] = fields
    .map((field) => {
      const props = {
        label: field.label,
        name: field.name,
        required: field.required,
        error: touched.get(field.name) && errors.get(field.name),
        onBlur() {
          setTouched((prev) => new Map(prev.set(field.name, true)));
        },
      };

      switch (field.type) {
        case 'radio':
          return {
            type: 'radio' as const,
            props: {
              ...props,
              options: field.options,
              value: searchParams.get(field.name) ?? field.defaultValue,
              onChange(e: React.ChangeEvent<HTMLInputElement>) {
                router.replace(
                  updateParams({
                    key: field.name,
                    value: e.currentTarget.value,
                  }),
                );
              },
            },
          };

        case 'number':
          return {
            type: 'number' as const,
            props: {
              ...props,
              min: field.min,
              max: field.max,
              value: searchParams.get(field.name) ?? field.defaultValue ?? '',
              onChange(e: React.ChangeEvent<HTMLInputElement>) {
                router.replace(
                  updateParams({
                    key: field.name,
                    value: e.currentTarget.value,
                  }),
                );
              },
            },
          };

        case 'swatch':
          return {
            type: 'swatch' as const,
            props: {
              ...props,
              options: field.options,
              value: searchParams.get(field.name) ?? field.defaultValue,
              onChange(e: React.ChangeEvent<HTMLInputElement>) {
                router.replace(
                  updateParams({
                    key: field.name,
                    value: e.currentTarget.value,
                  }),
                );
              },
            },
          };

        case 'text':
          return {
            type: 'text' as const,
            props: {
              ...props,
              value: searchParams.get(field.name) ?? field.defaultValue ?? '',
              onChange(e: React.ChangeEvent<HTMLInputElement>) {
                router.replace(
                  updateParams({
                    key: field.name,
                    value: e.currentTarget.value,
                  }),
                );
              },
            },
          };

        case 'checkbox':
          return {
            type: 'checkbox' as const,
            props: {
              ...props,
              checked: searchParams.get(field.name) === 'true',
              onChange(e: React.ChangeEvent<HTMLInputElement>) {
                router.replace(
                  updateParams({
                    key: field.name,
                    value: String(e.currentTarget.checked),
                  }),
                );
              },
            },
          };

        case 'select':
          return {
            type: 'select' as const,
            props: {
              ...props,
              options: field.options,
              value: searchParams.get(field.name) ?? field.defaultValue,
              onChange(e: React.ChangeEvent<HTMLSelectElement>) {
                router.replace(
                  updateParams({
                    key: field.name,
                    value: e.currentTarget.value,
                  }),
                );
              },
            },
          };

        default: {
          return null;
        }
      }
    })
    .filter((i) => i !== null);

  return { handleSubmit, inputs };
};
