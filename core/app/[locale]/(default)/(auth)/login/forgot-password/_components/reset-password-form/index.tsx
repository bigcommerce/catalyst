'use client';

import { AlertCircle, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import ReCaptcha from 'react-google-recaptcha';
import { toast } from 'react-hot-toast';

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
  const [isEmailValid, setIsEmailValid] = useState(true);

  const reCaptchaRef = useRef<ReCaptcha>(null);
  const [reCaptchaToken, setReCaptchaToken] = useState<string | undefined>();
  const router = useRouter();

  const isReCaptchaValid = Boolean(reCaptchaToken);

  const onReCatpchaChange = (token: string | null) => {
    if (!token) {
      setReCaptchaToken(undefined);

      return;
    }

    setReCaptchaToken(token);
  };

  const handleEmailValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const validationStatus = e.target.validity.valueMissing || e.target.validity.typeMismatch;

    setIsEmailValid(!validationStatus);
  };

  const onSubmit = async (formData: FormData) => {
    if (!isReCaptchaValid) {
      return;
    }

    const { status, message } = await resetPassword(formData, '/change-password', reCaptchaToken);

    if (status === 'error') {
      reCaptchaRef.current?.reset();

      toast.error(message, {
        icon: <AlertCircle className="text-error-secondary" />,
      });

      return;
    }

    form.current?.reset();

    toast.success(message, {
      icon: <Check className="text-success-secondary" />,
    });

    router.push('/login');
  };

  return (
    <>
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
