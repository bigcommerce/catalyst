'use client';

import { useTranslations } from 'next-intl';
import { ChangeEvent, MouseEvent, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import ReCaptcha from 'react-google-recaptcha';

import { useAccountStatusContext } from '~/app/[locale]/(default)/account/(tabs)/_components/account-status-provider';
import { ExistingResultType } from '~/client/util';
import {
  Checkboxes,
  createFieldName,
  CUSTOMER_FIELDS_TO_EXCLUDE,
  DateField,
  FieldNameToFieldId,
  FieldWrapper,
  FULL_NAME_FIELDS,
  MultilineText,
  NumbersOnly,
  Password,
  Picklist,
  RadioButtons,
  Text,
} from '~/components/form-fields';
import {
  createDatesValidationHandler,
  createMultilineTextValidationHandler,
  createNumbersInputValidationHandler,
  createPreSubmitCheckboxesValidationHandler,
  createPreSubmitPicklistValidationHandler,
  createRadioButtonsValidationHandler,
  isAddressOrAccountFormField,
} from '~/components/form-fields/shared/field-handlers';
import { Button } from '~/components/ui/button';
import { Field, Form, FormSubmit } from '~/components/ui/form';
import { Message } from '~/components/ui/message';

import { login } from '../_actions/login';
import { registerCustomer } from '../_actions/register-customer';
import { getRegisterCustomerQuery } from '../page-data';

interface FormStatus {
  status: 'success' | 'error';
  message: string;
}

type CustomerFields = ExistingResultType<typeof getRegisterCustomerQuery>['customerFields'];
type AddressFields = ExistingResultType<typeof getRegisterCustomerQuery>['addressFields'];

interface RegisterCustomerProps {
  addressFields: AddressFields;
  customerFields: CustomerFields;
  reCaptchaSettings?: {
    isEnabledOnStorefront: boolean;
    siteKey: string;
  };
}

interface SumbitMessages {
  messages: {
    submit: string;
    submitting: string;
  };
}

const SubmitButton = ({ messages }: SumbitMessages) => {
  const { pending } = useFormStatus();

  return (
    <Button
      className="relative mt-8 w-fit items-center px-8 py-2"
      loading={pending}
      loadingText={messages.submitting}
      variant="primary"
    >
      {messages.submit}
    </Button>
  );
};

export const RegisterCustomerForm = ({
  addressFields,
  customerFields,
  reCaptchaSettings,
}: RegisterCustomerProps) => {
  const form = useRef<HTMLFormElement>(null);
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null);

  const [textInputValid, setTextInputValid] = useState<Record<string, boolean>>({});
  const [passwordValid, setPassswordValid] = useState<Record<string, boolean>>({
    [FieldNameToFieldId.password]: true,
    [FieldNameToFieldId.confirmPassword]: true,
  });
  const [numbersInputValid, setNumbersInputValid] = useState<Record<string, boolean>>({});
  const [datesValid, setDatesValid] = useState<Record<string, boolean>>({});
  const [radioButtonsValid, setRadioButtonsValid] = useState<Record<string, boolean>>({});
  const [picklistValid, setPicklistValid] = useState<Record<string, boolean>>({});
  const [checkboxesValid, setCheckboxesValid] = useState<Record<string, boolean>>({});
  const [multiTextValid, setMultiTextValid] = useState<Record<string, boolean>>({});

  const reCaptchaRef = useRef<ReCaptcha>(null);
  const [reCaptchaToken, setReCaptchaToken] = useState('');
  const [isReCaptchaValid, setReCaptchaValid] = useState(true);

  const { setAccountState } = useAccountStatusContext();

  const t = useTranslations('Register.Form');

  const handleTextInputValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const fieldId = Number(e.target.id.split('-')[1]);

    const validityState = e.target.validity;
    const validationStatus = validityState.valueMissing || validityState.typeMismatch;

    setTextInputValid({ ...textInputValid, [fieldId]: !validationStatus });
  };
  const handleNumbersInputValidation = createNumbersInputValidationHandler(
    setNumbersInputValid,
    numbersInputValid,
  );
  const handleMultiTextValidation = createMultilineTextValidationHandler(
    setMultiTextValid,
    multiTextValid,
  );
  const handleDatesValidation = createDatesValidationHandler(setDatesValid, datesValid);
  const handlePasswordValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const fieldId = e.target.id.split('-')[1] ?? '';

    switch (FieldNameToFieldId[Number(fieldId)]) {
      case 'password': {
        setPassswordValid((prevState) => ({
          ...prevState,
          [fieldId]: !e.target.validity.valueMissing,
        }));

        return;
      }

      case 'confirmPassword': {
        const confirmPassword = e.target.value;
        const field = customerFields.find(
          ({ entityId }) => entityId === Number(FieldNameToFieldId.password),
        );

        if (!isAddressOrAccountFormField(field)) {
          return;
        }

        const passwordFieldName = createFieldName(field, 'customer');
        const password = new FormData(e.target.form ?? undefined).get(passwordFieldName);

        setPassswordValid((prevState) => ({
          ...prevState,
          [fieldId]: password === confirmPassword && !e.target.validity.valueMissing,
        }));

        return;
      }

      default: {
        setPassswordValid((prevState) => ({
          ...prevState,
          [fieldId]: !e.target.validity.valueMissing,
        }));
      }
    }
  };

  const handleRadioButtonsChange = createRadioButtonsValidationHandler(
    setRadioButtonsValid,
    radioButtonsValid,
  );
  const validatePicklistFields = createPreSubmitPicklistValidationHandler(
    [...customerFields, ...addressFields],
    setPicklistValid,
  );
  const validateCheckboxFields = createPreSubmitCheckboxesValidationHandler(
    [...customerFields, ...addressFields],
    setCheckboxesValid,
  );
  const preSubmitFieldsValidation = (
    e: MouseEvent<HTMLFormElement> & { target: HTMLButtonElement },
  ) => {
    if (e.target.nodeName === 'BUTTON' && e.target.type === 'submit') {
      validatePicklistFields(form.current);
      validateCheckboxFields(form.current);
    }
  };

  const onReCaptchaChange = (token: string | null) => {
    if (!token) {
      setReCaptchaValid(false);

      return;
    }

    setReCaptchaToken(token);
    setReCaptchaValid(true);
  };

  const onSubmit = async (formData: FormData) => {
    if (formData.get('customer-password') !== formData.get('customer-confirmPassword')) {
      setFormStatus({
        status: 'error',
        message: t('confirmPassword'),
      });

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      return;
    }

    if (reCaptchaSettings?.isEnabledOnStorefront && !reCaptchaToken) {
      setReCaptchaValid(false);

      return;
    }

    setReCaptchaValid(true);

    const submit = await registerCustomer({ formData, reCaptchaToken });

    if (submit.status === 'success') {
      setAccountState({ status: 'success' });

      await login(formData);
    }

    if (submit.status === 'error') {
      setFormStatus({ status: 'error', message: submit.error ?? '' });
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {formStatus && (
        <Message className="mb-8" variant={formStatus.status}>
          <p>{formStatus.message}</p>
        </Message>
      )}
      <Form action={onSubmit} onClick={preSubmitFieldsValidation} ref={form}>
        <div className="grid grid-cols-1 gap-y-3 lg:grid-cols-2 lg:gap-x-6">
          {addressFields.map((field) => {
            const fieldId = field.entityId;
            const fieldName = createFieldName(field, 'customer');

            if (field.__typename === 'TextFormField' && FULL_NAME_FIELDS.includes(fieldId)) {
              return (
                <FieldWrapper fieldId={fieldId} key={fieldId}>
                  <Text
                    field={field}
                    isValid={textInputValid[fieldId]}
                    name={fieldName}
                    onChange={handleTextInputValidation}
                  />
                </FieldWrapper>
              );
            }

            return null;
          })}
        </div>
        <div className="mb-4 grid grid-cols-1 gap-y-3 lg:grid-cols-2 lg:gap-x-6">
          {customerFields
            .filter((field) => !CUSTOMER_FIELDS_TO_EXCLUDE.includes(field.entityId))
            .map((field) => {
              const fieldId = field.entityId;
              const fieldName = createFieldName(field, 'customer');

              switch (field.__typename) {
                case 'TextFormField':
                  return (
                    <FieldWrapper fieldId={fieldId} key={fieldId}>
                      <Text
                        field={field}
                        isValid={textInputValid[fieldId]}
                        name={fieldName}
                        onChange={handleTextInputValidation}
                        type={FieldNameToFieldId[fieldId]}
                      />
                    </FieldWrapper>
                  );

                case 'PasswordFormField':
                  return (
                    <FieldWrapper fieldId={fieldId} key={fieldId}>
                      <Password
                        field={field}
                        isValid={passwordValid[fieldId]}
                        name={fieldName}
                        onChange={handlePasswordValidation}
                      />
                    </FieldWrapper>
                  );

                case 'MultilineTextFormField': {
                  return (
                    <FieldWrapper fieldId={fieldId} key={fieldId}>
                      <MultilineText
                        field={field}
                        isValid={multiTextValid[fieldId]}
                        name={fieldName}
                        onChange={handleMultiTextValidation}
                      />
                    </FieldWrapper>
                  );
                }

                case 'NumberFormField': {
                  return (
                    <FieldWrapper fieldId={fieldId} key={fieldId}>
                      <NumbersOnly
                        field={field}
                        isValid={numbersInputValid[fieldId]}
                        name={fieldName}
                        onChange={handleNumbersInputValidation}
                      />
                    </FieldWrapper>
                  );
                }

                case 'DateFormField': {
                  return (
                    <FieldWrapper fieldId={fieldId} key={fieldId}>
                      <DateField
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
                  return (
                    <FieldWrapper fieldId={fieldId} key={fieldId}>
                      <RadioButtons
                        field={field}
                        isValid={radioButtonsValid[fieldId]}
                        name={fieldName}
                        onChange={handleRadioButtonsChange}
                      />
                    </FieldWrapper>
                  );
                }

                case 'PicklistFormField': {
                  return (
                    <FieldWrapper fieldId={fieldId} key={fieldId}>
                      <Picklist
                        field={field}
                        isValid={picklistValid[fieldId]}
                        name={fieldName}
                        onValidate={setPicklistValid}
                        options={field.options}
                      />
                    </FieldWrapper>
                  );
                }

                case 'CheckboxesFormField': {
                  return (
                    <FieldWrapper fieldId={fieldId} key={fieldId}>
                      <Checkboxes
                        field={field}
                        isValid={checkboxesValid[fieldId]}
                        name={fieldName}
                        onValidate={setCheckboxesValid}
                        options={field.options}
                      />
                    </FieldWrapper>
                  );
                }

                default:
                  return null;
              }
            })}
          {reCaptchaSettings?.isEnabledOnStorefront && (
            <Field className="relative col-span-full max-w-full space-y-2 pb-7" name="ReCAPTCHA">
              {/* https://github.com/dozoisch/react-google-recaptcha/issues/277 */}
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-expect-error */}
              <ReCaptcha
                onChange={onReCaptchaChange}
                ref={reCaptchaRef}
                sitekey={reCaptchaSettings.siteKey}
              />
              {!isReCaptchaValid && (
                <span className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-error">
                  {t('recaptchaText')}
                </span>
              )}
            </Field>
          )}
        </div>

        <FormSubmit asChild>
          <SubmitButton messages={{ submit: t('submit'), submitting: t('submitting') }} />
        </FormSubmit>
      </Form>
    </>
  );
};
