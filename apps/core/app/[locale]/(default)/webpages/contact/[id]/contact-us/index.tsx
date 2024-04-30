'use client';

import { type FragmentOf } from 'gql.tada';
import { Loader2 as Spinner } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import ReCaptcha from 'react-google-recaptcha';

import { Button } from '~/components/ui/button';
import {
  Field,
  FieldControl,
  FieldLabel,
  FieldMessage,
  Form,
  FormSubmit,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Message } from '~/components/ui/message';
import { TextArea } from '~/components/ui/text-area';

import { submitContactForm } from './_actions/submit-contact-form';
import { ContactUsFragment } from './fragment';

interface FormStatus {
  status: 'success' | 'error';
  message: string;
}

const fieldNameMapping = {
  fullname: 'fullNameLabel',
  companyname: 'companyNameLabel',
  phone: 'phoneLabel',
  orderno: 'orderNoLabel',
  rma: 'rmaLabel',
} as const;

type Field = keyof typeof fieldNameMapping;

const Submit = () => {
  const { pending } = useFormStatus();
  const t = useTranslations('AboutUs');

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
              <span className="sr-only">{t('onSubmitText')}</span>
            </>
          )}
          <span aria-hidden={pending}>{t('submitFormText')}</span>
        </>
      </Button>
    </FormSubmit>
  );
};

interface Props {
  data: FragmentOf<typeof ContactUsFragment>;
}

export const ContactUs = ({ data }: Props) => {
  const form = useRef<HTMLFormElement>(null);
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null);
  const [isTextFieldValid, setTextFieldValidation] = useState(true);
  const [isInputValid, setInputValidation] = useState(true);
  const reCaptchaRef = useRef<ReCaptcha>(null);
  const [reCaptchaToken, setReCaptchaToken] = useState('');
  const [isReCaptchaValid, setReCaptchaValid] = useState(true);

  const t = useTranslations('AboutUs');

  if (data.node?.__typename !== 'ContactPage') {
    return null;
  }

  const { contactFields: fields, entityId: pageEntityId } = data.node;
  const reCaptchaSettings = data.site.settings?.reCaptcha;

  const onReCaptchaChange = (token: string | null) => {
    if (!token) {
      return setReCaptchaValid(false);
    }

    setReCaptchaToken(token);
    setReCaptchaValid(true);
  };

  const onSubmit = async (formData: FormData) => {
    if (reCaptchaSettings?.isEnabledOnStorefront && !reCaptchaToken) {
      return setReCaptchaValid(false);
    }

    setReCaptchaValid(true);

    const submit = await submitContactForm({ formData, pageEntityId, reCaptchaToken });

    if (submit.status === 'success') {
      form.current?.reset();
      setFormStatus({
        status: 'success',
        message: t('sucessSubmitMessage'),
      });
    }

    if (submit.status === 'error') {
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
                <Field className="relative space-y-2 pb-7" key={label} name={field}>
                  <FieldLabel htmlFor={field}>{t(label)}</FieldLabel>
                  <FieldControl asChild>
                    <Input id={field} />
                  </FieldControl>
                </Field>
              );
            })}
          <Field className="relative space-y-2 pb-7" key="email" name="email">
            <FieldLabel htmlFor="email" isRequired>
              {t('emailLabel')}
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
              className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-error"
              match="valueMissing"
            >
              {t('emailValidationMessage')}
            </FieldMessage>
            <FieldMessage
              className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-error"
              match="typeMismatch"
            >
              {t('emailValidationMessage')}
            </FieldMessage>
          </Field>
          <Field
            className="relative col-span-full max-w-full space-y-2 pb-5"
            key="comments"
            name="comments"
          >
            <FieldLabel htmlFor="comments" isRequired>
              {t('commentsLabel')}
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
              className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-error"
              match="valueMissing"
            >
              {t('commentsValidationMessage')}
            </FieldMessage>
          </Field>
        </>
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
        <Submit />
      </Form>
    </>
  );
};
