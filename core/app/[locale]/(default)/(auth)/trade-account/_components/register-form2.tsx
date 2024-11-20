'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAccountStatusContext } from '~/app/[locale]/(default)/account/(tabs)/_components/account-status-provider';
import {
  createFieldName,
  FieldNameToFieldId,
  FieldWrapper,
  NumbersOnly,
  Picklist,
  PicklistOrText,
  Text,
  MultilineText,
  DateField,
  RadioButtons,
  Checkboxes,
  Password,
  CUSTOMER_FIELDS_TO_EXCLUDE,
} from '~/components/form-fields';
import { Button } from '~/components/ui/button';
import { Form } from '~/components/ui/form';
import { Message } from '~/components/ui/message';
import { registerCustomers } from '../_actions/register-customers';
import { logins } from '../_actions/logins';

type FieldOrderKeys =
  | 'I am a'
  | 'Company Name'
  | 'Tax ID/Licence#'
  | 'Country'
  | 'Suburb/City'
  | 'State/Province'
  | 'Zip/Postcode'
  | 'Address Line 1'
  | 'Address Line 2';

const FIELD_ORDER: Record<FieldOrderKeys, number> = {
  'I am a': 1,
  'Company Name': 2,
  'Tax ID/Licence#': 3,
  Country: 4,
  'Suburb/City': 8,
  'State/Province': 5,
  'Zip/Postcode': 9,
  'Address Line 1': 6,
  'Address Line 2': 7,
};

const ALLOWED_CUSTOMER_FIELDS = ['I am a', 'Tax ID/Licence#'];

const ALLOWED_ADDRESS_FIELDS = [
  'Company Name',
  'Country',
  'Suburb/City',
  'State/Province',
  'Zip/Postcode',
  'Address Line 1',
  'Address Line 2',
];

interface BaseField {
  entityId: number;
  label: string;
  sortOrder: number;
  isBuiltIn: boolean;
  isRequired: boolean;
}
interface TradeAddress1 {
  TradeAddress1: string;
}
interface TextFormField extends BaseField {
  __typename: 'TextFormField';
  defaultText: string | null;
  maxLength: number | null;
}

interface MultilineTextFormField extends BaseField {
  __typename: 'MultilineTextFormField';
  defaultText: string | null;
  rows: number;
}

interface NumberFormField extends BaseField {
  __typename: 'NumberFormField';
  defaultNumber: number | null;
  maxLength: number | null;
  minNumber: number | null;
  maxNumber: number | null;
}

interface DateFormField extends BaseField {
  __typename: 'DateFormField';
  defaultDate: string | null;
  minDate: string | null;
  maxDate: string | null;
}

interface PicklistOption {
  entityId: number;
  label: string;
}

interface PicklistFormField extends BaseField {
  __typename: 'PicklistFormField';
  choosePrefix: string;
  options: PicklistOption[];
}

interface PicklistOrTextFormField extends BaseField {
  __typename: 'PicklistOrTextFormField';
  options: PicklistOption[];
  defaultText?: string | null;
  defaultNumber?: number | null;
}

interface RadioButtonsFormField extends BaseField {
  __typename: 'RadioButtonsFormField';
  options: PicklistOption[];
}

interface CheckboxesFormField extends BaseField {
  __typename: 'CheckboxesFormField';
  options: PicklistOption[];
}

interface PasswordFormField extends BaseField {
  __typename: 'PasswordFormField';
  defaultText: string | null;
  maxLength: number | null;
}

type FormField =
  | TextFormField
  | MultilineTextFormField
  | NumberFormField
  | DateFormField
  | PicklistFormField
  | PicklistOrTextFormField
  | RadioButtonsFormField
  | CheckboxesFormField
  | PasswordFormField;

interface FormStatus {
  status: 'success' | 'error';
  message: string;
}

interface RegisterForm2Props {
  TradeAddress1: string;
  addressFields: FormField[];
  customerFields: FormField[];
  countries: Array<{ name: string; code: string; states?: Array<{ name: string }> }>;
  defaultCountry: {
    code: string;
    states: Array<{ name: string }>;
  };
}

export const RegisterForm2 = ({
  addressFields,
  customerFields,
  countries = [],
  defaultCountry,
  TradeAddress1,
}: RegisterForm2Props) => {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null);

  const [textInputValid, setTextInputValid] = useState<Record<number, boolean>>({});
  const [multiTextValid, setMultiTextValid] = useState<Record<number, boolean>>({});
  const [numbersInputValid, setNumbersInputValid] = useState<Record<number, boolean>>({});
  const [datesValid, setDatesValid] = useState<Record<number, boolean>>({});
  const [radioButtonsValid, setRadioButtonsValid] = useState<Record<number, boolean>>({});
  const [picklistValid, setPicklistValid] = useState<Record<number, boolean>>({});
  const [checkboxesValid, setCheckboxesValid] = useState<Record<number, boolean>>({});
  const [passwordValid, setPasswordValid] = useState<Record<number, boolean>>({});
  const [countryStates, setCountryStates] = useState(defaultCountry.states);

  const [showAddressLine2, setShowAddressLine2] = useState(false);

  const { setAccountState } = useAccountStatusContext();
  const t = useTranslations('Register.Form');

  const firstStepData: Record<string, string | number | null> =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('registrationFormData') || '{}')
      : {};

  const handleTextInputValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const fieldId = Number(e.target.id.split('-')[1]);
    const validityState = e.target.validity;
    const validationStatus = validityState.valueMissing || validityState.typeMismatch;
    setTextInputValid((prev) => ({ ...prev, [fieldId]: !validationStatus }));
  };

  const handleMultiTextValidation = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const fieldId = Number(e.target.id.split('-')[1]);
    setMultiTextValid((prev) => ({ ...prev, [fieldId]: !e.target.validity.valueMissing }));
  };

  const handleNumbersInputValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const fieldId = Number(e.target.id.split('-')[1]);
    setNumbersInputValid((prev) => ({ ...prev, [fieldId]: !e.target.validity.valueMissing }));
  };

  const handleDatesValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const fieldId = Number(e.target.id.split('-')[1]);
    setDatesValid((prev) => ({ ...prev, [fieldId]: !e.target.validity.valueMissing }));
  };

  const handleRadioButtonsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const fieldId = Number(e.target.name.split('-')[1]);
    setRadioButtonsValid((prev) => ({ ...prev, [fieldId]: true }));
  };

  const handlePasswordValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const fieldId = Number(e.target.id.split('-')[1]);
    setPasswordValid((prev) => ({ ...prev, [fieldId]: !e.target.validity.valueMissing }));
  };

  const handleCountryChange = (value: string) => {
    const states = countries.find(({ code }) => code === value)?.states ?? [];
    setCountryStates(states);
  };

  const isValidFormValue = (value: unknown): value is string | Blob => {
    return (
      value !== null && value !== undefined && (typeof value === 'string' || value instanceof Blob)
    );
  };

  const handleBack = () => {
    router.push('/trade-account/trade-step1/');
  };

  const onSubmit = async (formData: FormData) => {
    try {
      const combinedFormData = new FormData();

      Object.entries(firstStepData).forEach(([key, value]) => {
        if (isValidFormValue(value)) {
          combinedFormData.append(key, String(value));
        }
      });

      for (const [key, value] of formData.entries()) {
        if (isValidFormValue(value)) {
          combinedFormData.append(key, String(value));
        }
      }

      const submit = await registerCustomers({ formData: combinedFormData });

      if (submit.status === 'success') {
        setAccountState({ status: 'success' });
        const email = formData.get('customer-email') as string;
        const password = formData.get('customer-password') as string;
        await logins(email, password, combinedFormData);
        localStorage.removeItem('registrationFormData');

        setFormStatus({
          status: 'success',
          message: 'Successfully registered! Redirecting...',
        });

        setTimeout(() => {
          router.push('/trade-account/trade-step3/');
        }, 20);
      } else {
        setFormStatus({
          status: 'error',
          message: submit.error || 'Registration failed',
        });
      }
    } catch (error) {
      setFormStatus({
        status: 'error',
        message: 'An unexpected error occurred',
      });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getModifiedLabel = (originalLabel: string): string => {
    switch (originalLabel) {
      case 'Tax ID/Licence#':
        return 'Tax ID/License#*';
      case 'I am a':
        return 'I am a*';
      case 'Company Name':
        return 'Business Name*';
      case 'Country':
        return 'Country*';
      case 'State/Province':
        return 'State*';
      case 'Address Line 1':
        return 'Address Line 1*';
      case 'Address Line 2':
        return 'Address Line 2';
      case 'Suburb/City':
        return 'City*';
      case 'Zip/Postcode':
        return 'Zipcode*';

      default:
        return originalLabel;
    }
  };

  const renderField = (field: FormField, isCustomerField: boolean = false) => {
    const fieldId = field.entityId;
    const fieldName = createFieldName(field, isCustomerField ? 'customer' : 'address');
    const isCountrySelector = fieldId === FieldNameToFieldId.countryCode;
    const isStateField = fieldId === FieldNameToFieldId.stateOrProvince;

    const modifiedField = {
      ...field,
      label: getModifiedLabel(field.label),
      isRequired: field.label !== 'Address Line 2',
    };

    switch (field.__typename) {
      case 'TextFormField':
        return (
          <FieldWrapper fieldId={fieldId} key={fieldId}>
            <Text
              field={modifiedField}
              isValid={textInputValid[fieldId]}
              name={fieldName}
              onChange={handleTextInputValidation}
              type={FieldNameToFieldId[fieldId]}
            />
          </FieldWrapper>
        );

      case 'MultilineTextFormField':
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

      case 'NumberFormField':
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

      case 'DateFormField':
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

      case 'RadioButtonsFormField':
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

      case 'PicklistFormField':
        if (isCountrySelector) {
          return (
            <FieldWrapper fieldId={fieldId} key={fieldId}>
              <Picklist
                defaultValue={defaultCountry.code}
                field={modifiedField}
                isValid={picklistValid[fieldId]}
                name={fieldName}
                onChange={handleCountryChange}
                onValidate={setPicklistValid}
                options={countries.map(({ name, code }) => ({
                  label: name,
                  entityId: code,
                }))}
              />
            </FieldWrapper>
          );
        }

        return (
          <FieldWrapper fieldId={fieldId} key={fieldId}>
            <Picklist
              field={modifiedField}
              isValid={picklistValid[fieldId]}
              name={fieldName}
              onValidate={setPicklistValid}
              options={field.options}
            />
          </FieldWrapper>
        );

      case 'CheckboxesFormField':
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

      case 'PicklistOrTextFormField':
        if (isStateField) {
          return (
            <FieldWrapper fieldId={fieldId} key={fieldId}>
              <PicklistOrText
                defaultValue={countryStates[0]?.name}
                field={modifiedField}
                name={fieldName}
                options={countryStates.map(({ name }) => ({
                  entityId: name,
                  label: name,
                }))}
              />
            </FieldWrapper>
          );
        }
        return (
          <FieldWrapper fieldId={fieldId} key={fieldId}>
            <PicklistOrText field={field} name={fieldName} options={field.options} />
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
  };

  return (
    <>
      {formStatus && (
        <Message className="mb-8" variant={formStatus.status}>
          <p>{formStatus.message}</p>
        </Message>
      )}
      <Form
        action={async (data: FormData) => await onSubmit(data)}
        ref={formRef}
        className="register-form mx-auto max-w-[600px] sm:pt-3 md:pt-3"
      >
        <div className="trade2-form">
          {[
            ...customerFields
              .filter((field) => ALLOWED_CUSTOMER_FIELDS.includes(field.label))
              .sort(
                (a, b) =>
                  (FIELD_ORDER[a.label as FieldOrderKeys] || 0) -
                  (FIELD_ORDER[b.label as FieldOrderKeys] || 0),
              )
              .map((field) => renderField(field, true)),
            ...addressFields
              .filter((field) => {
                if (field.label === 'Address Line 2' && !showAddressLine2) {
                  return false;
                }
                return ALLOWED_ADDRESS_FIELDS.includes(field.label);
              })
              .sort(
                (a, b) =>
                  (FIELD_ORDER[a.label as FieldOrderKeys] || 0) -
                  (FIELD_ORDER[b.label as FieldOrderKeys] || 0),
              )
              .map((field) => (
                <>
                  {field.label === 'Address Line 2' ? (
                    <div onClick={() => setShowAddressLine2(false)}>
                      {renderField(field, false)}
                    </div>
                  ) : (
                    renderField(field, false)
                  )}

                  {field.label === 'Address Line 1' && !showAddressLine2 && (
                    <div
                      className="relative top-[-1em] flex items-center gap-2"
                      onClick={() => setShowAddressLine2(true)}
                    >
                      <span className="text-left text-[14px] font-normal leading-6 tracking-wide text-[#353535]">
                        <img src={TradeAddress1} alt="" />
                      </span>{' '}
                      Add Apt, suite, floor, or other.
                    </div>
                  )}
                </>
              )),
          ]}
        </div>

        <div className="mt-0 flex gap-4">
          <Button
            className="relative mt-8 w-fit items-center px-8 py-2"
            variant="primary"
            type="submit"
          >
            SUBMIT
          </Button>
        </div>
      </Form>
    </>
  );
};
