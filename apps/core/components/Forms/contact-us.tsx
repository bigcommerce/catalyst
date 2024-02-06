import { Button } from '@bigcommerce/components/Button';
import {
  Field,
  FieldControl,
  FieldLabel,
  FieldMessage,
  Form,
  FormSubmit,
} from '@bigcommerce/components/Form';
import { Input } from '@bigcommerce/components/Input';
import { Message } from '@bigcommerce/components/Message';
import { TextArea } from '@bigcommerce/components/TextArea';
import { Loader2 as Spinner } from 'lucide-react';
import { ChangeEvent, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
// eslint-disable-next-line import/no-named-as-default
import ReCAPTCHA from 'react-google-recaptcha';

import { submitContactForm } from './_actions/submit-contact-form';

interface FormStatus {
  status: 'success' | 'error';
  message: string;
}

interface ContactUsProps {
  fields: string[];
  pageEntityId: number;
  reCaptchaSettings?: {
    siteKey: string;
  };
}

// TODO: replace mocked var when enabled field will be added to GraphQL api
const IS_RECAPTCHA_ENABLED = true;

const fieldNameMapping = {
  fullname: 'Full name',
  companyname: 'Company name',
  phone: 'Phone',
  orderno: 'Order number',
  rma: 'RMA number',
} as const;

type Field = keyof typeof fieldNameMapping;

const Submit = () => {
  const { pending } = useFormStatus();

  return (
    <FormSubmit asChild>
      <Button
        className="relative mt-8 w-fit items-center px-8 py-2"
        disabled={pending}
        variant="primary"
      >
        <>
          {pending && (
            <>
              <span className="absolute z-10 flex h-full w-full items-center justify-center bg-gray-400">
                <Spinner aria-hidden="true" className="animate-spin" />
              </span>
              <span className="sr-only">Submitting...</span>
            </>
          )}
          <span aria-hidden={pending}>Submit form</span>
        </>
      </Button>
    </FormSubmit>
  );
};

export const ContactUs = ({ fields, pageEntityId, reCaptchaSettings }: ContactUsProps) => {
  const form = useRef<HTMLFormElement>(null);
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null);
  const [isTextFieldValid, setTextFieldValidation] = useState(true);
  const [isInputValid, setInputValidation] = useState(true);
  const reCaptchaRef = useRef<ReCAPTCHA>(null);
  const [reCaptchaToken, setReCaptchaToken] = useState('');
  const [isReCaptchaValid, setReCaptchaValid] = useState(true);

  const onReCatpchaChange = (token: string | null) => {
    if (!token) {
      return setReCaptchaValid(false);
    }

    setReCaptchaToken(token);
    setReCaptchaValid(true);
  };

  const onSubmit = async (formData: FormData) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (IS_RECAPTCHA_ENABLED && !reCaptchaToken) {
      return setReCaptchaValid(false);
    }

    setReCaptchaValid(true);

    const submit = await submitContactForm({ formData, pageEntityId, reCaptchaToken });

    if (submit.status === 'success') {
      form.current?.reset();
      setFormStatus({
        status: 'success',
        message: "Thanks for reaching out. We'll get back to you soon.",
      });
    }

    if (submit.status === 'failed') {
      setFormStatus({ status: 'error', message: submit.error ?? '' });
    }

    reCaptchaRef.current?.reset();
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
      {formStatus && (
        <Message className="mx-auto lg:w-[830px]" variant={formStatus.status}>
          <p>{formStatus.message}</p>
        </Message>
      )}
      <Form
        action={onSubmit}
        className="mx-auto mb-10 mt-8 grid grid-cols-1 gap-y-6 lg:w-2/3 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-2"
        ref={form}
      >
        <>
          {fields
            .filter((field): field is Field => Object.hasOwn(fieldNameMapping, field))
            .map((field) => {
              const label = fieldNameMapping[field];

              return (
                <Field className="relative space-y-2 pb-7" key={label} name={label}>
                  <FieldLabel htmlFor={label}>{label}</FieldLabel>
                  <FieldControl asChild>
                    <Input id={label} />
                  </FieldControl>
                </Field>
              );
            })}
          <Field className="relative space-y-2 pb-7" key="email" name="email">
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
            className="relative col-span-full max-w-full space-y-2 pb-5"
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
        {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          IS_RECAPTCHA_ENABLED && (
            <Field className="relative col-span-full max-w-full space-y-2 pb-7" name="ReCAPTCHA">
              <ReCAPTCHA
                onChange={onReCatpchaChange}
                ref={reCaptchaRef}
                sitekey={reCaptchaSettings?.siteKey ?? ''}
              />
              {!isReCaptchaValid && (
                <span className="absolute inset-x-0 bottom-0 inline-flex w-full text-sm text-red-200">
                  Pass ReCAPTCHA check
                </span>
              )}
            </Field>
          )
        }
        <Submit />
      </Form>
    </>
  );
};
