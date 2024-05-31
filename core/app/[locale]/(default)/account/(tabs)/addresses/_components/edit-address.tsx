'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import ReCaptcha from 'react-google-recaptcha';

import {
  createFieldName,
  DateField,
  FieldNameToFieldId,
  FieldWrapper,
  NumbersOnly,
  Picklist,
  PicklistOrText,
  Text,
} from '~/app/[locale]/(default)/login/register-customer/_components/register-customer-form/fields';
import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';
import { Field, Form, FormSubmit } from '~/components/ui/form';
import { Message } from '~/components/ui/message';

import { useAccountStatusContext } from '../../_components/account-status-provider';
import { Modal } from '../../_components/modal';
import { deleteAddress } from '../_actions/delete-address';
import { updateAddress } from '../_actions/update-address';

import { AddressFields, Countries } from './add-address';
import {
  createCountryChangeHandler,
  createDatesValidationHandler,
  createNumbersInputValidationHandler,
  createTextInputValidationHandler,
} from './address-field-handlers';
import { Address } from './customer-edit-address';

interface FormStatus {
  status: 'success' | 'error';
  message: string;
}

type CountryStates = Countries[number]['statesOrProvinces'];
type FieldUnionType = Exclude<
  keyof typeof FieldNameToFieldId,
  'email' | 'password' | 'confirmPassword' | 'exclusiveOffers' | 'currentPassword'
>;

const isExistedField = (name: unknown): name is FieldUnionType => {
  if (typeof name === 'string' && name in FieldNameToFieldId) {
    return true;
  }

  return false;
};

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

interface EditAddressProps {
  address: Address;
  addressFields: AddressFields;
  countries: Countries;
  isAddressRemovable: boolean;
  reCaptchaSettings?: {
    isEnabledOnStorefront: boolean;
    siteKey: string;
  };
}

export const EditAddress = ({
  address,
  addressFields,
  countries,
  isAddressRemovable,
  reCaptchaSettings,
}: EditAddressProps) => {
  const form = useRef<HTMLFormElement>(null);
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null);
  const t = useTranslations('Account.EditAddress');

  const reCaptchaRef = useRef<ReCaptcha>(null);
  const router = useRouter();
  const [reCaptchaToken, setReCaptchaToken] = useState('');
  const [isReCaptchaValid, setReCaptchaValid] = useState(true);
  const { setAccountState } = useAccountStatusContext();

  useEffect(() => {
    setAccountState({ status: 'idle' });
  }, [setAccountState]);

  const [textInputValid, setTextInputValid] = useState<Record<string, boolean>>({});
  const [numbersInputValid, setNumbersInputValid] = useState<Record<string, boolean>>({});
  const [datesValid, setDatesValid] = useState<Record<string, boolean>>({});

  const defaultStates = countries
    .filter((country) => country.code === address.countryCode)
    .flatMap((country) => country.statesOrProvinces);
  const [countryStates, setCountryStates] = useState<CountryStates>(defaultStates);

  const handleTextInputValidation = createTextInputValidationHandler(
    setTextInputValid,
    textInputValid,
  );
  const handleNumbersInputValidation = createNumbersInputValidationHandler(
    setNumbersInputValid,
    numbersInputValid,
  );
  const handleCountryChange = createCountryChangeHandler(setCountryStates, countries);
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

    const submit = await updateAddress({ addressId: address.entityId, formData });

    if (submit.status === 'success') {
      setAccountState({
        status: 'success',
        message: t('successMessage'),
      });

      router.push('/account/addresses');

      return;
    }

    if (submit.status === 'error') {
      setFormStatus({ status: 'error', message: submit.message || '' });
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };
  const onDeleteAddress = async () => {
    const { status, message } = await deleteAddress(address.entityId);

    if (status === 'success') {
      setAccountState({ status, message: t('deleteAddress') });
    }

    if (status === 'error') {
      setAccountState({ status, message });
    }

    router.push('/account/addresses');
  };

  return (
    <>
      {formStatus && (
        <Message className="mx-auto mb-8 w-full" variant={formStatus.status}>
          <p>{formStatus.message}</p>
        </Message>
      )}
      <Form action={onSubmit} ref={form}>
        <div className="grid grid-cols-1 gap-y-3 lg:grid-cols-2 lg:gap-x-6">
          {addressFields.map((field) => {
            const fieldId = field.entityId;
            const key = FieldNameToFieldId[fieldId];
            let defaultValue;
            let defaultCustomField;

            if (isExistedField(key)) {
              defaultValue = address[key] ?? undefined;
            } else {
              defaultCustomField = address.formFields.find(({ entityId }) => entityId === fieldId);
            }

            switch (field.__typename) {
              case 'TextFormField': {
                const defaultText =
                  defaultCustomField?.__typename === `TextFormFieldValue`
                    ? defaultCustomField.text
                    : undefined;

                return (
                  <FieldWrapper fieldId={fieldId} key={fieldId}>
                    <Text
                      defaultValue={defaultValue ?? defaultText}
                      field={field}
                      isValid={textInputValid[fieldId]}
                      name={createFieldName(field, 'address')}
                      onChange={handleTextInputValidation}
                    />
                  </FieldWrapper>
                );
              }

              case 'NumberFormField': {
                const defaultNumber =
                  defaultCustomField?.__typename === `NumberFormFieldValue`
                    ? defaultCustomField.number
                    : undefined;

                return (
                  <FieldWrapper fieldId={fieldId} key={fieldId}>
                    <NumbersOnly
                      defaultValue={defaultNumber}
                      field={field}
                      isValid={numbersInputValid[fieldId]}
                      name={createFieldName(field, 'address')}
                      onChange={handleNumbersInputValidation}
                    />
                  </FieldWrapper>
                );
              }

              case 'DateFormField': {
                const defaultDate =
                  defaultCustomField?.__typename === `DateFormFieldValue`
                    ? defaultCustomField.date.utc
                    : undefined;

                return (
                  <FieldWrapper fieldId={fieldId} key={fieldId}>
                    <DateField
                      defaultValue={defaultDate}
                      field={field}
                      isValid={datesValid[fieldId]}
                      name={createFieldName(field, 'address')}
                      onChange={handleDatesValidation}
                      onValidate={setDatesValid}
                    />
                  </FieldWrapper>
                );
              }

              case 'PicklistFormField':
                return (
                  <FieldWrapper fieldId={fieldId} key={fieldId}>
                    <Picklist
                      defaultValue={
                        fieldId === FieldNameToFieldId.countryCode ? defaultValue : undefined
                      }
                      field={field}
                      name={createFieldName(field, 'address')}
                      onChange={
                        fieldId === FieldNameToFieldId.countryCode ? handleCountryChange : undefined
                      }
                      options={countries.map(({ name, code }) => {
                        return { label: name, entityId: code };
                      })}
                    />
                  </FieldWrapper>
                );

              case 'PicklistOrTextFormField': {
                return (
                  <FieldWrapper fieldId={fieldId} key={fieldId}>
                    <PicklistOrText
                      defaultValue={
                        fieldId === FieldNameToFieldId.stateOrProvince ? defaultValue : undefined
                      }
                      field={field}
                      key={countryStates.length}
                      name={createFieldName(field, 'address')}
                      options={countryStates.map(({ name }) => {
                        return { entityId: name, label: name };
                      })}
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
        </div>

        <div className="mt-8 flex flex-col justify-stretch gap-2 md:flex-row md:justify-between md:gap-0">
          <FormSubmit asChild>
            <SubmitButton messages={{ submit: t('submit'), submitting: t('submitting') }} />
          </FormSubmit>
          <Button asChild className="items-center px-8 md:ms-6 md:w-fit" variant="secondary">
            <Link href="/account/addresses">{t('cancel')}</Link>
          </Button>
          <Modal
            actionHandler={onDeleteAddress}
            confirmationText={t('confirmDeleteAddress')}
            title={t('deleteModalTitle')}
          >
            <Button
              className="ms-auto items-center px-8 md:w-fit"
              disabled={!isAddressRemovable}
              variant="subtle"
            >
              {t('deleteButton')}
            </Button>
          </Modal>
        </div>
      </Form>
    </>
  );
};
