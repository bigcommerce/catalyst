'use client';

import { useTranslations } from 'next-intl';
import { ChangeEvent, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import ReCaptcha from 'react-google-recaptcha';

import { getRegisterCustomerQuery } from '~/app/[locale]/(default)/login/register-customer/page-data';
import { Button } from '~/components/ui/button';
import { Field, Form, FormSubmit } from '~/components/ui/form';
import { Message } from '~/components/ui/message';

import { login } from './_actions/login';
import { registerCustomer } from './_actions/register-customer';
import {
  createFieldName,
  CUSTOMER_FIELDS_TO_EXCLUDE,
  FieldNameToFieldId,
  FieldWrapper,
  Password,
  Picklist,
  PicklistOrText,
  Text,
} from './fields';

interface FormStatus {
  status: 'success' | 'error';
  message: string;
}

export type CustomerFields = NonNullable<
  Awaited<ReturnType<typeof getRegisterCustomerQuery>>
>['customerFields'];
export type AddressFields = NonNullable<
  Awaited<ReturnType<typeof getRegisterCustomerQuery>>
>['addressFields'];
type Countries = NonNullable<Awaited<ReturnType<typeof getRegisterCustomerQuery>>>['countries'];
type CountryCode = Countries[number]['code'];
type CountryStates = Countries[number]['statesOrProvinces'];

interface RegisterCustomerProps {
  addressFields: AddressFields;
  countries: Countries;
  customerFields: CustomerFields;
  defaultCountry: {
    entityId: number;
    code: CountryCode;
    states: CountryStates;
  };
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
  countries,
  customerFields,
  defaultCountry,
  reCaptchaSettings,
}: RegisterCustomerProps) => {
  const form = useRef<HTMLFormElement>(null);
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null);

  const [textInputValid, setTextInputValid] = useState<Record<string, boolean>>({});
  const [passwordValid, setPassswordValid] = useState<Record<string, boolean>>({
    [FieldNameToFieldId.password]: true,
    [FieldNameToFieldId.confirmPassword]: true,
  });

  const [countryStates, setCountryStates] = useState(defaultCountry.states);

  const reCaptchaRef = useRef<ReCaptcha>(null);
  const [reCaptchaToken, setReCaptchaToken] = useState('');
  const [isReCaptchaValid, setReCaptchaValid] = useState(true);

  const t = useTranslations('Account.Register');

  const handleTextInputValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const fieldId = Number(e.target.id.split('-')[1]);

    const validityState = e.target.validity;
    const validationStatus = validityState.valueMissing || validityState.typeMismatch;

    setTextInputValid({ ...textInputValid, [fieldId]: !validationStatus });
  };

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

        const passwordFieldName = createFieldName('customer', FieldNameToFieldId.password);
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

  const handleCountryChange = (value: string) => {
    const states = countries.find(({ code }) => code === value)?.statesOrProvinces;

    setCountryStates(states ?? []);
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
        message: t('equalPasswordValidatoinMessage'),
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
      form.current?.reset();
      setFormStatus({
        status: 'success',
        message: t('successMessage', {
          firstName: submit.data?.firstName,
          lastName: submit.data?.lastName,
        }),
      });

      setTimeout(() => {
        void login(formData.get('customer-email'), formData.get('customer-password'));
      }, 3000);
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
      <Form action={onSubmit} ref={form}>
        <div className="mb-6 grid grid-cols-1 gap-y-6 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-2">
          {customerFields
            .filter((field) => !CUSTOMER_FIELDS_TO_EXCLUDE.includes(field.entityId))
            .map((field) => {
              switch (field.__typename) {
                case 'TextFormField':
                  return (
                    <FieldWrapper fieldId={field.entityId} key={field.entityId}>
                      <Text
                        field={field}
                        isValid={textInputValid[field.entityId]}
                        name={createFieldName('customer', field.entityId)}
                        onChange={handleTextInputValidation}
                        type={FieldNameToFieldId[field.entityId]}
                      />
                    </FieldWrapper>
                  );

                case 'PasswordFormField': {
                  return (
                    <FieldWrapper fieldId={field.entityId} key={field.entityId}>
                      <Password
                        field={field}
                        isValid={passwordValid[field.entityId]}
                        name={createFieldName('customer', field.entityId)}
                        onChange={handlePasswordValidation}
                      />
                    </FieldWrapper>
                  );
                }

                default:
                  return null;
              }
            })}
        </div>
        <div className="grid grid-cols-1 gap-y-6 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-2">
          {addressFields.map((field) => {
            switch (field.__typename) {
              case 'TextFormField':
                return (
                  <FieldWrapper fieldId={field.entityId} key={field.entityId}>
                    <Text
                      field={field}
                      isValid={textInputValid[field.entityId]}
                      name={createFieldName('address', field.entityId)}
                      onChange={handleTextInputValidation}
                    />
                  </FieldWrapper>
                );

              case 'PicklistFormField':
                return (
                  <FieldWrapper fieldId={field.entityId} key={field.entityId}>
                    <Picklist
                      defaultValue={
                        field.entityId === FieldNameToFieldId.countryCode
                          ? defaultCountry.code
                          : undefined
                      }
                      field={field}
                      name={createFieldName('address', field.entityId)}
                      onChange={
                        field.entityId === FieldNameToFieldId.countryCode
                          ? handleCountryChange
                          : undefined
                      }
                      options={countries.map(({ code, name }) => {
                        return { entityId: code, label: name };
                      })}
                    />
                  </FieldWrapper>
                );

              case 'PicklistOrTextFormField':
                return (
                  <FieldWrapper fieldId={field.entityId} key={field.entityId}>
                    <PicklistOrText
                      defaultValue={
                        field.entityId === FieldNameToFieldId.stateOrProvince
                          ? countryStates[0]?.name
                          : undefined
                      }
                      field={field}
                      name={createFieldName('address', field.entityId)}
                      options={countryStates.map(({ name }) => {
                        return { entityId: name, label: name };
                      })}
                    />
                  </FieldWrapper>
                );

              default:
                return null;
            }
          })}
          {reCaptchaSettings?.isEnabledOnStorefront && (
            <Field className="relative col-span-full max-w-full space-y-2 pb-7" name="ReCAPTCHA">
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
