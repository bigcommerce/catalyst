import { ChangeEvent } from 'react';

import {
  createFieldName,
  FieldNameToFieldId,
} from '~/app/[locale]/(default)/login/register-customer/_components/register-customer-form/fields';

import { Countries } from './add-address';

type FieldState = Record<string, boolean>;

type StateOrProvince = Countries[number]['statesOrProvinces'];
type FieldStateSetFn<Type> = (state: Type | ((prevState: Type) => Type)) => void;

const createTextInputValidationHandler =
  (textInputStateSetter: FieldStateSetFn<FieldState>, textInputState: FieldState) =>
  (e: ChangeEvent<HTMLInputElement>) => {
    const fieldId = Number(e.target.id.split('-')[1]);

    const validityState = e.target.validity;
    const validationStatus = validityState.valueMissing || validityState.typeMismatch;

    textInputStateSetter({ ...textInputState, [fieldId]: !validationStatus });
  };

const createPasswordValidationHandler =
  (passwordStateSetter: FieldStateSetFn<FieldState>) => (e: ChangeEvent<HTMLInputElement>) => {
    const fieldId = e.target.id.split('-')[1] ?? '';

    switch (FieldNameToFieldId[Number(fieldId)]) {
      case 'password': {
        passwordStateSetter((prevState) => ({
          ...prevState,
          [fieldId]: !e.target.validity.valueMissing,
        }));

        return;
      }

      case 'confirmPassword': {
        const confirmPassword = e.target.value;

        const passwordFieldName = createFieldName('customer', +fieldId);
        const password = new FormData(e.target.form ?? undefined).get(passwordFieldName);

        passwordStateSetter((prevState) => ({
          ...prevState,
          [fieldId]: password === confirmPassword && !e.target.validity.valueMissing,
        }));

        return;
      }

      default: {
        passwordStateSetter((prevState) => ({
          ...prevState,
          [fieldId]: !e.target.validity.valueMissing,
        }));
      }
    }
  };

const createPicklistOrTextValidationHandler =
  (picklistWithTextStateSetter: FieldStateSetFn<FieldState>, picklistWithTextState: FieldState) =>
  (e: ChangeEvent<HTMLInputElement>) => {
    const fieldId = Number(e.target.id.split('-')[1]);

    const validationStatus = e.target.validity.valueMissing;

    picklistWithTextStateSetter({ ...picklistWithTextState, [fieldId]: !validationStatus });
  };

const createCountryChangeHandler =
  (provinceSetter: FieldStateSetFn<StateOrProvince>, countries: Countries) => (value: string) => {
    const states = countries.find(({ code }) => code === value)?.statesOrProvinces;

    provinceSetter(states ?? []);
  };

export {
  createTextInputValidationHandler,
  createPicklistOrTextValidationHandler,
  createPasswordValidationHandler,
  createCountryChangeHandler,
};
