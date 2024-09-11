import { FragmentOf } from 'gql.tada';
import { ChangeEvent } from 'react';

import { createFieldName, FieldNameToFieldId } from '~/components/form-fields';

import { FormFieldsFragment } from '../fragment';

type FormFields = Array<FragmentOf<typeof FormFieldsFragment>>;

type FieldState = Record<string, boolean>;

export const isAddressOrAccountFormField = (field: unknown): field is FormFields[number] => {
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

export type FieldStateSetFn<Type> = (state: Type | ((prevState: Type) => Type)) => void;

const createPreSubmitPicklistValidationHandler = (
  formFields: FormFields,
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
            /^custom_(address|customer)-multipleChoices-\d+/.test(fieldEntry[0]) &&
            typeof fieldEntry[1] === 'string',
        )
        .map(([picklistKey, picklistValue]: [string, string]) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const fieldId = picklistKey.split('-')[2]!;

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

const createPreSubmitCheckboxesValidationHandler = (
  formFields: FormFields,
  validitationSetter: FieldStateSetFn<FieldState>,
) => {
  const checkboxes = formFields.filter(
    ({ __typename: type, isBuiltIn, isRequired }) =>
      type === 'CheckboxesFormField' && !isBuiltIn && isRequired,
  );

  return (form: HTMLFormElement | null) => {
    if (!form) return;

    const checkboxesFormFields = Object.fromEntries(
      [...new FormData(form).entries()]
        .filter(
          (fieldEntry): fieldEntry is [string, string] =>
            /^custom_(address|customer)-checkboxes-\d+/.test(fieldEntry[0]) &&
            typeof fieldEntry[1] === 'string',
        )
        .map(([checkboxKey, checkboxValue]: [string, string]) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const fieldId = checkboxKey.split('-')[2]!;

          return [fieldId, checkboxValue];
        }),
    );

    checkboxes.forEach(({ entityId: checkboxId }) => {
      const checkboxIdList = Object.keys(checkboxesFormFields);

      if (checkboxes.length > 0 && checkboxIdList.length === 0) {
        validitationSetter((prevValidationState) => ({
          ...prevValidationState,
          [checkboxId]: false,
        }));
      }

      if (checkboxIdList.includes(checkboxId.toString())) {
        const currentValue = checkboxesFormFields[checkboxId];

        validitationSetter((prevValidationState) => ({
          ...prevValidationState,
          [checkboxId]: (currentValue && currentValue.length > 0) || false,
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

const createMultilineTextValidationHandler =
  (multiTextStateSetter: FieldStateSetFn<FieldState>, multiTextState: FieldState) =>
  (e: ChangeEvent<HTMLTextAreaElement>) => {
    const fieldId = Number(e.target.id.split('-')[1]);
    const validityState = e.target.validity;

    multiTextStateSetter({ ...multiTextState, [fieldId]: !validityState.valueMissing });
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
    const fieldId = Number(e.target.name.split('-')[2]);
    const { valueMissing } = e.target.validity;

    radioButtonsStateSetter({ ...radioButtonsState, [fieldId]: !valueMissing });
  };

const createDatesValidationHandler =
  (dateStateSetter: FieldStateSetFn<FieldState>, dateFieldState: FieldState) =>
  (e: React.ChangeEvent<HTMLInputElement> & { nativeEvent: { inputType: string } }) => {
    const fieldId = Number(e.target.id.split('-')[2]);
    const validationStatus = e.target.validity.valueMissing;

    // cancel validation on attempt to delete input content via keyboard since
    // DayPicker won't allow the user to unselect the selected date when it's required
    if (e.nativeEvent.inputType === 'deleteContentBackward') {
      return;
    }

    dateStateSetter({ ...dateFieldState, [fieldId]: !validationStatus });
  };

const createPasswordValidationHandler =
  (passwordStateSetter: FieldStateSetFn<FieldState>, fields: FormFields) =>
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

export {
  createTextInputValidationHandler,
  createMultilineTextValidationHandler,
  createPicklistOrTextValidationHandler,
  createRadioButtonsValidationHandler,
  createPasswordValidationHandler,
  createNumbersInputValidationHandler,
  createDatesValidationHandler,
  createPreSubmitPicklistValidationHandler,
  createPreSubmitCheckboxesValidationHandler,
};
