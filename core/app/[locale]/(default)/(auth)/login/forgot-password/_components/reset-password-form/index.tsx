'use client';

import { useTranslations } from 'next-intl';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import ReCaptcha from 'react-google-recaptcha';

import { useAccountStatusContext } from '~/app/[locale]/(default)/account/(tabs)/_components/account-status-provider';
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

interface FormStatus {
  status: 'success' | 'error';
  message: string;
}

const SubmitButton = () => {
  const t = useTranslations('Login.ForgotPassword.Form');

  const { pending } = useFormStatus();

  return (
    <Button
      className="relative flex h-[42px] w-full flex-row items-center justify-center rounded-[3px] bg-[#008BB7] p-[5px_10px] px-8 py-2 text-[14px] font-[500] uppercase tracking-[1.25px] text-white"
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
    setAccountState({ status: 'idle' });
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
        <Message className="mb-8 w-full whitespace-pre" variant={formStatus.status}>
          <p>{formStatus.message}</p>
        </Message>
      )}

      <Form
        action={onSubmit}
        className="reset-pass-form mx-0 mt-0 flex max-w-[none] flex-col gap-[22px] pt-0 xsm:mx-auto md:mt-[30px] md:max-w-[514px] md:py-4 lg:p-0"
        ref={form}
      >
        <p className="text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
          {t('description')}
        </p>
        <div className="flex flex-col gap-[22px]">
          <Field className="flex flex-col items-start gap-[9px]" name="email">
            <FieldLabel
              className="flex items-center text-[16px] font-normal tracking-[0.15px] text-[#353535]"
              htmlFor="email"
            >
              {t('emailLabel')}
            </FieldLabel>
            <FieldControl asChild>
              <Input
                className="flex h-[44px] w-full flex-col items-start justify-center gap-[10px] rounded-[3px] border border-[#cccbcb] bg-white"
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
              className="inline-flex w-full text-sm text-gray-500"
              match="valueMissing"
            >
              {t('emailValidationMessage')}
            </FieldMessage>
          </Field>

          {reCaptchaSettings?.isEnabledOnStorefront && (
            <Field className="relative col-span-full max-w-full space-y-2" name="ReCAPTCHA">
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
        </div>
      </Form>
    </>
  );
};
