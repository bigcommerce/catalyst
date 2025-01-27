'use client';

import { useTranslations } from 'next-intl';
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
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
      className="relative mb-[60px] flex h-[50px] w-full flex-row items-center justify-center rounded-[3px] bg-[#008BB7] p-[5px_10px] px-8 py-2 text-[14px] font-[500] uppercase tracking-[1.25px] text-white hover:bg-[rgb(75,200,240)] transition-colors duration-500"
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
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [emailError, setEmailError] = useState('');
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null);

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


  const validateEmail = ()=> {
    const email = emailInputRef.current?.value || '';
    // Check if email is empty
    if (!email.trim()) {
      setEmailError(t('emailValidationMessage'));
      return false;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    // Check if email is invalid
    if (!emailRegex.test(email)) {
      setEmailError(t('emailInvalidMessage'));
      return false;
    }

    setEmailError('');
    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {

    event.preventDefault();

     // Reset previous statuses
     setFormStatus(null);

    if (reCaptchaSettings?.isEnabledOnStorefront && !reCaptchaToken) {
      setReCaptchaValid(false);
      return;
    }

    setReCaptchaValid(true);

    try {
      const formData = new FormData(event.currentTarget);
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
      } else {
        setFormStatus({ status: 'error', message: t('emailInvalidMessage') });
      }
    } catch (error) {
      setFormStatus({ status: 'error', message: t('emailInvalidMessage') });
    } finally {
      reCaptchaRef.current?.reset();
    }
  };

  return (
    <>
      {formStatus?.status === 'error' && (
        <Message className="mb-8 w-full whitespace-pre" variant={formStatus.status}>
          <p>{formStatus.message}</p>
        </Message>
      )}

      <Form
        onSubmit={handleSubmit}
        className="reset-pass-form mx-0 mt-0 flex flex-col gap-[22px] pt-0  md:mt-[30px] max-w-[704px] lg:max-w-[508px] md:mx-auto py-5 lg:p-0"
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
                ref={emailInputRef}
                className="flex h-[44px] w-full flex-col items-start justify-center gap-[10px] rounded-[3px] border-[#cccbcb] bg-white"
                autoComplete="email"
                id="email"
                name="email"
                required
                type="email"
                onBlur={validateEmail}
              />
            </FieldControl>
            {emailError &&(
              <FieldMessage className="w-full text-red-700" variant="error">
                {emailError}
              </FieldMessage>
            )}
          </Field>

          {reCaptchaSettings?.isEnabledOnStorefront && (
            <Field className="relative col-span-full max-w-full space-y-2" name="ReCAPTCHA">
              <ReCaptcha
                onChange={onReCatpchaChange}
                ref={reCaptchaRef}
                sitekey={reCaptchaSettings.siteKey}
              />
              {!isReCaptchaValid && (
                <span className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-[rgb(167,31,35)] ">
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
