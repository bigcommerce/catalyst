import { ChangeEvent } from 'react';

import {
  createFieldName,
  FieldNameToFieldId,
} from '~/app/[locale]/(default)/login/register-customer/_components/register-customer-form/fields';

import { AddressFields, Countries } from './add-address';

export const isAddressOrAccountFormField = (field: unknown): field is AddressFields[number] => {
  if (
    typeof field === 'object' &&
    field !== null &&
    '__typename' in field &&
    'isBuiltIn' in field
  ) {
    return true;
  }

  return false;
};

type FieldState = Record<string, boolean>;

type StateOrProvince = Countries[number]['statesOrProvinces'];
type FieldStateSetFn<Type> = (state: Type | ((prevState: Type) => Type)) => void;

const createPreSubmitPicklistValidationHandler = (
  formFields: AddressFields,
  validitationSetter: FieldStateSetFn<FieldState>,
) => {
  const picklists = formFields.filter(
    ({ __typename: type, entityId, isBuiltIn, isRequired }) =>
      type === 'PicklistFormField' &&
      entityId !== FieldNameToFieldId.countryCode &&
      !isBuiltIn &&
      isRequired,
  );

  return (form: HTMLFormElement | null) => {
    if (!form) return;

    const multipleChoices = Object.fromEntries(
      [...new FormData(form).entries()]
        .filter(
          (fieldEntry): fieldEntry is [string, string] =>
            fieldEntry[0].includes('custom_multipleChoices-') && typeof fieldEntry[1] === 'string',
        )
        .map(([picklistKey, picklistValue]: [string, string]) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const fieldId = picklistKey.split('-')[1]!;

          return [fieldId, picklistValue];
        }),
    );

    picklists.forEach(({ entityId: picklistId }) => {
      const picklistFields = Object.keys(multipleChoices);

      if (picklistFields.includes(picklistId.toString())) {
        const currentValue = multipleChoices[picklistId];

        validitationSetter((prevValidationState) => ({
          ...prevValidationState,
          [picklistId]: (currentValue && currentValue.length > 0) || false,
        }));
      }
    });
  };
};

const createTextInputValidationHandler =
  (textInputStateSetter: FieldStateSetFn<FieldState>, textInputState: FieldState) =>
  (e: ChangeEvent<HTMLInputElement>) => {
    const fieldId = Number(e.target.id.split('-')[1]);

    const validityState = e.target.validity;
    const validationStatus = validityState.valueMissing || validityState.typeMismatch;

    textInputStateSetter({ ...textInputState, [fieldId]: !validationStatus });
  };

const createNumbersInputValidationHandler =
  (numbersInputStateSetter: FieldStateSetFn<FieldState>, numbersInputState: FieldState) =>
  (e: ChangeEvent<HTMLInputElement>) => {
    const fieldId = Number(e.target.id.split('-')[1]);

    const { valueMissing, typeMismatch, rangeUnderflow, rangeOverflow } = e.target.validity;
    const validationStatus = valueMissing || typeMismatch || rangeUnderflow || rangeOverflow;

    numbersInputStateSetter({ ...numbersInputState, [fieldId]: !validationStatus });
  };

const createRadioButtonsValidationHandler =
  (radioButtonsStateSetter: FieldStateSetFn<FieldState>, radioButtonsState: FieldState) =>
  (e: React.ChangeEvent<HTMLInputElement>) => {
    const fieldId = Number(e.target.name.split('-')[1]);
    const { valueMissing } = e.target.validity;

    radioButtonsStateSetter({ ...radioButtonsState, [fieldId]: !valueMissing });
  };

const createDatesValidationHandler =
  (dateStateSetter: FieldStateSetFn<FieldState>, dateFieldState: FieldState) =>
  (e: React.ChangeEvent<HTMLInputElement>) => {
    const fieldId = Number(e.target.id);
    const validationStatus = e.target.validity.valueMissing;

    dateStateSetter({ ...dateFieldState, [fieldId]: !validationStatus });
  };

const createPasswordValidationHandler =
  (passwordStateSetter: FieldStateSetFn<FieldState>, fields: AddressFields) =>
  (e: ChangeEvent<HTMLInputElement>) => {
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
        const field = fields.find(
          ({ entityId }) => entityId === Number(FieldNameToFieldId.password),
        );

        if (!isAddressOrAccountFormField(field)) {
          return;
        }

        const passwordFieldName = createFieldName(field, 'customer');
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
  createRadioButtonsValidationHandler,
  createPasswordValidationHandler,
  createCountryChangeHandler,
  createNumbersInputValidationHandler,
  createDatesValidationHandler,
  createPreSubmitPicklistValidationHandler,
};
