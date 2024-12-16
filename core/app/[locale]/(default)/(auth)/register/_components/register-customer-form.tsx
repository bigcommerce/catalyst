'use client';

import { useTranslations } from 'next-intl';
import { ChangeEvent, MouseEvent, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';

import { useAccountStatusContext } from '~/app/[locale]/(default)/account/(tabs)/_components/account-status-provider';
import { ExistingResultType } from '~/client/util';
import {
  createFieldName,
  CUSTOMER_FIELDS_TO_EXCLUDE,
  FieldNameToFieldId,
  FieldWrapper,
  Password,
  Text,
} from '~/components/form-fields';
import {
  createDatesValidationHandler,
  createMultilineTextValidationHandler,
  createNumbersInputValidationHandler,
  createPreSubmitCheckboxesValidationHandler,
  createPreSubmitPicklistValidationHandler,
  createRadioButtonsValidationHandler,
} from '~/components/form-fields/shared/field-handlers';
import { Button } from '~/components/ui/button';
import { Checkbox, Field, Form, FormSubmit, Label } from '~/components/ui/form';
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
}

interface SubmitMessages {
  messages: {
    submit: string;
    submitting: string;
  };
}

const SubmitButton = ({ messages }: SubmitMessages) => {
  const { pending } = useFormStatus();

  return (
    <Button
      className="create-account-button relative mt-8 w-fit items-center !bg-[#008BB7] px-8 py-2"
      loading={pending}
      loadingText={messages.submitting}
      variant="primary"
    >
      {messages.submit}
    </Button>
  );
};

export const RegisterCustomerForm = ({ addressFields, customerFields }: RegisterCustomerProps) => {
  const form = useRef<HTMLFormElement>(null);
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null);

  const [textInputValid, setTextInputValid] = useState<Record<string, boolean>>({});
  const [passwordValid, setPasswordValid] = useState<Record<string, boolean>>({
    [FieldNameToFieldId.password]: true,
  });
  const [numbersInputValid, setNumbersInputValid] = useState<Record<string, boolean>>({});
  const [datesValid, setDatesValid] = useState<Record<string, boolean>>({});
  const [radioButtonsValid, setRadioButtonsValid] = useState<Record<string, boolean>>({});
  const [picklistValid, setPicklistValid] = useState<Record<string, boolean>>({});
  const [checkboxesValid, setCheckboxesValid] = useState<Record<string, boolean>>({});
  const [multiTextValid, setMultiTextValid] = useState<Record<string, boolean>>({});

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
    setPasswordValid((prevState) => ({
      ...prevState,
      [fieldId]: !e.target.validity.valueMissing,
    }));
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

  const onSubmit = async (formData: FormData) => {
    const submit = await registerCustomer(null, formData);

    if (submit.status === 'success') {
      setAccountState({ status: 'success' });
      await login(null, formData);
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
        <Message className="mb-8 rounded-[3px] border border-[#ff4500]" variant={formStatus.status}>
          <p>{formStatus.message}</p>
        </Message>
      )}
      <Form
        action={onSubmit}
        onClick={preSubmitFieldsValidation}
        ref={form}
        className="register-form mx-auto max-w-[600px] sm:pt-3 md:pt-3"
      >
        <div className="block grid-cols-1 gap-y-3 lg:grid-cols-2 lg:gap-x-6">
          {customerFields
            .filter((field) => !CUSTOMER_FIELDS_TO_EXCLUDE.includes(field.entityId))
            .filter((field) => FieldNameToFieldId[field.entityId] !== 'confirmPassword')
            .filter((field) => field.label !== 'Tax ID / Licence#')
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

                default:
                  return null;
              }
            })}
        </div>

        <div className="grid-cols-1 gap-y-3 lg:grid-cols-2 lg:gap-x-6">
          {addressFields.map((field) => {
            const fieldId = field.entityId;
            const fieldName = createFieldName(field, 'address');
            if (field.label === 'First Name' || field.label === 'Last Name') {
              switch (field.__typename) {
                case 'TextFormField':
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

                default:
                  return null;
              }
            }
            return null;
          })}
        </div>

        <FormSubmit asChild>
          <SubmitButton messages={{ submit: t('submit'), submitting: t('submitting') }} />
        </FormSubmit>

        <div className="remember-forgot-div mt-5">
          <Field
            className="relative mt-2 inline-flex w-full items-center space-y-2"
            name="remember-me"
          >
            <Checkbox
              aria-labelledby="remember-me"
              className="border-[#008bb7]"
              id="remember-me"
              name="remember-me"
              value="1"
            />
            <div className="mt-0 flex w-full justify-between gap-1 lg:justify-start">
              <Label
                className="ml-2 mt-0 w-[15em] cursor-pointer space-y-2 pb-2 pl-1 text-left text-sm font-normal leading-6 tracking-[0.25px] md:my-0 md:w-auto"
                htmlFor="remember-me"
                id="remember-me"
              >
                Keep me informed on sales, news, and special offers
              </Label>

              >
              <Link href="#"><a
                className="ml-2 text-center text-sm font-normal leading-6 tracking-tight text-[#008BB7]">
                Privacy Policy
              </a>
              </Link>
            </div>
          </Field>
        </div>

        <div className="mb-2 mt-2 md:mb-[30px] md:mt-[45px]">
          <Link href="/login">
          <a className="font-open-sans cursor-pointer text-left text-[20px] font-medium leading-8 tracking-[0.15px] text-[#353535] md:text-lg">
            Sign in With an Existing Account
          </a>
          </Link>
        </div>
      </Form>
    </>
  );
};
