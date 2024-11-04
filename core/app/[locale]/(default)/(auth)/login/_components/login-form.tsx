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

const SubmitButton = () => {
  const { pending } = useFormStatus();
  const t = useTranslations('Login');

  return (
    <Button
      className="md:w-auto"
      loading={pending}
      loadingText={t('Form.submitting')}
      variant="primary"
    >
      {t('Form.logIn')}
    </Button>
  );
};

// 'apple-black': imageManagerImageUrl('apple-black.png.png', '24w'),
// 'facebook-blue': imageManagerImageUrl('facebook-blue.png', '16w'),

export const LoginForm = ({ logo, google, email, facebookLogo, appleLogo}: IconProps) => {
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
      {/* {showLogin && ( */}
      <Form action={formAction} className="mb-14 flex flex-col gap-3 md:p-8 lg:p-0">
        <Field className="relative space-y-2 flex flex-col items-start gap-5" name="email">
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

          
          <FieldLabel  className={`${cookieIsSet ? 'hidden' : ''} login-label flex items-center tracking-[0.15px]`} htmlFor="email">
            {t('Form.emailLabel')}
          </FieldLabel>
          <FieldControl asChild className={`${cookieIsSet ? 'hidden' : ''} mt-0 login-form-div`}>
            <Input
            className='login-input !mt-[0px] w-full h-[44px]'
              autoComplete="email"
              error={!isEmailValid}
              id="email"
              onChange={handleInputValidation}
              onInvalid={handleInputValidation}
              required
              type="email"
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
        <Field className="pb- relative space-y-2 flex flex-col items-start gap-5" name="password">
          <FieldLabel className='login-label flex items-center tracking-[0.15px]' htmlFor="password">{t('Form.passwordLabel')}</FieldLabel>
          <FieldControl asChild className='mt-0 login-form-div'>
            <Input
              className='login-input !mt-[0px] w-full h-[44px]'
              error={!isPasswordValid}
              id="password"
              onChange={handleInputValidation}
              onInvalid={handleInputValidation}
              required
              type="password"
            />
          </FieldControl>
          <FieldMessage
            className="relative inset-x-0 bottom-0 inline-flex w-full text-sm text-error"
            match="valueMissing"
          >
            {t('Form.entePasswordMessage')}
          </FieldMessage>
        </Field>
        <div className='remember-forgot-div'>
        <Field className="relative mt-2 inline-flex space-y-2 " name="remember-me">
          <Checkbox aria-labelledby="remember-me" id="remember-me" name="remember-me" value="1" />
          <Label
            className="ml-2 mt-0 cursor-pointer space-y-2 pb-2 md:my-0"
            htmlFor="remember-me"
            id="remember-me"
          >
            Remember me
          </Label>
        </Field>
        
        </div>
        <div className='login-submit-btn mt-[6px]'>
        <FormSubmit asChild>
            <SubmitButton />
        </FormSubmit>
        </div>
        <div className="forgot-signin-div my-[18px] flex flex-row-reverse items-center justify-between">
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
          {/* Continue With Email Button */}

          {/* Sign in text */}
          

          {/* Social buttons */}
          <div className="login-in-buttons w-full h-[54px] justify-between flex flex-row gap-[20px]">
            {/* Log In with Facebook Button */}
            <button className="flex h-[54px] items-center justify-center w-[144px] gap-[10px] rounded-[3px] bg-[#FFFFFF] p-[15px] border border-[#d7d7d7]">
              <BcImage
                alt="Facebook logo"
                className="Login-logo h-[24px] w-[24px]"
                src={facebookLogo}
                width={20}
                height={20}
                priority={true}
              />{' '}
              <p className='font-medium text-[20px] text-[#1877F2]'>Facebook</p>
            </button>

            {/* Log In with Google Button */}
            <button className="flex h-[54px] items-center justify-center w-[144px] gap-[10px] rounded-[3px] bg-[#FFFFFF] p-[15px] border border-[#d7d7d7]">
              <BcImage
                alt="Google logo"
                className="Login-logo h-[24px] w-[24px]"
                src={google}
                width={20}
                height={20}
                priority={true}
              />{' '}
              <p className='font-medium text-[20px] text-[#757575]'>Google</p>
            </button>

            {/* Log In with Apple Button */}
            <button className="flex h-[54px] items-center justify-center w-[144px] gap-[10px] rounded-[3px] bg-[#FFFFFF] p-[15px] border border-[#d7d7d7]">
              <BcImage
                alt="Apple logo"
                className="Login-logo w-[24px]"
                src={appleLogo}
                width={24}
                height={24}
                priority={true}
              />{' '}
              <p className='font-medium text-[20px] text-[#353535]'>Apple</p>
            </button>
          </div>
        </div>
      </Form>
      {/* )} */}
    </>
  );
};
