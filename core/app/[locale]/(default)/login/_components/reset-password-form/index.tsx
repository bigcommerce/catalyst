'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import ReCaptcha from 'react-google-recaptcha';

import { type FragmentOf } from '~/client/graphql';
import { Button } from '~/components/ui/button';
import {
  Field,
  FieldControl,
  FieldLabel,
  FieldMessage,
  Form,
  FormSubmit,
  Input,
} from '~/components/ui/form';
import { Message } from '~/components/ui/message';

import { useAccountStatusContext } from '../../../account/[tab]/_components/account-status-provider';
import { submitResetPasswordForm } from '../../_actions/submit-reset-password-form';

import { ResetPasswordFormFragment } from './fragment';

interface Props {
  reCaptchaSettings?: FragmentOf<typeof ResetPasswordFormFragment>;
}

interface FormStatus {
  status: 'success' | 'error';
  message: string;
}

const SubmitButton = () => {
  const { pending } = useFormStatus();
  const t = useTranslations('Account.SubmitResetPassword');

  return (
    <Button
      className="relative w-fit items-center px-8 py-2"
      data-button
      loading={pending}
      loadingText={t('spinnerText')}
      variant="primary"
    >
      {t('submitText')}
    </Button>
  );
};

export const ResetPasswordForm = ({ reCaptchaSettings }: Props) => {
  const form = useRef<HTMLFormElement>(null);
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null);
  const [isEmailValid, setIsEmailValid] = useState(true);

  const t = useTranslations('Account.ResetPassword');

  const reCaptchaRef = useRef<ReCaptcha>(null);
  const [reCaptchaToken, setReCaptchaToken] = useState('');
  const [isReCaptchaValid, setReCaptchaValid] = useState(true);
  const { setAccountState } = useAccountStatusContext();
  const router = useRouter();

  const onReCatpchaChange = (token: string | null) => {
    if (!token) {
      setReCaptchaValid(false);

      return;
    }

    setReCaptchaToken(token);
    setReCaptchaValid(true);
  };

  const handleEmailValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const validationStatus = e.target.validity.valueMissing;

    setIsEmailValid(!validationStatus);
  };

  const onSubmit = async (formData: FormData) => {
    if (reCaptchaSettings?.isEnabledOnStorefront && !reCaptchaToken) {
      setReCaptchaValid(false);

      return;
    }

    setReCaptchaValid(true);

    const submit = await submitResetPasswordForm({
      formData,
      reCaptchaToken,
      path: '/login?action=change_password',
    });

    if (submit.status === 'success') {
      form.current?.reset();

      const customerEmail = formData.get('email');

      setAccountState({
        status: 'success',
        message: t('confirmResetPassword', { email: customerEmail?.toString() }),
      });
      router.push('/login');
    }

    if (submit.status === 'error') {
      setFormStatus({ status: 'error', message: submit.error ?? '' });
    }

    reCaptchaRef.current?.reset();
  };

  return (
    <>
      {formStatus?.status === 'error' && (
        <Message className="mb-8 w-full" variant={formStatus.status}>
          <p>{formStatus.message}</p>
        </Message>
      )}

      <p className="mb-4 text-base">{t('description')}</p>

      <Form action={onSubmit} className="mb-14 flex flex-col gap-4 md:py-4 lg:p-0" ref={form}>
        <Field className="relative space-y-2 pb-7" name="email">
          <FieldLabel htmlFor="email">{t('emailLabel')}</FieldLabel>
          <FieldControl asChild>
            <Input
              autoComplete="email"
              error={!isEmailValid}
              id="email"
              onChange={handleEmailValidation}
              onInvalid={handleEmailValidation}
              required
              type="email"
            />
          </FieldControl>
          <FieldMessage
            className="absolute inset-x-0 bottom-0 inline-flex w-full text-sm text-gray-500"
            match="valueMissing"
          >
            {t('emailValidationMessage')}
          </FieldMessage>
        </Field>

        {reCaptchaSettings?.isEnabledOnStorefront && (
          <Field className="relative col-span-full max-w-full space-y-2 pb-7" name="ReCAPTCHA">
            <ReCaptcha
              onChange={onReCatpchaChange}
              ref={reCaptchaRef}
              sitekey={reCaptchaSettings.siteKey}
            />
            {!isReCaptchaValid && (
              <span className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-red-200">
                {t('recaptchaText')}
              </span>
            )}
          </Field>
        )}

        <FormSubmit asChild>
          <SubmitButton />
        </FormSubmit>
      </Form>
    </>
  );
};
