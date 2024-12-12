'use client';

import { AlertCircle, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ChangeEvent, MouseEvent, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'react-hot-toast';

import { ExistingResultType } from '~/client/util';
import {
  Checkboxes,
  createFieldName,
  DateField,
  FieldWrapper,
  getPreviouslySubmittedValue,
  MultilineText,
  NumbersOnly,
  Password,
  Picklist,
  RadioButtons,
} from '~/components/form-fields';
import {
  createDatesValidationHandler,
  createMultilineTextValidationHandler,
  createNumbersInputValidationHandler,
  createPasswordValidationHandler,
  createPreSubmitCheckboxesValidationHandler,
  createPreSubmitPicklistValidationHandler,
  createRadioButtonsValidationHandler,
  createTextInputValidationHandler,
} from '~/components/form-fields/shared/field-handlers';
import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';
import { Form, FormSubmit } from '~/components/ui/form';

import { updateCustomer } from '../_actions/update-customer';
import { getCustomerSettingsQuery } from '../page-data';

import { TextField } from './text-field';

type CustomerInfo = ExistingResultType<typeof getCustomerSettingsQuery>['customerInfo'];
type CustomerFields = ExistingResultType<typeof getCustomerSettingsQuery>['customerFields'];
type AddressFields = ExistingResultType<typeof getCustomerSettingsQuery>['addressFields'];

interface FormProps {
  addressFields: AddressFields;
  customerInfo: CustomerInfo;
  customerFields: CustomerFields;
}

interface SumbitMessages {
  messages: {
    submit: string;
    submitting: string;
  };
}

export enum FieldNameToFieldId {
  email = 1,
  firstName = 4,
  lastName,
}

type FieldUnionType = keyof typeof FieldNameToFieldId;

const isExistedField = (name: unknown): name is FieldUnionType => {
  if (typeof name === 'string' && name in FieldNameToFieldId) {
    return true;
  }

  return false;
};

const SubmitButton = ({ messages }: SumbitMessages) => {
  const { pending } = useFormStatus();

  return (
    <Button
      className="relative items-center px-8 py-2 md:w-fit"
      loading={pending}
      loadingText={messages.submitting}
      variant="primary"
    >
      {messages.submit}
    </Button>
  );
};

export const UpdateSettingsForm = ({ addressFields, customerFields, customerInfo }: FormProps) => {
  const form = useRef<HTMLFormElement>(null);

  const [textInputValid, setTextInputValid] = useState<Record<string, boolean>>({});
  const [multiTextValid, setMultiTextValid] = useState<Record<string, boolean>>({});
  const [numbersInputValid, setNumbersInputValid] = useState<Record<string, boolean>>({});
  const [radioButtonsValid, setRadioButtonsValid] = useState<Record<string, boolean>>({});
  const [picklistValid, setPicklistValid] = useState<Record<string, boolean>>({});
  const [checkboxesValid, setCheckboxesValid] = useState<Record<string, boolean>>({});
  const [datesValid, setDatesValid] = useState<Record<string, boolean>>({});
  const [passwordValid, setPasswordValid] = useState<Record<string, boolean>>({});

  const t = useTranslations('Account.Settings');

  const handleTextInputValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const fieldId = Number(e.target.id.split('-')[1]);

    const validityState = e.target.validity;
    const validationStatus = validityState.valueMissing || validityState.typeMismatch;

    setTextInputValid({ ...textInputValid, [fieldId]: !validationStatus });
  };
  const handleMultiTextValidation = createMultilineTextValidationHandler(
    setMultiTextValid,
    multiTextValid,
  );
  const handleNumbersInputValidation = createNumbersInputValidationHandler(
    setNumbersInputValid,
    numbersInputValid,
  );
  const handleDatesValidation = createDatesValidationHandler(setDatesValid, datesValid);
  const handleRadioButtonsChange = createRadioButtonsValidationHandler(
    setRadioButtonsValid,
    radioButtonsValid,
  );
  const validatePicklistFields = createPreSubmitPicklistValidationHandler(
    customerFields,
    setPicklistValid,
  );
  const validateCheckboxFields = createPreSubmitCheckboxesValidationHandler(
    customerFields,
    setCheckboxesValid,
  );
  const handlePasswordValidation = createPasswordValidationHandler(
    setPasswordValid,
    customerFields,
  );
  const handleCustomTextValidation = createTextInputValidationHandler(
    setTextInputValid,
    textInputValid,
  );
  const preSubmitFieldsValidation = (
    e: MouseEvent<HTMLFormElement> & { target: HTMLButtonElement },
  ) => {
    if (e.target.nodeName === 'BUTTON' && e.target.type === 'submit') {
      validatePicklistFields(form.current);
      validateCheckboxFields(form.current);
    }
  };

  const onSubmit = async (formData: FormData) => {
    const { status, message } = await updateCustomer(formData);

    if (status === 'error') {
      toast.error(message, {
        icon: <AlertCircle className="text-error-secondary" />,
      });

      return;
    }

    toast.success(message, {
      icon: <Check className="text-success-secondary" />,
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Form action={onSubmit} onClick={preSubmitFieldsValidation} ref={form}>
      <div className="mb-10 mt-8 grid grid-cols-1 gap-y-3 text-base lg:grid-cols-2 lg:gap-x-6">
        {addressFields.map((field) => {
          const fieldName = FieldNameToFieldId[field.entityId] ?? '';

          if (!isExistedField(fieldName)) {
            return null;
          }

          return (
            <TextField
              defaultValue={customerInfo[fieldName]}
              entityId={field.entityId}
              isRequired={field.isRequired}
              isValid={textInputValid[field.entityId]}
              key={field.entityId}
              label={field.label}
              name={createFieldName(field, 'address')}
              onChange={handleTextInputValidation}
            />
          );
        })}
        <div className="lg:col-span-2">
          <TextField
            defaultValue={customerInfo.email}
            entityId={FieldNameToFieldId.email}
            isRequired
            isValid={textInputValid[FieldNameToFieldId.email]}
            label={
              customerFields.find((field) => field.entityId === FieldNameToFieldId.email)?.label ??
              ''
            }
            name="customer-email"
            onChange={handleTextInputValidation}
            type="email"
          />
        </div>
        {customerFields
          .filter(({ isBuiltIn }) => !isBuiltIn)
          .map((field) => {
            const fieldId = field.entityId;
            const fieldName = createFieldName(field, 'customer');
            const previouslySubmittedField = customerInfo.formFields.find(
              ({ entityId: id }) => id === fieldId,
            );

            switch (field.__typename) {
              case 'NumberFormField': {
                const submittedValue =
                  getPreviouslySubmittedValue(previouslySubmittedField).NumberFormField;

                return (
                  <FieldWrapper fieldId={fieldId} key={fieldId}>
                    <NumbersOnly
                      defaultValue={submittedValue}
                      field={field}
                      isValid={numbersInputValid[fieldId]}
                      name={fieldName}
                      onChange={handleNumbersInputValidation}
                    />
                  </FieldWrapper>
                );
              }

              case 'CheckboxesFormField': {
                const submittedValue =
                  getPreviouslySubmittedValue(previouslySubmittedField).CheckboxesFormField;

                return (
                  <FieldWrapper fieldId={fieldId} key={fieldId}>
                    <Checkboxes
                      defaultValue={submittedValue}
                      field={field}
                      isValid={checkboxesValid[fieldId]}
                      name={fieldName}
                      onValidate={setCheckboxesValid}
                      options={field.options}
                    />
                  </FieldWrapper>
                );
              }

              case 'MultilineTextFormField': {
                const submittedValue =
                  getPreviouslySubmittedValue(previouslySubmittedField).MultilineTextFormField;

                return (
                  <FieldWrapper fieldId={fieldId} key={fieldId}>
                    <MultilineText
                      defaultValue={submittedValue}
                      field={field}
                      isValid={multiTextValid[fieldId]}
                      name={fieldName}
                      onChange={handleMultiTextValidation}
                    />
                  </FieldWrapper>
                );
              }

              case 'DateFormField': {
                const submittedValue =
                  getPreviouslySubmittedValue(previouslySubmittedField).DateFormField;

                return (
                  <FieldWrapper fieldId={fieldId} key={fieldId}>
                    <DateField
                      defaultValue={submittedValue}
                      field={field}
                      isValid={datesValid[fieldId]}
                      name={fieldName}
                      onChange={handleDatesValidation}
                      onValidate={setDatesValid}
                    />
                  </FieldWrapper>
                );
              }

              case 'RadioButtonsFormField': {
                const submittedValue =
                  getPreviouslySubmittedValue(previouslySubmittedField).MultipleChoiceFormField;

                return (
                  <FieldWrapper fieldId={fieldId} key={fieldId}>
                    <RadioButtons
                      defaultValue={submittedValue}
                      field={field}
                      isValid={radioButtonsValid[fieldId]}
                      name={fieldName}
                      onChange={handleRadioButtonsChange}
                    />
                  </FieldWrapper>
                );
              }

              case 'PicklistFormField': {
                const submittedValue =
                  getPreviouslySubmittedValue(previouslySubmittedField).MultipleChoiceFormField;

                return (
                  <FieldWrapper fieldId={fieldId} key={fieldId}>
                    <Picklist
                      defaultValue={submittedValue}
                      field={field}
                      isValid={picklistValid[fieldId]}
                      name={fieldName}
                      onValidate={setPicklistValid}
                      options={field.options}
                    />
                  </FieldWrapper>
                );
              }

              case 'TextFormField': {
                const submittedValue =
                  getPreviouslySubmittedValue(previouslySubmittedField).TextFormField;

                return (
                  <FieldWrapper fieldId={fieldId} key={fieldId}>
                    <TextField
                      defaultValue={submittedValue}
                      entityId={fieldId}
                      isRequired={field.isRequired}
                      isValid={textInputValid[fieldId]}
                      label={customerFields.find(({ entityId: id }) => id === fieldId)?.label ?? ''}
                      name={fieldName}
                      onChange={handleCustomTextValidation}
                      type="text"
                    />
                  </FieldWrapper>
                );
              }

              case 'PasswordFormField': {
                const submittedValue =
                  getPreviouslySubmittedValue(previouslySubmittedField).PasswordFormField;

                return (
                  <FieldWrapper fieldId={fieldId} key={fieldId}>
                    <Password
                      defaultValue={submittedValue}
                      field={field}
                      isValid={passwordValid[fieldId]}
                      name={fieldName}
                      onChange={handlePasswordValidation}
                    />
                  </FieldWrapper>
                );
              }

              default:
                return null;
            }
          })}
        <div className="mt-8 flex flex-col items-center md:flex-row md:flex-wrap md:justify-start lg:col-span-2">
          <FormSubmit asChild>
            <SubmitButton messages={{ submit: t('submit'), submitting: t('submitting') }} />
          </FormSubmit>
          <Button asChild className="mt-2 md:ms-4 md:mt-0 md:w-fit" variant="secondary">
            <Link href="/account">{t('cancel')}</Link>
          </Button>
          <Link
            className="mt-2 w-fit font-semibold text-primary hover:text-secondary md:ms-auto md:mt-0"
            href="/account/settings/change-password"
          >
            {t('changePassword')}
          </Link>
        </div>
      </div>
    </Form>
  );
};
