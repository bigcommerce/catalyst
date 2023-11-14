import { Button } from '@bigcommerce/reactant/Button';
import {
  Field,
  FieldControl,
  FieldLabel,
  FieldMessage,
  Form,
  FormSubmit,
} from '@bigcommerce/reactant/Form';
import { Input } from '@bigcommerce/reactant/Input';
import { Message } from '@bigcommerce/reactant/Message';
import { TextArea } from '@bigcommerce/reactant/TextArea';
import { Loader2 as Spinner } from 'lucide-react';
import { ChangeEvent, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { cn } from '~/lib/utils';

import { submitContactForm } from './_actions/submitContactForm';

const fieldNameMapping = {
  fullname: 'Full name',
  companyname: 'Company name',
  phone: 'Phone',
  orderno: 'Order number',
  rma: 'RMA number',
} as const;

type Field = keyof typeof fieldNameMapping;

export const ContactUs = ({ fields }: { fields: string[] }) => {
  const { pending } = useFormStatus();
  const [isMessageVisible, showMessage] = useState(false);
  const [isTextFieldValid, setTextFieldValidation] = useState(true);
  const [isInputValid, setInputValidation] = useState(true);
  const onSubmit = async (formData: FormData) => {
    const { status } = await submitContactForm(formData);

    if (status === 'success') {
      showMessage(true);
    }
  };
  const handleTextFieldValidation = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTextFieldValidation(!e.target.validity.valueMissing);
  };
  const handleInputValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const validityState = e.target.validity;
    const validationStatus = validityState.valueMissing || validityState.typeMismatch;

    return setInputValidation(!validationStatus);
  };

  return (
    <>
      {isMessageVisible && (
        <Message className="mx-auto lg:w-[830px]" variant="success">
          <p>
            Thanks for reaching out. We'll get back to you soon. <strong>Keep shopping</strong>
          </p>
        </Message>
      )}
      <Form
        action={onSubmit}
        className="mx-auto mb-10 mt-8 grid grid-cols-1 gap-y-6 lg:w-2/3 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-2"
      >
        <>
          {fields
            .filter((field): field is Field => Object.hasOwn(fieldNameMapping, field))
            .map((field) => {
              const label = fieldNameMapping[field];

              return (
                <Field className={cn('relative space-y-2 pb-7')} key={label} name={label}>
                  <FieldLabel htmlFor={label}>{label}</FieldLabel>
                  <FieldControl asChild>
                    <Input id={label} />
                  </FieldControl>
                </Field>
              );
            })}
          <Field className={cn('relative space-y-2 pb-7')} key="email" name="email">
            <FieldLabel htmlFor="email" isRequired>
              Email
            </FieldLabel>
            <FieldControl asChild>
              <Input
                id="email"
                onChange={handleInputValidation}
                onInvalid={handleInputValidation}
                required
                type="email"
                variant={!isInputValid ? 'error' : undefined}
              />
            </FieldControl>
            <FieldMessage
              className="absolute inset-x-0 bottom-0 inline-flex w-full text-sm text-red-200"
              match="valueMissing"
            >
              Enter a valid email such as name@domain.com
            </FieldMessage>
            <FieldMessage
              className="absolute inset-x-0 bottom-0 inline-flex w-full text-sm text-red-200"
              match="typeMismatch"
            >
              Enter a valid email such as name@domain.com
            </FieldMessage>
          </Field>
          <Field
            className={cn('relative col-span-full max-w-full space-y-2 pb-5')}
            key="comments"
            name="comments"
          >
            <FieldLabel htmlFor="comments" isRequired>
              Comments/questions
            </FieldLabel>
            <FieldControl asChild>
              <TextArea
                id="comments"
                onChange={handleTextFieldValidation}
                onInvalid={handleTextFieldValidation}
                required
                variant={!isTextFieldValid ? 'error' : undefined}
              />
            </FieldControl>
            <FieldMessage
              className="absolute inset-x-0 bottom-0 inline-flex w-full text-sm text-red-200"
              match="valueMissing"
            >
              Please provide a valid Comments
            </FieldMessage>
          </Field>
        </>
        <FormSubmit asChild>
          <Button
            className="mt-8 w-fit items-center px-8 py-2"
            disabled={pending}
            variant="primary"
          >
            {pending ? (
              <>
                <Spinner aria-hidden="true" className="animate-spin" />
                <span className="sr-only">Submitting...</span>
              </>
            ) : (
              <span>Submit form</span>
            )}
          </Button>
        </FormSubmit>
      </Form>
    </>
  );
};
