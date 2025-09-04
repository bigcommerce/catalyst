import { z } from 'zod';

interface FormField {
  name: string;
  label: string;
  errors?: string[];
  required?: boolean;
  id?: string;
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

type SchemaRawShape = Record<
  string,
  | z.ZodString
  | z.ZodOptional<z.ZodString>
  | z.ZodNumber
  | z.ZodOptional<z.ZodNumber>
  | z.ZodArray<z.ZodString>
  | z.ZodOptional<z.ZodArray<z.ZodString>>
>;

function getFieldSchema(field: Field) {
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

    case 'password':
      fieldSchema = z
        .string()
        .min(8, { message: 'Be at least 8 characters long' })
        .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
        .regex(/[0-9]/, { message: 'Contain at least one number.' })
        .regex(/[^a-zA-Z0-9]/, {
          message: 'Contain at least one special character.',
        })
        .trim();

      if (field.required !== true) fieldSchema = fieldSchema.optional();

      break;

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

export function schema(fields: Array<Field | FieldGroup<Field>>) {
  const shape: SchemaRawShape = {};
  let passwordFieldName: string | undefined;
  let confirmPasswordFieldName: string | undefined;

  fields.forEach((field) => {
    if (Array.isArray(field)) {
      field.forEach((f) => {
        shape[f.name] = getFieldSchema(f);

        if (f.type === 'password') passwordFieldName = f.name;
        if (f.type === 'confirm-password') confirmPasswordFieldName = f.name;
      });
    } else {
      shape[field.name] = getFieldSchema(field);

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
