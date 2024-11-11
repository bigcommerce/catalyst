'use client';

import { useTranslations } from 'next-intl';
import { ChangeEvent, useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import { BcImage } from '~/components/bc-image';
import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';
import {
  Field,
  FieldControl,
  FieldLabel,
  FieldMessage,
  Form,
  FormSubmit,
  Input,
  Checkbox,
  Label,
} from '~/components/ui/form';
import { Message } from '~/components/ui/message';

import { useAccountStatusContext } from '../../../account/(tabs)/_components/account-status-provider';
import { login, getRememberMeCookie, deleteRememberCookie } from '../_actions/login';
import { IconProps } from '../../fragments';
import { cn } from '~/lib/utils';

// Simplified PasswordInput component without eye icon
const PasswordInput = ({
  error,
  onChange,
  onInvalid,
  required,
}: {
  error: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onInvalid: (e: ChangeEvent<HTMLInputElement>) => void;
  required: boolean;
}) => {
  return (
    <div className="login-input relative !mt-[0px] h-[44px] w-full">
      <input
        className={cn(
          'peer w-full border-2 border-gray-200 px-4 py-2.5 text-base placeholder:text-gray-500 hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:bg-gray-100 disabled:hover:border-gray-200',
          error &&
            'border-error-secondary pe-12 hover:border-error focus-visible:border-error-secondary focus-visible:ring-error-secondary/20 disabled:border-gray-200',
        )}
        id="password"
        name="password"
        type="password"
        onChange={onChange}
        onInvalid={onInvalid}
        required={required}
        placeholder="Enter your password"
      />
    </div>
  );
};

const SubmitButton = () => {
  const { pending } = useFormStatus();
  const t = useTranslations('Login');

  return (
    <Button
      className="md:w-auto !w-full text-[14px] font-normal uppercase tracking-[1.25px] bg-[#008bb7] !important"
      loading={pending}
      loadingText={t('Form.submitting')}
      variant="primary"
    >
      {t('Form.logIn')}
    </Button>
  );
};

export const LoginForm = ({ logo, google, email, facebookLogo, appleLogo }: IconProps) => {
  const t = useTranslations('Login');

  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [state, formAction] = useFormState(login, { status: 'idle' });
  const { accountState } = useAccountStatusContext();
  const [showLogin, setShowLogin] = useState(false);

  const [rememberMeCookie, setRememberMeCookie] = useState<any>(null);
  useEffect(() => {
    async function fetchMyCookie() {
      let cookieValue = await getRememberMeCookie();
      if (cookieValue?.value) {
        setShowLogin(true);
        new FormData().set('email', rememberMeCookie?.value);
      }
      setRememberMeCookie(cookieValue);
    }

    fetchMyCookie();
  }, []);

  const isFormInvalid = state?.status === 'error';

  const handleInputValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const validationStatus = e.target.validity.valueMissing;

    switch (e.target.name) {
      case 'email': {
        setIsEmailValid(!validationStatus);
        return;
      }
      case 'password': {
        setIsPasswordValid(!validationStatus);
      }
    }
  };

  let cookieIsSet = 0;
  if (rememberMeCookie?.value) {
    cookieIsSet = 1;
  }

  const removeCookie = async () => {
    await deleteRememberCookie();
    setRememberMeCookie(null);
  };

  return (
    <>
      {accountState.status === 'success' && (
        <Message className="col-span-full mb-8 w-full text-gray-500" variant={accountState.status}>
          <p>{accountState.message}</p>
        </Message>
      )}

      {isFormInvalid && (
        <Message className="mb-8 lg:col-span-2" variant="error">
          <p>{t('Form.error')}</p>
        </Message>
      )}

      <Form action={formAction} className="mb-14 flex flex-col gap-3 lg:p-0">
        <Field className="relative flex flex-col items-start gap-2 space-y-2" name="email">
          {cookieIsSet === 1 && (
            <div className="flex flex-col items-center justify-center">
              <p className="text-center text-[20px] font-[500] leading-[32px] tracking-[0.15px] text-[#353535]">
                Welcome Back!
              </p>

              <div className="flex items-center">
                <p className="text-center text-[16px] font-[400] leading-[32px] tracking-[0.15px] text-[#353535]">
                  {rememberMeCookie?.value}
                </p>

                <p className="ml-5 cursor-pointer text-red-500" onClick={removeCookie}>
                  X
                </p>
              </div>
            </div>
          )}

          <FieldLabel
            className={`${cookieIsSet ? 'hidden' : ''} login-label flex items-center tracking-[0.15px]`}
            htmlFor="email"
          >
            {t('Form.emailLabel')}
          </FieldLabel>
          <FieldControl asChild className={`${cookieIsSet ? 'hidden' : ''} login-form-div mt-0`}>
            <Input
              className="login-input !mt-[0px] h-[44px] w-full"
              autoComplete="email"
              error={!isEmailValid}
              id="email"
              onChange={handleInputValidation}
              onInvalid={handleInputValidation}
              required
              type="email"
              placeholder="Enter your email"
            />
          </FieldControl>
          <FieldMessage
            className={
              cookieIsSet
                ? 'hidden'
                : 'relative inset-x-0 bottom-0 inline-flex w-full text-sm text-error'
            }
            match="valueMissing"
          >
            {t('Form.enterEmailMessage')}
          </FieldMessage>
        </Field>

        <Field className="pb- relative flex flex-col items-start gap-2 space-y-2" name="password">
          <FieldLabel
            className="login-label flex items-center tracking-[0.15px]"
            htmlFor="password"
          >
            {t('Form.passwordLabel')}
          </FieldLabel>
          <FieldControl asChild className="login-form-div mt-0">
            <Input
              className="login-input !mt-[0px] h-[44px] w-full"
              error={!isPasswordValid}
              id="password"
              onChange={handleInputValidation}
              onInvalid={handleInputValidation}
              required
              type="password"
              placeholder="Enter your password"
            />
          </FieldControl>
          <FieldMessage
            className="relative inset-x-0 bottom-0 inline-flex w-full text-sm text-error"
            match="valueMissing"
          >
            {t('Form.entePasswordMessage')}
          </FieldMessage>
        </Field>

        <div className="remember-forgot-div">
          <Field className="relative mt-2 inline-flex items-center space-y-2" name="remember-me">
            <Checkbox className='border-[#008bb7]' aria-labelledby="remember-me" id="remember-me" name="remember-me" value="1" />
            <Label
              className="ml-2 mt-0 cursor-pointer space-y-2 pb-2 md:my-0"
              htmlFor="remember-me"
              id="remember-me"
            >
              Remember me
            </Label>
          </Field>
        </div>

        <div className="login-submit-btn mt-[6px] w-full">
          <FormSubmit asChild>
            <SubmitButton />
          </FormSubmit>
        </div>

        <div className="forgot-signin-div md:grid-none grid items-center justify-between sm:grid sm:px-6 md:my-[18px] md:flex md:flex-row-reverse md:px-[0]">
          <Link
            className="my-5 inline-flex items-center justify-start text-sm font-semibold text-primary hover:text-secondary md:my-0"
            href="/login/forgot-password"
          >
            {t('Form.forgotPassword')}
          </Link>
          <p className="cursor-pointer text-center text-[16px] font-normal leading-[32px] tracking-[0.15px] text-[#353535]">
            Sign in With an Existing Account
          </p>
        </div>

        <div className="flex items-center justify-center pt-0">
          <div className="login-in-buttons flex h-[54px] w-full flex-col justify-between gap-[20px] sm:flex-row sm:gap-[20px] md:flex-col lg:flex-col lg:gap-[20px] xl:flex-row">
            <button className="flex h-[54px] w-full items-center justify-center gap-[10px] rounded-[3px] border border-[#d7d7d7] bg-[#FFFFFF] p-[15px] sm:w-full md:w-full lg:w-full xl:w-[170px]">
              <BcImage
                alt="Facebook logo"
                className="Login-logo h-[24px] w-[24px]"
                src={facebookLogo}
                width={20}
                height={20}
                priority={true}
              />
              <p className="text-[20px] font-medium text-[#1877F2]">Facebook</p>
            </button>

            <button className="flex h-[54px] w-full items-center justify-center gap-[10px] rounded-[3px] border border-[#d7d7d7] bg-[#FFFFFF] p-[15px] sm:w-full md:w-full lg:w-full xl:w-[170px]">
              <BcImage
                alt="Google logo"
                className="Login-logo h-[24px] w-[24px]"
                src={google}
                width={20}
                height={20}
                priority={true}
              />
              <p className="text-[20px] font-medium text-[#757575]">Google</p>
            </button>

            <button className="flex h-[54px] w-full items-center justify-center gap-[10px] rounded-[3px] border border-[#d7d7d7] bg-[#FFFFFF] p-[15px] sm:w-full md:w-full lg:w-full xl:w-[170px]">
              <BcImage
                alt="Apple logo"
                className="Login-logo w-[24px]"
                src={appleLogo}
                width={24}
                height={24}
                priority={true}
              />
              <p className="text-[20px] font-medium text-[#353535]">Apple</p>
            </button>
          </div>
        </div>
      </Form>
    </>
  );
};
