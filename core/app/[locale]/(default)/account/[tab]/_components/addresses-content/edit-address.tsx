'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import ReCaptcha from 'react-google-recaptcha';

import {
  createFieldName,
  FieldNameToFieldId,
  FieldWrapper,
  Picklist,
  PicklistOrText,
  Text,
} from '~/app/[locale]/(default)/login/register-customer/_components/register-customer-form/fields';
import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';
import { Field, Form, FormSubmit } from '~/components/ui/form';
import { Message } from '~/components/ui/message';

import { deleteAddress } from '../../_actions/delete-address';
import { updateAddress } from '../../_actions/update-address';
import { useAccountStatusContext } from '../account-status-provider';
import { Modal } from '../modal';

import { AddressFields, Countries } from './add-address';
import {
  createCountryChangeHandler,
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
  canBeDeleted: boolean;
  countries: Countries;
  reCaptchaSettings?: {
    isEnabledOnStorefront: boolean;
    siteKey: string;
  };
}

export const EditAddress = ({
  address,
  addressFields,
  canBeDeleted,
  countries,
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

  const [textInputValid, setTextInputValid] = useState<Record<string, boolean>>({});

  const defaultStates = countries
    .filter((country) => country.code === address.countryCode)
    .flatMap((country) => country.statesOrProvinces);
  const [countryStates, setCountryStates] = useState<CountryStates>(defaultStates);

  const handleTextInputValidation = createTextInputValidationHandler(
    setTextInputValid,
    textInputValid,
  );
  const handleCountryChange = createCountryChangeHandler(setCountryStates, countries);

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
  const onDeleteAddress = async () => {
    const { status, message } = await deleteAddress(address.entityId);

    if (status === 'success') {
      setAccountState({ status, message: t('deleteAddress') });
    }

    if (status === 'error') {
      setAccountState({ status, message });
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    setTimeout(() => {
      router.replace('/account/addresses');
    }, 500);
  };

  return (
    <>
      {formStatus && (
        <Message className="mx-auto mb-8 w-full" variant={formStatus.status}>
          <p>{formStatus.message}</p>
        </Message>
      )}
      <Form action={onSubmit} ref={form}>
        <div className="grid grid-cols-1 gap-y-6 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-2">
          {addressFields.map((field) => {
            const key = FieldNameToFieldId[field.entityId];

            if (!isExistedField(key)) {
              return null;
            }

            const defaultValue = address[key] || undefined;

            switch (field.__typename) {
              case 'TextFormField': {
                return (
                  <FieldWrapper fieldId={field.entityId} key={field.entityId}>
                    <Text
                      defaultValue={defaultValue}
                      field={field}
                      isValid={textInputValid[field.entityId]}
                      name={createFieldName('address', field.entityId)}
                      onChange={handleTextInputValidation}
                    />
                  </FieldWrapper>
                );
              }

              case 'PicklistFormField':
                return (
                  <FieldWrapper fieldId={field.entityId} key={field.entityId}>
                    <Picklist
                      defaultValue={
                        field.entityId === FieldNameToFieldId.countryCode ? defaultValue : undefined
                      }
                      field={field}
                      name={createFieldName('address', field.entityId)}
                      onChange={
                        field.entityId === FieldNameToFieldId.countryCode
                          ? handleCountryChange
                          : undefined
                      }
                      options={countries.map(({ name, code }) => {
                        return { label: name, entityId: code };
                      })}
                    />
                  </FieldWrapper>
                );

              case 'PicklistOrTextFormField': {
                return (
                  <FieldWrapper fieldId={field.entityId} key={field.entityId}>
                    <PicklistOrText
                      defaultValue={
                        field.entityId === FieldNameToFieldId.stateOrProvince
                          ? defaultValue
                          : undefined
                      }
                      field={field}
                      key={countryStates.length}
                      name={createFieldName('address', field.entityId)}
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
              disabled={!canBeDeleted}
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
