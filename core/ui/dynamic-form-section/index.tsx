import { type SubmissionResult } from '@conform-to/react';

interface FormField {
  name: string;
  label?: string;
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

type Field =
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

type FieldGroup<F> = F[];

type Action<S, P> = (state: Awaited<S>, payload: P) => S | Promise<S>;

interface State<F extends Field> {
  fields: Array<F | FieldGroup<F>>;
  lastResult: SubmissionResult | null;
}

type DynamicFormAction<F extends Field> = Action<State<F>, FormData>;

export interface DynamicFormData<F extends Field> {
  action: DynamicFormAction<F>;
  fields: Array<F | FieldGroup<F>>;
}
