import { z } from 'zod';

export interface PasswordComplexitySettings {
  minimumNumbers?: number | null;
  minimumPasswordLength?: number | null;
  minimumSpecialCharacters?: number | null;
  requireLowerCase?: boolean | null;
  requireNumbers?: boolean | null;
  requireSpecialCharacters?: boolean | null;
  requireUpperCase?: boolean | null;
}

interface FormField {
  name: string;
  label?: string;
  errors?: string[];
  required?: boolean;
  id?: string;
  placeholder?: string;
}

type RadioField = {
  type: 'radio-group';
  options: Array<{ label: string; value: string }>;
  defaultValue?: string;
} & FormField;

type SelectField = {
  type: 'select';
  options: Array<{ label: string; value: string }>;
  defaultValue?: string;
} & FormField;

type CheckboxField = {
  type: 'checkbox';
  defaultValue?: string;
} & FormField;

type CheckboxGroupField = {
  type: 'checkbox-group';
  options: Array<{ label: string; value: string }>;
  defaultValue?: string[];
} & FormField;

type NumberInputField = {
  type: 'number';
  defaultValue?: string;
  min?: number;
  max?: number;
  step?: number;
  incrementLabel?: string;
  decrementLabel?: string;
} & FormField;

type TextInputField = {
  type: 'text';
  defaultValue?: string;
  pattern?: string;
} & FormField;

type EmailInputField = {
  type: 'email';
  defaultValue?: string;
} & FormField;

type TextAreaField = {
  type: 'textarea';
  defaultValue?: string;
} & FormField;

type DateField = {
  type: 'date';
  defaultValue?: string;
  minDate?: string;
  maxDate?: string;
} & FormField;

type SwatchRadioFieldOption =
  | {
      type: 'color';
      value: string;
      label: string;
      color: string;
      disabled?: boolean;
    }
  | {
      type: 'image';
      value: string;
      label: string;
      image: { src: string; alt: string };
      disabled?: boolean;
    };

type SwatchRadioField = {
  type: 'swatch-radio-group';
  defaultValue?: string;
  options: SwatchRadioFieldOption[];
} & FormField;

type CardRadioField = {
  type: 'card-radio-group';
  defaultValue?: string;
  options: Array<{
    value: string;
    label: string;
    image: { src: string; alt: string };
    disabled?: boolean;
  }>;
} & FormField;

type ButtonRadioField = {
  type: 'button-radio-group';
  defaultValue?: string;
  pattern?: string;
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
} & FormField;

type PasswordField = {
  type: 'password';
} & FormField;

type ConfirmPasswordField = {
  type: 'confirm-password';
} & FormField;

type HiddenInputField = {
  type: 'hidden';
  defaultValue?: string;
} & FormField;

export type Field =
  | RadioField
  | CheckboxField
  | CheckboxGroupField
  | NumberInputField
  | TextInputField
  | TextAreaField
  | DateField
  | SwatchRadioField
  | CardRadioField
  | ButtonRadioField
  | SelectField
  | PasswordField
  | ConfirmPasswordField
  | EmailInputField
  | HiddenInputField;

export type FieldGroup<F> = F[];

export type SchemaRawShape = Record<
  string,
  | z.ZodString
  | z.ZodOptional<z.ZodString>
  | z.ZodNumber
  | z.ZodOptional<z.ZodNumber>
  | z.ZodArray<z.ZodString>
  | z.ZodOptional<z.ZodArray<z.ZodString>>
>;

// eslint-disable-next-line complexity
function getFieldSchema(field: Field, passwordComplexity?: PasswordComplexitySettings | null) {
  let fieldSchema:
    | z.ZodString
    | z.ZodNumber
    | z.ZodOptional<z.ZodString>
    | z.ZodOptional<z.ZodNumber>
    | z.ZodArray<z.ZodString, 'atleastone' | 'many'>
    | z.ZodOptional<z.ZodArray<z.ZodString, 'atleastone' | 'many'>>;

  switch (field.type) {
    case 'number':
      fieldSchema = z.number();

      if (field.min != null) fieldSchema = fieldSchema.min(field.min);
      if (field.max != null) fieldSchema = fieldSchema.max(field.max);
      if (field.required !== true) fieldSchema = fieldSchema.optional();

      break;

    case 'text':
      fieldSchema = z.string();

      if (field.pattern != null) {
        fieldSchema = fieldSchema.regex(new RegExp(field.pattern), {
          message: 'Invalid format.',
        });
      }

      if (field.required !== true) fieldSchema = fieldSchema.optional();

      break;

    case 'password': {
      const minLength = passwordComplexity?.minimumPasswordLength ?? 8;
      const minNumbers = passwordComplexity?.minimumNumbers ?? 0;
      const minSpecialChars = passwordComplexity?.minimumSpecialCharacters ?? 0;
      const requireLowerCase = passwordComplexity?.requireLowerCase ?? false;
      const requireUpperCase = passwordComplexity?.requireUpperCase ?? false;
      const requireNumbers = passwordComplexity?.requireNumbers ?? true;
      const requireSpecialChars = passwordComplexity?.requireSpecialCharacters ?? true;

      fieldSchema = z.string().trim();

      fieldSchema = fieldSchema.min(minLength, {
        message: `Be at least ${minLength} character${minLength !== 1 ? 's' : ''} long`,
      });

      if (requireLowerCase) {
        fieldSchema = fieldSchema.regex(/[a-z]/, {
          message: 'Contain at least one lowercase letter.',
        });
      }

      if (requireUpperCase) {
        fieldSchema = fieldSchema.regex(/[A-Z]/, {
          message: 'Contain at least one uppercase letter.',
        });
      }

      if (requireNumbers && minNumbers > 0) {
        const numberRegex = new RegExp(`(.*[0-9]){${minNumbers},}`);

        fieldSchema = fieldSchema.regex(numberRegex, {
          message:
            minNumbers === 1
              ? 'Contain at least one number.'
              : `Contain at least ${minNumbers} numbers.`,
        });
      } else if (requireNumbers) {
        fieldSchema = fieldSchema.regex(/[0-9]/, {
          message: 'Contain at least one number.',
        });
      }

      if (requireSpecialChars && minSpecialChars > 0) {
        const specialCharRegex = new RegExp(`(.*[^a-zA-Z0-9]){${minSpecialChars},}`);

        fieldSchema = fieldSchema.regex(specialCharRegex, {
          message:
            minSpecialChars === 1
              ? 'Contain at least one special character.'
              : `Contain at least ${minSpecialChars} special characters.`,
        });
      } else if (requireSpecialChars) {
        fieldSchema = fieldSchema.regex(/[^a-zA-Z0-9]/, {
          message: 'Contain at least one special character.',
        });
      }

      if (field.required !== true) fieldSchema = fieldSchema.optional();

      break;
    }

    case 'email':
      fieldSchema = z.string().email({ message: 'Please enter a valid email.' }).trim();

      if (field.required !== true) fieldSchema = fieldSchema.optional();

      break;

    case 'checkbox-group':
      fieldSchema = z.string().array();

      if (field.required === true) fieldSchema = fieldSchema.nonempty();

      break;

    default:
      fieldSchema = z.string();

      if (field.required !== true) fieldSchema = fieldSchema.optional();
  }

  return fieldSchema;
}

export function schema(
  fields: Array<Field | FieldGroup<Field>>,
  passwordComplexity?: PasswordComplexitySettings | null,
) {
  const shape: SchemaRawShape = {};
  let passwordFieldName: string | undefined;
  let confirmPasswordFieldName: string | undefined;

  fields.forEach((field) => {
    if (Array.isArray(field)) {
      field.forEach((f) => {
        shape[f.name] = getFieldSchema(f, passwordComplexity);

        if (f.type === 'password') passwordFieldName = f.name;
        if (f.type === 'confirm-password') confirmPasswordFieldName = f.name;
      });
    } else {
      shape[field.name] = getFieldSchema(field, passwordComplexity);

      if (field.type === 'password') passwordFieldName = field.name;
      if (field.type === 'confirm-password') confirmPasswordFieldName = field.name;
    }
  });

  return z.object(shape).superRefine((data, ctx) => {
    if (
      passwordFieldName != null &&
      confirmPasswordFieldName != null &&
      data[passwordFieldName] !== data[confirmPasswordFieldName]
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'The passwords did not match',
        path: [confirmPasswordFieldName],
      });
    }
  });
}
