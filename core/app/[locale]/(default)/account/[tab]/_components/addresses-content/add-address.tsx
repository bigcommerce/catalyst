'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MouseEvent, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import ReCaptcha from 'react-google-recaptcha';

import {
  Checkboxes,
  createFieldName,
  DateField,
  FieldNameToFieldId,
  FieldWrapper,
  MultilineText,
  NumbersOnly,
  Picklist,
  PicklistOrText,
  RadioButtons,
  Text,
} from '~/app/[locale]/(default)/login/register-customer/_components/register-customer-form/fields';
import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';
import { Field, Form, FormSubmit } from '~/components/ui/form';
import { Message } from '~/components/ui/message';

import { addAddress } from '../../_actions/add-address';

import {
  createCountryChangeHandler,
  createDatesValidationHandler,
  createMultilineTextValidationHandler,
  createNumbersInputValidationHandler,
  createPreSubmitCheckboxesValidationHandler,
  createPreSubmitPicklistValidationHandler,
  createRadioButtonsValidationHandler,
  createTextInputValidationHandler,
} from './address-field-handlers';
import { NewAddressQueryResponseType } from './customer-new-address';

interface FormStatus {
  status: 'success' | 'error';
  message: string;
}

export type AddressFields = NonNullable<
  NewAddressQueryResponseType['site']['settings']
>['formFields']['shippingAddress'];

export type Countries = NonNullable<NewAddressQueryResponseType['geography']['countries']>;
type CountryCode = Countries[number]['code'];
type CountryStates = Countries[number]['statesOrProvinces'];

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
      className="relative items-center px-8 py-2 md:w-fit"
      loading={pending}
      loadingText={messages.submitting}
      variant="primary"
    >
      {messages.submit}
    </Button>
  );
};

interface AddAddressProps {
  addressFields: AddressFields;
  countries: Countries;
  defaultCountry: {
    id: number;
    code: CountryCode;
    states: CountryStates;
  };
  reCaptchaSettings?: {
    isEnabledOnStorefront: boolean;
    siteKey: string;
  };
}

export const AddAddress = ({
  addressFields,
  countries,
  defaultCountry,
  reCaptchaSettings,
}: AddAddressProps) => {
  const form = useRef<HTMLFormElement>(null);
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null);

  const reCaptchaRef = useRef<ReCaptcha>(null);
  const router = useRouter();
  const t = useTranslations('Account.Addresses');
  const [reCaptchaToken, setReCaptchaToken] = useState('');
  const [isReCaptchaValid, setReCaptchaValid] = useState(true);

  const [textInputValid, setTextInputValid] = useState<Record<string, boolean>>({});
  const [numbersInputValid, setNumbersInputValid] = useState<Record<string, boolean>>({});
  const [datesValid, setDatesValid] = useState<Record<string, boolean>>({});
  const [radioButtonsValid, setRadioButtonsValid] = useState<Record<string, boolean>>({});
  const [picklistValid, setPicklistValid] = useState<Record<string, boolean>>({});
  const [checkboxesValid, setCheckboxesValid] = useState<Record<string, boolean>>({});
  const [multiTextValid, setMultiTextValid] = useState<Record<string, boolean>>({});
  const [countryStates, setCountryStates] = useState(defaultCountry.states);

  const handleTextInputValidation = createTextInputValidationHandler(
    setTextInputValid,
    textInputValid,
  );
  const handleCountryChange = createCountryChangeHandler(setCountryStates, countries);
  const handleNumbersInputValidation = createNumbersInputValidationHandler(
    setNumbersInputValid,
    numbersInputValid,
  );
  const handleDatesValidation = createDatesValidationHandler(setDatesValid, datesValid);
  const handleRadioButtonsChange = createRadioButtonsValidationHandler(
    setRadioButtonsValid,
    radioButtonsValid,
  );
  const handleMultiTextValidation = createMultilineTextValidationHandler(
    setMultiTextValid,
    multiTextValid,
  );
  const validatePicklistFields = createPreSubmitPicklistValidationHandler(
    addressFields,
    setPicklistValid,
  );
  const validateCheckboxFields = createPreSubmitCheckboxesValidationHandler(
    addressFields,
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
    if (reCaptchaSettings?.isEnabledOnStorefront && !reCaptchaToken) {
      setReCaptchaValid(false);

      return;
    }

    setReCaptchaValid(true);

    const submit = await addAddress({ formData, reCaptchaToken });

    if (submit.status === 'success') {
      form.current?.reset();
      setFormStatus({
        status: 'success',
        message: t('successMessage'),
      });

      setTimeout(() => {
        router.replace('/account/addresses');
      }, 3000);
    }

    if (submit.status === 'error') {
      setFormStatus({ status: 'error', message: submit.message || '' });
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {formStatus && (
        <Message className="mx-auto mb-8 w-full" variant={formStatus.status}>
          <p>{formStatus.message}</p>
        </Message>
      )}
      <Form action={onSubmit} onClick={preSubmitFieldsValidation} ref={form}>
        <div className="grid grid-cols-1 gap-y-6 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-2">
          {addressFields.map((field) => {
            const fieldId = field.entityId;
            const fieldName = createFieldName(field, 'address');

            switch (field.__typename) {
              case 'TextFormField': {
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
                const isCountrySelector = fieldId === FieldNameToFieldId.countryCode;
                const picklistOptions = isCountrySelector
                  ? countries.map(({ name, code }) => ({ label: name, entityId: code }))
                  : field.options;
                const defaultMultipleChoiceValue = isCountrySelector
                  ? defaultCountry.code
                  : undefined;

                return (
                  <FieldWrapper fieldId={fieldId} key={fieldId}>
                    <Picklist
                      defaultValue={defaultMultipleChoiceValue}
                      field={field}
                      isValid={picklistValid[fieldId]}
                      name={fieldName}
                      onChange={
                        fieldId === FieldNameToFieldId.countryCode ? handleCountryChange : undefined
                      }
                      onValidate={setPicklistValid}
                      options={picklistOptions}
                    />
                  </FieldWrapper>
                );
              }

              case 'PicklistOrTextFormField':
                return (
                  <FieldWrapper fieldId={fieldId} key={fieldId}>
                    <PicklistOrText
                      defaultValue={
                        fieldId === FieldNameToFieldId.stateOrProvince
                          ? countryStates[0]?.name
                          : undefined
                      }
                      field={field}
                      name={fieldName}
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

        <div className="mt-8 flex flex-col justify-stretch gap-2 md:flex-row md:justify-start md:gap-6">
          <FormSubmit asChild>
            <SubmitButton messages={{ submit: t('submit'), submitting: t('submitting') }} />
          </FormSubmit>
          <Button asChild className="items-center px-8 md:w-fit" variant="secondary">
            <Link href="/account/addresses">{t('cancel')}</Link>
          </Button>
        </div>
      </Form>
    </>
  );
};
