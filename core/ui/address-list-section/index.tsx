import { type SubmissionResult } from '@conform-to/react';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

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

type SelectField = {
  type: 'select';
  options: Array<{ label: string; value: string }>;
  defaultValue?: string;
} & FormField;

type PasswordField = {
  type: 'password';
} & FormField;

type ConfirmPasswordField = {
  type: 'confirm-password';
} & FormField;

type EmailInputField = {
  type: 'email';
  defaultValue?: string;
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

export interface Address {
  [key: string]: unknown;
  id: string;
  firstName: string;
  lastName: string;
  company?: string | undefined;
  address1: string;
  address2?: string | undefined;
  city: string;
  stateOrProvince?: string | undefined;
  postalCode?: string | undefined;
  phone?: string | undefined;
  countryCode: string;
}

export interface DefaultAddressConfiguration {
  id: string | null;
}

export interface AddressListState<A extends Address, F extends Field> {
  addresses: A[];
  defaultAddress?: DefaultAddressConfiguration;
  lastResult: SubmissionResult | null;
  fields: Array<F | FieldGroup<F>>;
}

export interface AddressListData<A extends Address, F extends Field> {
  addresses: A[];
  fields: Array<F | FieldGroup<F>>;
  defaultAddress?: DefaultAddressConfiguration;
  addressAction: Action<AddressListState<A, F>, FormData>;
}

export { AddressListSection } from '@/vibes/soul/sections/address-list-section';
