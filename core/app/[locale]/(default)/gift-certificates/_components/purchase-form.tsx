'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '~/components/ui/button';
import {
  Field,
  FieldControl,
  FieldLabel,
  FieldMessage,
  Form,
  FormSubmit,
  Input,
  Select,
  TextArea,
} from '~/components/ui/form';
import { Message } from '~/components/ui/message';

import { addGiftCertificateToCart } from '../_actions/add-to-cart';

const GIFT_CERTIFICATE_THEMES = [
  'GENERAL',
  'BIRTHDAY',
  'BOY',
  'CELEBRATION',
  'CHRISTMAS',
  'GIRL',
  'NONE',
];

const defaultValues = {
  theme: 'GENERAL',
  amount: 25.0,
  senderName: 'Nate Stewart',
  senderEmail: 'nate.stewart@bigcommerce.com',
  recipientName: 'Nathan Booker',
  recipientEmail: 'nathan.booker@bigcommerce.com',
  message:
    "Hey, sorry I missed your birthday (again). No one is perfect, although I fully expect you to hold it against me. Anyway, let's get to work 🚀",
};

interface FormStatus {
  status: 'success' | 'error';
  message: string;
}

type FieldValidation = Record<string, boolean>;

const Submit = () => {
  const { pending } = useFormStatus();
  const t = useTranslations('GiftCertificate.Purchase');

  return (
    <FormSubmit asChild>
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? t('buttonPendingText') : t('buttonSubmitText')}
      </Button>
    </FormSubmit>
  );
};

export default function GiftCertificatePurchaseForm() {
  const form = useRef<HTMLFormElement>(null);
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null);
  const [fieldValidation, setFieldValidation] = useState<FieldValidation>({});

  const t = useTranslations('GiftCertificate.Purchase');

  const onSubmit = async (formData: FormData) => {
    const response = await addGiftCertificateToCart(formData);

    if (response.status === 'success') {
      form.current?.reset();
      setFormStatus({
        status: 'success',
        message: t('success'),
      });
    } else {
      setFormStatus({ status: 'error', message: response.error ?? t('error') });
    }
  };

  const handleInputValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, validity } = e.target;
    const isValid = !validity.valueMissing && !validity.typeMismatch;

    setFieldValidation((prev) => ({
      ...prev,
      [name]: isValid,
    }));
  };

  return (
    <>
      <div className="mx-auto mb-10 mt-8 lg:w-2/3">
        <h2 className="mb-4 text-2xl font-bold">{t('heading')}</h2>
      </div>
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
        <Field className="relative space-y-2 pb-7" name="theme">
          <FieldLabel htmlFor="theme" isRequired>
            {t('themeLabel')}
          </FieldLabel>
          <FieldControl asChild>
            <Select
              defaultValue={defaultValues.theme}
              name="theme"
              options={GIFT_CERTIFICATE_THEMES.map((theme) => ({
                value: theme,
                label: theme.charAt(0).toUpperCase() + theme.substring(1).toLowerCase(),
              }))}
              required
            />
          </FieldControl>
        </Field>
        <Field className="relative space-y-2 pb-7" name="amount">
          <FieldLabel htmlFor="amount" isRequired>
            {t('amountLabel')}
          </FieldLabel>
          <FieldControl asChild>
            <Input
              defaultValue={defaultValues.amount}
              error={fieldValidation.amount === false}
              id="amount"
              min="1"
              name="amount"
              onChange={handleInputValidation}
              onInvalid={handleInputValidation}
              required
              step="0.01"
              type="number"
            />
          </FieldControl>
          <FieldMessage
            className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-error"
            match="valueMissing"
          >
            {t('amountValidationMessage')}
          </FieldMessage>
        </Field>
        <Field className="relative space-y-2 pb-7" name="senderEmail">
          <FieldLabel htmlFor="senderEmail" isRequired>
            {t('senderEmailLabel')}
          </FieldLabel>
          <FieldControl asChild>
            <Input
              defaultValue={defaultValues.senderEmail}
              error={fieldValidation.senderEmail === false}
              id="senderEmail"
              name="senderEmail"
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
        <Field className="relative space-y-2 pb-7" name="senderName">
          <FieldLabel htmlFor="senderName" isRequired>
            {t('senderNameLabel')}
          </FieldLabel>
          <FieldControl asChild>
            <Input
              defaultValue={defaultValues.senderName}
              error={fieldValidation.senderName === false}
              id="senderName"
              name="senderName"
              onChange={handleInputValidation}
              onInvalid={handleInputValidation}
              required
              type="text"
            />
          </FieldControl>
          <FieldMessage
            className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-error"
            match="valueMissing"
          >
            {t('nameValidationMessage')}
          </FieldMessage>
        </Field>
        <Field className="relative space-y-2 pb-7" name="recipientEmail">
          <FieldLabel htmlFor="recipientEmail" isRequired>
            {t('recipientEmailLabel')}
          </FieldLabel>
          <FieldControl asChild>
            <Input
              defaultValue={defaultValues.recipientEmail}
              error={fieldValidation.recipientEmail === false}
              id="recipientEmail"
              name="recipientEmail"
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
        <Field className="relative space-y-2 pb-7" name="recipientName">
          <FieldLabel htmlFor="recipientName" isRequired>
            {t('recipientNameLabel')}
          </FieldLabel>
          <FieldControl asChild>
            <Input
              defaultValue={defaultValues.recipientName}
              error={fieldValidation.recipientName === false}
              id="recipientName"
              name="recipientName"
              onChange={handleInputValidation}
              onInvalid={handleInputValidation}
              required
              type="text"
            />
          </FieldControl>
          <FieldMessage
            className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-error"
            match="valueMissing"
          >
            {t('nameValidationMessage')}
          </FieldMessage>
        </Field>
        <Field className="relative col-span-full max-w-full space-y-2 pb-5" name="message">
          <FieldLabel htmlFor="message">{t('messageLabel')}</FieldLabel>
          <FieldControl asChild>
            <TextArea defaultValue={defaultValues.message} id="message" name="message" />
          </FieldControl>
        </Field>
        <Submit />
      </Form>
    </>
  );
}
