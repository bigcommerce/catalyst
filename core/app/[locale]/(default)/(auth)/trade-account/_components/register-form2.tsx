'use client';

import { ChangeEvent, useRef, useState, useEffect } from 'react';
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
} from '~/components/form-fields';
import { Button } from '~/components/ui/button';
import { Form } from '~/components/ui/form';
import { Message } from '~/components/ui/message';
import { registerCustomers } from '../_actions/register-customers';
import { logins } from '../_actions/logins';
import { selectors } from '@playwright/test';

// Constants
const REQUIRED_FIELDS = new Set([
  'customer-email',
  'customer-password',
  'address-countryCode',
  'address-stateOrProvince',
  'address-line1',
  'address-city',
  'address-postalCode',
]);

type FieldOrderKeys =
  | 'I am a'
  | 'Company Name'
  | 'Tax ID / Licence#'
  | 'Country'
  | 'Suburb/City'
  | 'State/Province'
  | 'Zip/Postcode'
  | 'Address Line 1'
  | 'Address Line 2';

const FIELD_ORDER: Record<FieldOrderKeys, number> = {
  'I am a': 1,
  'Company Name': 2,
  'Tax ID / Licence#': 3,
  Country: 4,
  'State/Province': 8,
  'Address Line 1': 5,
  'Address Line 2': 6,
  'Suburb/City': 7,
  'Zip/Postcode': 9,
};

const ALLOWED_FIELDS = ['I am a', 'Tax ID / Licence#','Company Name','Country','Suburb/City','State/Province','Zip/Postcode','Address Line 1','Address Line 2',]

// Interfaces
interface BaseField {
  entityId: number;
  label: string | JSX.Element; // Updated to allow JSX.Element
  sortOrder: number;
  isBuiltIn: boolean;
  isRequired: boolean;
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
  entityId: string | number;
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
  countries: Array<{
    name: string;
    code: string;
    statesOrProvinces?: Array<{
      name: string;
      abbreviation: string;
    }>;
  }>;
  defaultCountry: {
    code: string;
    states: Array<{ name: string }>;
  };
}

export const RegisterForm2 = ({
  addressFields,
  customerFields,
  countries,
  defaultCountry,
  TradeAddress1,
}: RegisterForm2Props) => {
  // Refs and Router
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  // States
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [textInputValid, setTextInputValid] = useState<Record<number, boolean>>({});
  const [multiTextValid, setMultiTextValid] = useState<Record<number, boolean>>({});
  const [numbersInputValid, setNumbersInputValid] = useState<Record<number, boolean>>({});
  const [datesValid, setDatesValid] = useState<Record<number, boolean>>({});
  const [radioButtonsValid, setRadioButtonsValid] = useState<Record<number, boolean>>({});
  const [picklistValid, setPicklistValid] = useState<Record<number, boolean>>({});
  const [checkboxesValid, setCheckboxesValid] = useState<Record<number, boolean>>({});
  const [passwordValid, setPasswordValid] = useState<Record<number, boolean>>({});
  const [stateInputValid, setStateInputValid] = useState(false);
  const [countryStates, setCountryStates] = useState(defaultCountry.states);
  const [showAddressLine2, setShowAddressLine2] = useState(false);
  const [stateSelector, setStateSelector] = useState(false);

  const [selectedOption, setSelectedOption] = useState("15");
  const [selectError, setSelectError] = useState("");

  const { setAccountState } = useAccountStatusContext();
  const t = useTranslations('Register.Form');

  // Effects
  useEffect(() => {
    router.prefetch('/trade-account/trade-step3/');
  }, [router]);

  // Form Data Handling
  const isValidFormValue = (value: unknown): value is string | Blob => {
    return (
      value !== null && value !== undefined && (typeof value === 'string' || value instanceof Blob)
    );
  };

  const processFormData = (formData: FormData): FormData => {
    const combinedFormData = new FormData();

    if (typeof window !== 'undefined') {
      const firstStepData = JSON.parse(localStorage.getItem('registrationFormData') || '{}');
      Object.entries(firstStepData).forEach(([key, value]) => {
        if (isValidFormValue(value)) {
          combinedFormData.append(key, String(value));
        }
      });
    }

    for (const [key, value] of formData.entries()) {
      if (isValidFormValue(value)) {
        combinedFormData.append(key, String(value));
      }
    }

    return combinedFormData;
  };

  // Validation Handlers
  const validateStateInput = (value: string): boolean => {
    if (!value) {
      setStateInputValid(false);
      return false;
    }
    setStateInputValid(true);
    return true;
  };

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
    const selectedCountry = countries.find(({ code }) => code === value);
    if (selectedCountry && selectedCountry.statesOrProvinces) {
      setCountryStates(
        selectedCountry.statesOrProvinces.map((state) => ({
          name: state.name,
        })),
      );
       setStateSelector(true);
    } else {
      setCountryStates([]);
       setStateSelector(false);
    }
    setStateInputValid(false);
  };

  // Label Modifier
  const getModifiedLabel = (originalLabel: string): string => {
    switch (originalLabel) {
      case 'I am a':
        return 'I am a:*'
      case 'Tax ID / Licence#':
        return 'Tax ID/License#';
      case 'Company Name':
        return 'Business Name';
      case 'Country':
        return 'Country*';
      case 'State/Province':
        return 'State*';
      case 'Address Line 1':
        return 'Address Line 1';
      case 'Address Line 2':
        return 'Address Line 2 (Optional)';
      case 'Suburb/City':
        return 'City';
      case 'Zip/Postcode':
        return 'Zipcode';
      default:
        return originalLabel;
    }
  };

  // Form submission handler
  const onSubmit = async (formData: FormData) => {

    if(selectedOption == '15'){
      setSelectError("Please select an option.");
      return;
    }

    if (isSubmitting) return;

    const stateValue = formData.get('address-stateOrProvince');
    if (!stateValue) {
      setFormStatus({
        status: 'error',
        message: 'Please select or enter a state',
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitProgress(20);

      const combinedFormData = processFormData(formData);
      setSubmitProgress(40);

      const submit = await registerCustomers({ formData: combinedFormData });
      setSubmitProgress(60);

      if (submit.status === 'success') {
        const email = formData.get('customer-email') as string;
        const password = formData.get('customer-password') as string;

        localStorage.removeItem('registrationFormData');
        setSubmitProgress(80);

        try {
          await Promise.all([
            setAccountState({ status: 'success' }),
            logins(email, password, combinedFormData),
          ]);

          setSubmitProgress(100);
          router.push('/trade-account/trade-step3');

          setTimeout(() => {
            if (document.location.pathname !== '/trade-account/trade-step3') {
              window.location.href = '/trade-account/trade-step3';
            }
          }, 1000);
        } catch (loginError) {
          router.push('/trade-account/trade-step3');
        }
      } else {
        setFormStatus({
          status: 'error',
          message: submit.error || 'Registration failed',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      setFormStatus({
        status: 'error',
        message: 'An unexpected error occurred',
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
      setSubmitProgress(0);
    }
  };

  // Field Renderer
  const renderField = (field: FormField, isCustomerField: boolean = false) => {
    const fieldId = field.entityId;
    const fieldName = createFieldName(field, isCustomerField ? 'customer' : 'address');
    const isCountrySelector = fieldId === FieldNameToFieldId.countryCode;
    const isStateField = fieldId === FieldNameToFieldId.stateOrProvince;
    const fieldLabel = getModifiedLabel(field.label);

    const modifiedField = {
      ...field,
      label: fieldLabel,
      isRequired: field.label !== 'Address Line 2',
    };

    switch (field.__typename) {
      case 'TextFormField':
        if (field.label === 'Address Line 2') {
          return (
            <FieldWrapper fieldId={fieldId} key={fieldId}>
              <div className="relative">
                <Text
                  field={{
                    ...modifiedField,
                    __typename: 'TextFormField',
                    label: (
                      <div
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowAddressLine2(false);
                        }}
                      >
                        Address Line 2 (Optional)
                      </div>
                    ),
                  }}
                  isValid={true}
                  name={fieldName}
                  onChange={handleTextInputValidation}
                />
              </div>
            </FieldWrapper>
          );
        }
        return (
          <FieldWrapper fieldId={fieldId} key={fieldId}>
            <Text
              field={{
                ...modifiedField,
                __typename: 'TextFormField',
                label: fieldLabel,
              }}
              isValid={textInputValid[fieldId]}
              name={fieldName}
              onChange={handleTextInputValidation}
            />
          </FieldWrapper>
        );

      case 'PicklistFormField':
        if (isCountrySelector) {
          const filteredCountries = countries.filter((country) =>
            ['US', 'CA'].includes(country.code),
          );

          const countryField: PicklistFormField = {
            ...modifiedField,
            __typename: 'PicklistFormField',
            choosePrefix: 'Select a country',
            options: filteredCountries.map((country) => ({
              label: country.name,
              entityId: country.code,
            })),
            label: fieldLabel,
          };

          return (
            <FieldWrapper fieldId={fieldId} key={fieldId}>
              <Picklist
                field={countryField}
                isValid={picklistValid[fieldId]}
                name={fieldName}
                onChange={(value: string) => {
                  handleCountryChange(value);
                }}
                onValidate={setPicklistValid}
                options={countryField.options}
              />
            </FieldWrapper>
          );
        }

        return (
          <FieldWrapper fieldId={fieldId} key={fieldId}>
            <Picklist
              field={modifiedField as PicklistFormField}
              isValid={picklistValid[fieldId]}
              name={fieldName}
              onValidate={setPicklistValid}
              options={field.options}
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
              selectError={selectError}
              setSelectError={setSelectError}
            />
          </FieldWrapper>
        );

      case 'MultilineTextFormField':
        return (
          <FieldWrapper fieldId={fieldId} key={fieldId}>
            <MultilineText
              field={{
                ...modifiedField,
                __typename: 'MultilineTextFormField',
                label: fieldLabel,
              }}
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
              field={{
                ...modifiedField,
                __typename: 'NumberFormField',
                label: fieldLabel,
              }}
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
              field={{
                ...modifiedField,
                __typename: 'DateFormField',
                label: fieldLabel,
              }}
              isValid={datesValid[fieldId]}
              name={fieldName}
              onChange={handleDatesValidation}
            />
          </FieldWrapper>
        );

      case 'RadioButtonsFormField':
        return (
          <FieldWrapper fieldId={fieldId} key={fieldId}>
            <RadioButtons
              field={{
                ...modifiedField,
                __typename: 'RadioButtonsFormField',
                label: fieldLabel,
              }}
              isValid={radioButtonsValid[fieldId]}
              name={fieldName}
              onChange={handleRadioButtonsChange}
            />
          </FieldWrapper>
        );

      case 'CheckboxesFormField':
        return (
          <FieldWrapper fieldId={fieldId} key={fieldId}>
            <Checkboxes
              field={{
                ...modifiedField,
                __typename: 'CheckboxesFormField',
                label: fieldLabel,
              }}
              isValid={checkboxesValid[fieldId]}
              name={fieldName}
              onValidate={setCheckboxesValid}
              options={field.options}
            />
          </FieldWrapper>
        );

      case 'PicklistOrTextFormField':
        if (isStateField) {
          const stateOptions = countryStates.map((state) => ({
            entityId: state.name,
            label: state.name,
          }));

          const stateField: PicklistOrTextFormField = {
            ...modifiedField,
            __typename: 'PicklistOrTextFormField',
            options: stateOptions,
            label: fieldLabel,
          };

          return (
            <FieldWrapper fieldId={fieldId} key={fieldId}>
              <PicklistOrText
                defaultValue={stateSelector ? countryStates[0]?.name : ''}
                field={stateField}
                name={fieldName}
                options={stateOptions}
                onValidate={(isValid: boolean) => {
                  setStateInputValid(isValid);
                }}
                isValid={stateInputValid}
              />
            </FieldWrapper>
          );
        }

        return (
          <FieldWrapper fieldId={fieldId} key={fieldId}>
            <PicklistOrText
              field={{
                ...modifiedField,
                __typename: 'PicklistOrTextFormField',
                label: fieldLabel,
              }}
              name={fieldName}
              options={field.options}
            />
          </FieldWrapper>
        );

      case 'PasswordFormField':
        return (
          <FieldWrapper fieldId={fieldId} key={fieldId}>
            <Password
              field={{
                ...modifiedField,
                __typename: 'PasswordFormField',
                label: fieldLabel,
              }}
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

  const formFields = [...customerFields,...addressFields];

  return (
    <>
      {formStatus && (
        <Message className="mb-8" variant={formStatus.status}>
          <p>{formStatus.message}</p>
        </Message>
      )}
      <Form
        ref={formRef}
        className="register-form mx-auto max-w-[600px] sm:pt-3 md:pt-3"
        onSubmit={(e) => {
          e.preventDefault();
          if(!selectedOption && !selectedOption.trim()){
            setSelectError("Please select an option.");
            return;
          }
          const formData = new FormData(e.currentTarget);
          onSubmit(formData);
        }}
      >
        <div className="trade2-form">
          {[
            ...formFields
              .filter((field) => {
                if (field.label === 'Address Line 2' && !showAddressLine2) {
                  return false;
                }
                return ALLOWED_FIELDS.includes(field.label);
              })
              .sort(
                (a, b) =>
                  (FIELD_ORDER[a.label as FieldOrderKeys] || 0) -
                  (FIELD_ORDER[b.label as FieldOrderKeys] || 0),
              )
              .map((field) => (
                <div key={field.entityId}>
                  {field.label === 'Address Line 1' ? (
                    <>
                      {renderField(field, false)}
                      {!showAddressLine2 && (
                        <button
                          type="button"
                          className="relative top-[-1em] flex cursor-pointer items-center gap-2 text-left text-[14px] font-normal leading-6 tracking-wide text-[#353535] transition-colors duration-200"
                          onClick={() => setShowAddressLine2(true)}
                        >
                          <img src={TradeAddress1} className="w-[20px]" alt="" />
                          <span>Add Apt, suite, floor, or other.</span>
                        </button>
                      )}
                    </>
                  ) : field.label === 'I am a' || field.label === 'Tax ID / Licence#' ? (
                    renderField(field, true)
                  ) : (
                    renderField(field, false)
                  )}
                </div>
              )),
          ]}
        </div>

        <div className="mt-0 flex flex-col gap-4">
          {isSubmitting && (
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-[#008BB7] transition-all duration-300"
                style={{ width: `${submitProgress}%` }}
              />
            </div>
          )}
          <Button
            className="relative w-full items-center !bg-[#008BB7] px-8 py-2 !transition-colors !duration-500 hover:!bg-[rgb(75,200,240)] disabled:cursor-not-allowed xl:mt-[10px]"
            variant="primary"
            type="submit"
            disabled={isSubmitting || !!selectError}
          >
            {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
          </Button>
        </div>
      </Form>
    </>
  );
};
