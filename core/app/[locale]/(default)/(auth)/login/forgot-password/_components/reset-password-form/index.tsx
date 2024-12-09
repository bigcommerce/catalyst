'use client';

import { useTranslations } from 'next-intl';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import ReCaptcha from 'react-google-recaptcha';

import {
  AccountState as FormStatus,
  useAccountStatusContext,
} from '~/app/[locale]/(default)/account/_components/account-status-provider';
import { SubmitMessagesList } from '~/app/[locale]/(default)/account/_components/submit-messages-list';
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
import { useRouter } from '~/i18n/routing';

import { resetPassword } from '../../_actions/reset-password';

import { ResetPasswordFormFragment } from './fragment';

interface Props {
  reCaptchaSettings?: FragmentOf<typeof ResetPasswordFormFragment>;
}

const SubmitButton = () => {
  const t = useTranslations('Login.ForgotPassword.Form');

  const { pending } = useFormStatus();

  return (
    <Button
      className="relative w-fit items-center px-8 py-2"
      data-button
      loading={pending}
      loadingText={t('submitting')}
      variant="primary"
    >
      {t('submit')}
    </Button>
  );
};

export const ResetPasswordForm = ({ reCaptchaSettings }: Props) => {
  const t = useTranslations('Login.ForgotPassword.Form');

  const form = useRef<HTMLFormElement>(null);
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null);
  const [isEmailValid, setIsEmailValid] = useState(true);

  const reCaptchaRef = useRef<ReCaptcha>(null);
  const [reCaptchaToken, setReCaptchaToken] = useState('');
  const [isReCaptchaValid, setReCaptchaValid] = useState(true);
  const { setAccountState } = useAccountStatusContext();
  const router = useRouter();

  useEffect(() => {
    setAccountState({ status: 'idle', messages: [''] });
  }, [setAccountState]);

  const onReCatpchaChange = (token: string | null) => {
    if (!token) {
      setReCaptchaValid(false);

      return;
    }

    setReCaptchaToken(token);
    setReCaptchaValid(true);
  };

  const handleEmailValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const validationStatus = e.target.validity.valueMissing || e.target.validity.typeMismatch;

    setIsEmailValid(!validationStatus);
  };

  const onSubmit = async (formData: FormData) => {
    if (reCaptchaSettings?.isEnabledOnStorefront && !reCaptchaToken) {
      setReCaptchaValid(false);

      return;
    }

    setReCaptchaValid(true);

    const submit = await resetPassword({
      formData,
      reCaptchaToken,
      path: '/change-password',
    });

    if (submit.status === 'success') {
      form.current?.reset();

      const customerEmail = formData.get('email');

      setAccountState({
        status: 'success',
        messages: [t('confirmResetPassword', { email: customerEmail?.toString() })],
      });
      router.push('/login');
    }

    if (submit.status === 'error') {
      setFormStatus({ status: 'error', messages: submit.errors ?? [''] });
    }

    reCaptchaRef.current?.reset();
  };

  return (
    <>
      {formStatus?.status === 'error' && (
        <Message className="mb-8 w-full whitespace-pre" variant={formStatus.status}>
          <SubmitMessagesList messages={formStatus.messages} />
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
            className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs text-error"
            match="valueMissing"
          >
            {t('emailValidationMessage')}
          </FieldMessage>
          <FieldMessage
            className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs text-error"
            match="typeMismatch"
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
              <span className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs text-error">
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
