'use client';

import { ResultOf } from 'gql.tada';
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
  Input,
  TextArea,
} from '~/components/ui/form';
import { Message } from '~/components/ui/message';

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
  const t = useTranslations('WebPages.ContactUs.Form');

  return (
    <FormSubmit asChild>
      <Button
        className="relative mt-8 w-fit items-center px-8 py-2"
        loading={pending}
        loadingText={t('onSubmitText')}
        variant="primary"
      >
        {t('submitFormText')}
      </Button>
    </FormSubmit>
  );
};

interface Props {
  node: ResultOf<typeof ContactUsFragment>['node'];
  reCaptchaSettings?: {
    isEnabledOnStorefront: boolean;
    siteKey: string;
  };
}

export const ContactUs = ({ node, reCaptchaSettings }: Props) => {
  const form = useRef<HTMLFormElement>(null);
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null);
  const [isTextFieldValid, setTextFieldValidation] = useState(true);
  const [isInputValid, setInputValidation] = useState(true);
  const reCaptchaRef = useRef<ReCaptcha>(null);
  const [reCaptchaToken, setReCaptchaToken] = useState('');
  const [isReCaptchaValid, setReCaptchaValid] = useState(true);

  const t = useTranslations('WebPages.ContactUs.Form');

  if (node?.__typename !== 'ContactPage') {
    return null;
  }

  const { contactFields: fields, entityId: pageEntityId } = node;

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

    const submit = await submitContactForm({ formData, pageEntityId, reCaptchaToken });

    if (submit.status === 'success') {
      form.current?.reset();
      setFormStatus({
        status: 'success',
        message: t('success'),
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

    setInputValidation(!validationStatus);
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
                error={!isInputValid}
                id="email"
                onChange={handleInputValidation}
                onInvalid={handleInputValidation}
                required
                type="email"
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
                error={!isTextFieldValid}
                id="comments"
                onChange={handleTextFieldValidation}
                onInvalid={handleTextFieldValidation}
                required
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
            {/* https://github.com/dozoisch/react-google-recaptcha/issues/277 */}
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-expect-error */}
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
