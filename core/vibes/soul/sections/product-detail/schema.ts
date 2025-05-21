import { z } from 'zod';

interface FormField {
  name: string;
  label: string;
  errors?: string[];
  required?: boolean;
  persist?: boolean;
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

type NumberInputField = {
  type: 'number';
  defaultValue?: string;
  min?: number;
  max?: number;
  incrementLabel?: string;
  decrementLabel?: string;
} & FormField;

type TextInputField = {
  type: 'text';
  defaultValue?: string;
  pattern?: string;
} & FormField;

type TextAreaField = {
  type: 'textarea';
  defaultValue?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
} & FormField;

type DateField = {
  type: 'date';
  defaultValue?: string;
  pattern?: string;
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

export type Field =
  | RadioField
  | CheckboxField
  | NumberInputField
  | TextInputField
  | TextAreaField
  | DateField
  | SwatchRadioField
  | CardRadioField
  | ButtonRadioField
  | SelectField;

export interface SchemaRawShape {
  [key: string]:
    | z.ZodString
    | z.ZodOptional<z.ZodString>
    | z.ZodNumber
    | z.ZodOptional<z.ZodNumber>;
  id: z.ZodString;
  quantity: z.ZodNumber;
}

export function schema(fields: Field[]): z.ZodObject<SchemaRawShape> {
  const shape: SchemaRawShape = {
    id: z.string(),
    quantity: z.number().min(1),
  };

  fields.forEach((field) => {
    let fieldSchema: z.ZodString | z.ZodNumber;

    switch (field.type) {
      case 'number':
        fieldSchema = z.number();

        if (field.min != null) fieldSchema = fieldSchema.min(field.min);
        if (field.max != null) fieldSchema = fieldSchema.max(field.max);

        shape[field.name] = fieldSchema;
        break;

      case 'textarea':
        fieldSchema = z.string();
        if (field.minLength != null) fieldSchema = fieldSchema.min(field.minLength);
        if (field.maxLength != null) fieldSchema = fieldSchema.max(field.maxLength);

        shape[field.name] = fieldSchema;
        break;

      default:
        fieldSchema = z.string();

        shape[field.name] = fieldSchema;
        break;
    }

    if (field.required !== true) shape[field.name] = fieldSchema.optional();
  });

  return z.object(shape);
}
