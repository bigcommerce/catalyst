export interface FormField {
  name: string;
  label: string;
  error?: string | undefined;
}

export interface RadioField extends FormField {
  type: 'radio';
  options: Array<{ label: string; value: string }>;
  defaultValue?: string;
  required?: boolean;
}

export interface SwatchField extends FormField {
  type: 'swatch';
  options: Array<{ label: string; value: string; hex?: string }>;
  defaultValue?: string;
  required?: boolean;
}

export interface NumberField extends FormField {
  type: 'number';
  defaultValue?: number;
  required?: boolean;
  min?: number;
  max?: number;
}

export interface TextField extends FormField {
  type: 'text';
  defaultValue?: string;
  required?: boolean;
  pattern?: string;
}

export interface CheckboxField extends FormField {
  type: 'checkbox';
  defaultValue?: boolean;
  required?: boolean;
}

export interface SelectField extends FormField {
  type: 'select';
  options: Array<{ label: string; value: string }>;
  defaultValue?: string;
  required?: boolean;
}

export type Field =
  | RadioField
  | SwatchField
  | NumberField
  | TextField
  | CheckboxField
  | SelectField;
