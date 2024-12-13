'use client';

import { AlertCircle, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { MouseEvent, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'react-hot-toast';

import {
  Checkboxes,
  createFieldName,
  DateField,
  FieldNameToFieldId,
  FieldWrapper,
  MultilineText,
  NumbersOnly,
  Password,
  Picklist,
  PicklistOrText,
  RadioButtons,
  Text,
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
  type FieldStateSetFn,
} from '~/components/form-fields/shared/field-handlers';
import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';
import { Form, FormSubmit } from '~/components/ui/form';
import { useRouter } from '~/i18n/routing';

import { addAddress } from '../_actions/add-address';
import { NewAddressQueryResult } from '../page';

type AddressFields = NonNullable<
  NewAddressQueryResult['site']['settings']
>['formFields']['shippingAddress'];

type Countries = NonNullable<NewAddressQueryResult['geography']['countries']>;
type CountryCode = Countries[number]['code'];
type CountryStates = Countries[number]['statesOrProvinces'];

const createCountryChangeHandler =
  (provinceSetter: FieldStateSetFn<CountryStates>, countries: Countries) => (value: string) => {
    const states = countries.find(({ code }) => code === value)?.statesOrProvinces;

    provinceSetter(states ?? []);
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

interface AddAddressProps {
  addressFields: AddressFields;
  countries: Countries;
  defaultCountry: {
    id: number;
    code: CountryCode;
    states: CountryStates;
  };
}

export const AddAddressForm = ({ addressFields, countries, defaultCountry }: AddAddressProps) => {
  const form = useRef<HTMLFormElement>(null);

  const router = useRouter();
  const t = useTranslations('Account.Addresses.Add.Form');

  const [textInputValid, setTextInputValid] = useState<Record<string, boolean>>({});
  const [numbersInputValid, setNumbersInputValid] = useState<Record<string, boolean>>({});
  const [datesValid, setDatesValid] = useState<Record<string, boolean>>({});
  const [passwordValid, setPasswordValid] = useState<Record<string, boolean>>({});
  const [radioButtonsValid, setRadioButtonsValid] = useState<Record<string, boolean>>({});
  const [picklistValid, setPicklistValid] = useState<Record<string, boolean>>({});
  const [checkboxesValid, setCheckboxesValid] = useState<Record<string, boolean>>({});
  const [multiTextValid, setMultiTextValid] = useState<Record<string, boolean>>({});
  const [countryStates, setCountryStates] = useState(defaultCountry.states);

  const handleTextInputValidation = createTextInputValidationHandler(
    setTextInputValid,
    textInputValid,
  );
  const handlePasswordValidation = createPasswordValidationHandler(setPasswordValid, addressFields);
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

  const onSubmit = async (formData: FormData) => {
    const { status, message } = await addAddress(formData);

    if (status === 'error') {
      toast.error(message, {
        icon: <AlertCircle className="text-error-secondary" />,
      });

      return;
    }

    toast.success(message, {
      icon: <Check className="text-success-secondary" />,
    });

    router.push('/account/addresses', { scroll: true });
  };

  return (
    <Form action={onSubmit} onClick={preSubmitFieldsValidation} ref={form}>
      <div className="grid grid-cols-1 gap-y-3 lg:grid-cols-2 lg:gap-x-6">
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

            case 'PasswordFormField': {
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
            }

            default:
              return null;
          }
        })}
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
  );
};
