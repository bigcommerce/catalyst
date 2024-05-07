'use client';

import { Loader2 as Spinner } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';
import {
  Field,
  FieldControl,
  FieldLabel,
  FieldMessage,
  Form,
  FormSubmit,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Message } from '~/components/ui/message';

import { submitLoginForm } from '../_actions/submit-login-form';

export const LoginForm = () => {
  const { pending } = useFormStatus();
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [state, formAction] = useFormState(submitLoginForm, { status: 'idle' });

  const t = useTranslations('Account.Login');

  const isFormInvalid = state?.status === 'error';

  const handleInputValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const validationStatus = e.target.validity.valueMissing;

    switch (e.target.name) {
      case 'email':
        return setIsEmailValid(!validationStatus);

      case 'password':
        return setIsPasswordValid(!validationStatus);

      default:
    }
  };

  return (
    <>
      {isFormInvalid && (
        <Message
          aria-labelledby="error-message"
          aria-live="polite"
          className="mb-8 lg:col-span-2"
          role="region"
          variant="error"
        >
          <p id="error-message">{t('Form.errorMessage')}</p>
        </Message>
      )}
      <Form action={formAction} className="mb-14 flex flex-col gap-3 md:p-8 lg:p-0">
        <Field className="relative space-y-2 pb-7" name="email">
          <FieldLabel htmlFor="email">{t('Form.emailLabel')}</FieldLabel>
          <FieldControl asChild>
            <Input
              autoComplete="email"
              id="email"
              onChange={handleInputValidation}
              onInvalid={handleInputValidation}
              required
              type="email"
              variant={!isEmailValid ? 'error' : undefined}
            />
          </FieldControl>
          <FieldMessage
            className="absolute inset-x-0 bottom-0 inline-flex w-full text-sm text-error"
            match="valueMissing"
          >
            {t('Form.enterEmailMessage')}
          </FieldMessage>
        </Field>
        <Field className="relative space-y-2 pb-7" name="password">
          <FieldLabel htmlFor="password">{t('Form.passwordLabel')}</FieldLabel>
          <FieldControl asChild>
            <Input
              id="password"
              onChange={handleInputValidation}
              onInvalid={handleInputValidation}
              required
              type="password"
              variant={!isPasswordValid ? 'error' : undefined}
            />
          </FieldControl>
          <FieldMessage
            className="absolute inset-x-0 bottom-0 inline-flex w-full text-sm text-error"
            match="valueMissing"
          >
            {t('Form.entePasswordMessage')}
          </FieldMessage>
        </Field>
        <div className="flex flex-col items-start md:flex-row md:items-center md:justify-start md:gap-10">
          <FormSubmit asChild>
            <Button className="w-auto" disabled={pending} variant="primary">
              {pending ? (
                <>
                  <Spinner aria-hidden="true" className="animate-spin" />
                  <span className="sr-only"> {t('Form.submitting')}</span>
                </>
              ) : (
                <span>{t('Form.logIn')}</span>
              )}
            </Button>
          </FormSubmit>
          <Link
            className="my-5 inline-flex items-center justify-start text-primary hover:text-secondary md:my-0"
            href={{
              pathname: '/login',
              query: { action: 'reset_password' },
            }}
          >
            {t('Form.forgotPassword')}
          </Link>
        </div>
      </Form>
    </>
  );
};
