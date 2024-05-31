'use client';

import { useTranslations } from 'next-intl';
import { ChangeEvent, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import ReCaptcha from 'react-google-recaptcha';

import {
  createFieldName,
  DateField,
  FieldWrapper,
  NumbersOnly,
} from '~/app/[locale]/(default)/login/register-customer/_components/register-customer-form/fields';
import { ExistingResultType } from '~/client/util';
import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';
import { Field, Form, FormSubmit } from '~/components/ui/form';
import { Message } from '~/components/ui/message';

import {
  createDatesValidationHandler,
  createNumbersInputValidationHandler,
} from '../../addresses/_components/address-field-handlers';
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
  reCaptchaSettings?: {
    isEnabledOnStorefront: boolean;
    siteKey: string;
  };
}

interface FormStatus {
  status: 'success' | 'error';
  message: string;
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
  company,
  phone,
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

export const UpdateSettingsForm = ({
  addressFields,
  customerFields,
  customerInfo,
  reCaptchaSettings,
}: FormProps) => {
  const form = useRef<HTMLFormElement>(null);
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null);

  const [textInputValid, setTextInputValid] = useState<Record<string, boolean>>({});
  const [numbersInputValid, setNumbersInputValid] = useState<Record<string, boolean>>({});
  const [datesValid, setDatesValid] = useState<Record<string, boolean>>({});

  const reCaptchaRef = useRef<ReCaptcha>(null);
  const [reCaptchaToken, setReCaptchaToken] = useState('');
  const [isReCaptchaValid, setReCaptchaValid] = useState(true);

  const t = useTranslations('Account.Settings');

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
  const handleDatesValidation = createDatesValidationHandler(setDatesValid, datesValid);

  const onReCaptchaChange = (token: string | null) => {
    if (!token) {
      setReCaptchaValid(false);

      return;
    }

    setReCaptchaToken(token);
    setReCaptchaValid(true);
  };

  const onSubmit = async (formData: FormData) => {
    if (reCaptchaSettings?.isEnabledOnStorefront && !reCaptchaToken) {
      setReCaptchaValid(false);

      return;
    }

    setReCaptchaValid(true);

    const submit = await updateCustomer({ formData, reCaptchaToken });

    if (submit.status === 'success') {
      setFormStatus({
        status: 'success',
        message: t('successMessage', {
          firstName: submit.data?.firstName,
          lastName: submit.data?.lastName,
        }),
      });
    }

    if (submit.status === 'error') {
      setFormStatus({ status: 'error', message: submit.error ?? '' });
    }
  };

  return (
    <>
      {formStatus && (
        <Message className="mx-auto" variant={formStatus.status}>
          <p>{formStatus.message}</p>
        </Message>
      )}
      <Form action={onSubmit} ref={form}>
        <div className="mb-10 mt-8 grid grid-cols-1 gap-y-6 text-base lg:grid-cols-2 lg:gap-x-6 lg:gap-y-2">
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
              isValid={textInputValid.email}
              label={
                customerFields.find((field) => field.entityId === FieldNameToFieldId.email)
                  ?.label ?? ''
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
              const previouslySubmittedField = customerInfo.formFields.find(
                ({ entityId: id }) => id === fieldId,
              );

              switch (field.__typename) {
                case 'NumberFormField': {
                  const submittedValue =
                    previouslySubmittedField?.__typename === 'NumberFormFieldValue'
                      ? previouslySubmittedField.number
                      : undefined;

                  return (
                    <FieldWrapper fieldId={fieldId} key={fieldId}>
                      <NumbersOnly
                        defaultValue={submittedValue}
                        field={field}
                        isValid={numbersInputValid[fieldId]}
                        name={createFieldName(field, 'customer')}
                        onChange={handleNumbersInputValidation}
                      />
                    </FieldWrapper>
                  );
                }

                case 'DateFormField': {
                  const submittedValue =
                    previouslySubmittedField?.__typename === 'DateFormFieldValue'
                      ? previouslySubmittedField.date.utc
                      : undefined;

                  return (
                    <FieldWrapper fieldId={fieldId} key={fieldId}>
                      <DateField
                        defaultValue={submittedValue}
                        field={field}
                        isValid={datesValid[fieldId]}
                        name={createFieldName(field, 'customer')}
                        onChange={handleDatesValidation}
                        onValidate={setDatesValid}
                      />
                    </FieldWrapper>
                  );
                }

                case 'TextFormField': {
                  const submittedValue =
                    previouslySubmittedField?.__typename === 'TextFormFieldValue'
                      ? previouslySubmittedField.text
                      : undefined;

                  return (
                    <FieldWrapper fieldId={fieldId} key={fieldId}>
                      <TextField
                        defaultValue={submittedValue}
                        entityId={FieldNameToFieldId.email}
                        isValid={textInputValid[fieldId]}
                        label={
                          customerFields.find(({ entityId: id }) => id === fieldId)?.label ?? ''
                        }
                        name={createFieldName(field, 'address')}
                        onChange={handleTextInputValidation}
                        type="text"
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
          <div className="mt-8 flex flex-col items-center md:flex-row md:flex-wrap md:justify-start lg:col-span-2">
            <FormSubmit asChild>
              <SubmitButton messages={{ submit: t('submit'), submitting: t('submitting') }} />
            </FormSubmit>
            <Button asChild className="mt-2 md:ms-4 md:mt-0 md:w-fit" variant="secondary">
              <Link href="/account">{t('cancel')}</Link>
            </Button>
            <Link
              className="mt-2 w-fit font-semibold text-primary hover:text-secondary md:ms-auto md:mt-0"
              href={{
                pathname: '/account/settings',
                query: { action: 'change_password' },
              }}
            >
              {t('changePassword')}
            </Link>
          </div>
        </div>
      </Form>
    </>
  );
};
