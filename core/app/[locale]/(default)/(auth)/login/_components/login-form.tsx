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
  Label
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

export const LoginForm = ({ logo, fb, google, email, apple }: IconProps) => {
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

    fetchMyCookie()
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
  }

  return (
    <>
      {/* Logo */}
      <BcImage
        alt="Login-logo"
        className="Login-logo"
        src={logo}
        width={150}
        height={150}
        priority={true}
      />
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
      {showLogin && <Form action={formAction} className="mb-14 flex flex-col gap-3 md:p-8 lg:p-0">
        <Field className="relative space-y-2" name="email">
          {cookieIsSet === 1 &&
            <div className='flex flex-col items-center justify-center'>
             <p className="font-open-sans text-[20px] font-[500] leading-[32px] tracking-[0.15px] text-center text-[#353535]">
    Welcome Back!
</p>


 <div className="flex items-center">
<p className="font-open-sans text-[16px] font-[400] leading-[32px] tracking-[0.15px] text-center text-[#353535]">
    {rememberMeCookie?.value}
</p>

<p className="ml-5 text-red-500 cursor-pointer" onClick={removeCookie}>
  X
</p>

</div>



            </div> 
          }

<p
  onClick={() => setShowLogin(false)}
  className="mb-0 mt-1 text-[12px] font-[400] leading-[18px] tracking-[0.4px] text-center text-[#008BB7] underline"
>
  Use a Different Account
</p>
          <FieldLabel className={cookieIsSet? 'hidden': ''} htmlFor="email">{t('Form.emailLabel')}</FieldLabel>
          <FieldControl asChild className={cookieIsSet? 'hidden': ''}>
            <Input
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
            className={cookieIsSet? 'hidden': 'relative inset-x-0 bottom-0 inline-flex w-full text-sm text-error'}
            match="valueMissing"
          >
            {t('Form.enterEmailMessage')}
          </FieldMessage> 
        </Field>
        <Field className="relative space-y-2 pb-" name="password">
          <FieldLabel htmlFor="password">{t('Form.passwordLabel')}</FieldLabel>
          <FieldControl asChild>
            <Input
              error={!isPasswordValid}
              id="password"
              onChange={handleInputValidation}
              onInvalid={handleInputValidation}
              required
              type="password"
            />
          </FieldControl>
          <FieldMessage
            className="absolute inset-x-0 bottom-0 inline-flex w-full text-sm text-error"
            match="valueMissing"
          >
            {t('Form.entePasswordMessage')}
          </FieldMessage>
        </Field>
        <Field className="relative space-y-2 pb-4 mt-2 inline-flex" name="remember-me">
          <Checkbox
            aria-labelledby="remember-me"
            id="remember-me"
            name="remember-me"
            value="1"
          />
          <Label className="cursor-pointer space-y-2 pb-2 md:my-0 mt-0 ml-2" htmlFor="remember-me" id="remember-me">
            Remember me
          </Label>
        </Field>
        <div className="flex flex-col items-start md:flex-row md:items-center md:justify-start md:gap-5">
          <FormSubmit asChild>
            <SubmitButton />
          </FormSubmit>
          <Link
            className="my-5 inline-flex items-center justify-start text-sm font-semibold text-primary hover:text-secondary md:my-0"
            href="/login/forgot-password"
          >
            {t('Form.forgotPassword')}
          </Link>
        </div>
      </Form>}
      {!showLogin &&
        <div className="flex flex-col items-center justify-center p-6 pt-0">
          {/* Continue With Email Button */}
          <button onClick={() => setShowLogin(true)} className="mb-4 mt-6 flex h-[54px] w-[345px] items-center gap-[10px] rounded-[10px] bg-[#002A37] px-[61px] py-[11px] text-[#FFFFFF] shadow-[0px_2px_5px_#0000002B] hover:bg-[#001f29]">
            <BcImage
              alt="Email icon"
              className="Login-logo"
              src={email}
              width={18}
              height={18}
              priority={true}
            />
            Continue With Email
          </button>

          {/* Sign in text */}
          <p className="mb-4 text-center text-[16px] font-normal leading-[32px] tracking-[0.15px] text-[#353535] cursor-pointer">
            Or, Sign in with an Existing Account
          </p>

          {/* Social buttons */}
          <div className="login-in-buttons">
            {/* Log In with Facebook Button */}
            <button className="mb-4 block flex h-[54px] w-[345px] items-center gap-[10px] rounded-[10px] bg-[#1877F2] px-[61px] py-[11px] font-bold text-[#FFFFFF] shadow-[0px_2px_3px_#0000002B] hover:bg-blue-700">
              <BcImage
                alt="Facebook logo"
                className="Login-logo"
                src={fb}
                width={20}
                height={20}
                priority={true}
              />{' '}
              Log In with Facebook
            </button>

            {/* Log In with Google Button */}
            <button className="mb-4 block flex h-[54px] w-[345px] items-center gap-[10px] rounded-[10px] bg-[#FFFFFF] px-[61px] py-[11px] text-[#0000008A] shadow-[0px_0px_5px_#00000015] shadow-[0px_2px_5px_#0000002B] hover:bg-gray-200">
              <BcImage
                alt="Google logo"
                className="Login-logo"
                src={google}
                width={20}
                height={20}
                priority={true}
              />{' '}
              Log In with Google
            </button>

            {/* Log In with Apple Button */}
            <button className="block flex h-[54px] w-[345px] items-center gap-[10px] rounded-[10px] bg-[#353535] px-[61px] py-[11px] text-[#FFFFFF] shadow-[0px_2px_5px_#0000002B] hover:bg-gray-700">
              <BcImage
                alt="Apple logo"
                className="Login-logo"
                src={apple}
                width={24}
                height={24}
                priority={true}
              />{' '}
              Log In with Apple
            </button>
          </div>
        </div>
      }
    </>
  );
};
