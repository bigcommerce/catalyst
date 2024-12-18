'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  createFieldName,
  CUSTOMER_FIELDS_TO_EXCLUDE,
  FieldNameToFieldId,
  FieldWrapper,
  Password,
  Text,
} from '~/components/form-fields';
import { Button } from '~/components/ui/button';
import { Form } from '~/components/ui/form';
import { Message } from '~/components/ui/message';

interface BaseFormField {
  entityId: number;
  label: string;
  sortOrder: number;
  isBuiltIn: boolean;
  isRequired: boolean;
  __typename: string;
}

interface TextFormField extends BaseFormField {
  __typename: 'TextFormField';
  defaultText: string | null;
  maxLength: number | null;
}

interface PasswordFormField extends BaseFormField {
  __typename: 'PasswordFormField';
  defaultText: string | null;
  maxLength: number | null;
}

interface NumberFormField extends BaseFormField {
  __typename: 'NumberFormField';
  defaultNumber: number | null;
  maxLength: number | null;
  minNumber: number | null;
  maxNumber: number | null;
}

interface PicklistFormField extends BaseFormField {
  __typename: 'PicklistFormField';
  choosePrefix: string;
  options: Array<{
    entityId: number;
    label: string;
  }>;
}

export type FormField = TextFormField | PasswordFormField | NumberFormField | PicklistFormField;

interface AddressFormField extends BaseFormField {
  __typename: 'TextFormField';
  defaultText: string | null;
  maxLength: number | null;
}

type AddressFields = AddressFormField[];

interface FormStatus {
  status: 'success' | 'error';
  message: string;
}

interface RegisterForm1Props {
  addressFields: AddressFields;
  customerFields: FormField[];
}

export const RegisterForm1 = ({ customerFields, addressFields }: RegisterForm1Props) => {
  const form = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null);
  const [textInputValid, setTextInputValid] = useState<Record<number, boolean>>({});
  const [passwordValid, setPasswordValid] = useState<Record<number, boolean>>({
    [FieldNameToFieldId.password]: true,
  });
  const [emailError, setEmailError] = useState<string>('');

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      setEmailError('');
      return true;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    setEmailError('');
    return true;
  };

  const handleTextInputValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const fieldId = Number(e.target.id.split('-')[1]);
    // Remove validation status to prevent red border
    setTextInputValid({ ...textInputValid, [fieldId]: true });
  };

  const handlePasswordValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const fieldId = Number(e.target.id.split('-')[1]);
    setPasswordValid((prevState) => ({
      ...prevState,
      [fieldId]: true,
    }));
  };

  const onSubmit = async (formData: FormData) => {
    try {
      const formDataObj = Object.fromEntries(formData.entries());
      localStorage.setItem('registrationFormData', JSON.stringify(formDataObj));
      router.push('/trade-account/trade-step2');
    } catch (error) {
      setFormStatus({
        status: 'error',
        message: 'An error occurred. Please try again.',
      });
    }
  };

  const getOrderedFields = () => {
    const orderedFields = [];

    // 1. First Name (from address fields)
    const firstNameField = addressFields.find((field) => field.label === 'First Name');
    if (firstNameField) {
      orderedFields.push({
        field: {
          ...firstNameField,
          label: 'First Name*',
          isRequired: true,
          isBuiltIn: false, // Set to false to prevent default red styling
        },
        type: 'text',
        fieldName: createFieldName(firstNameField, 'address'),
      });
    }

    // 2. Last Name (from address fields)
    const lastNameField = addressFields.find((field) => field.label === 'Last Name');
    if (lastNameField) {
      orderedFields.push({
        field: {
          ...lastNameField,
          label: 'Last Name*',
          isRequired: true,
          isBuiltIn: false,
        },
        type: 'text',
        fieldName: createFieldName(lastNameField, 'address'),
      });
    }

    // 3. Phone Number (from address fields) - Not required
    const phoneField = addressFields.find((field) => field.label === 'Phone Number');
    if (phoneField) {
      orderedFields.push({
        field: {
          ...phoneField,
          label: 'Phone Number',
          isRequired: false,
          isBuiltIn: false,
        },
        type: 'text',
        fieldName: createFieldName(phoneField, 'address'),
      });
    }

    // 4. Email (from customer fields)
    const emailField = customerFields.find(
      (field) =>
        field.__typename === 'TextFormField' && field.label.toLowerCase().includes('email'),
    );
    if (emailField && !CUSTOMER_FIELDS_TO_EXCLUDE.includes(emailField.entityId)) {
      orderedFields.push({
        field: {
          ...emailField,
          label: 'Email Address (Login ID)*',
          isRequired: true,
          isBuiltIn: false,
        },
        type: 'text',
        fieldName: createFieldName(emailField, 'customer'),
      });
    }

    // 5. Password (from customer fields)
    const passwordField = customerFields.find(
      (field) => field.__typename === 'PasswordFormField' && field.label === 'Password',
    );
    if (passwordField && !CUSTOMER_FIELDS_TO_EXCLUDE.includes(passwordField.entityId)) {
      orderedFields.push({
        field: {
          ...passwordField,
          label: 'Password*',
          isRequired: true,
          isBuiltIn: false,
        },
        type: 'password',
        fieldName: createFieldName(passwordField, 'customer'),
      });
    }

    return orderedFields;
  };

  const renderTextField = (field: TextFormField | AddressFormField, fieldName: string) => (
    <FieldWrapper fieldId={field.entityId} key={field.entityId}>
      <div
        onBlur={(e) => {
          if (field.label.toLowerCase().includes('email')) {
            validateEmail((e.target as HTMLInputElement).value);
          }
        }}
      >
        <Text
          field={field}
          name={fieldName}
          onChange={handleTextInputValidation}
          isValid={!emailError || !field.label.toLowerCase().includes('email')}
        />
        {field.label.toLowerCase().includes('email') && emailError && (
          <div className="absolute bottom-[5%] inline-flex w-full text-xs font-normal text-[#A71F23]">
            {emailError}
          </div>
        )}
      </div>
    </FieldWrapper>
  );

  const renderPasswordField = (field: PasswordFormField, fieldName: string) => (
    <FieldWrapper fieldId={field.entityId} key={field.entityId}>
      
        <Password
          field={field}
          isValid={passwordValid[FieldNameToFieldId.password]}
          name={fieldName}
          onChange={handlePasswordValidation}
        />
        
    </FieldWrapper>
  );

  return (
    <>
      {formStatus && (
        <Message className="mb-8" variant={formStatus.status}>
          <p>{formStatus.message}</p>
        </Message>
      )}
      <Form
        action={(data: FormData) => onSubmit(data)}
        ref={form}
        className="register-form mx-auto max-w-[38.5em] sm:pt-3 md:pt-3"
      >
        <div className="block grid-cols-1 gap-y-3">
          {getOrderedFields().map(({ field, type, fieldName }) => {
            if (type === 'password') {
              return renderPasswordField(field as PasswordFormField, fieldName);
            }
            return renderTextField(field as TextFormField, fieldName);
          })}
        </div>

        <Button
          className="relative mt-8 w-fit items-center !bg-[#008BB7] px-8 py-2 disabled:cursor-not-allowed hover:!bg-[rgb(75,200,240)] !transition-colors !duration-500"
          variant="primary"
          type="submit"
          disabled={!!emailError || !passwordValid[FieldNameToFieldId.password]}
        >
          CONTINUE
        </Button>

        <div className="mt-5 flex justify-center gap-2">
          <div className="text-center text-[16px] font-normal leading-[32px] tracking-[0.15px] text-[#03465C]">
            Already a Member?
          </div>
          <a
            href="/login"
            className="text-center font-sans text-[16px] font-bold leading-[32px] tracking-[0.15px] text-[#008BB7]"
          >
            Sign In
          </a>
        </div>
      </Form>
    </>
  );
};
