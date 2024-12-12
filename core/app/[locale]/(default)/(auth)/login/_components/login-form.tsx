'use client';

import { AlertCircle, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'react-hot-toast';

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
} from '~/components/ui/form';

import { login } from '../_actions/login';

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

export const LoginForm = () => {
  const t = useTranslations('Login');

  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);

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

  const handleLogin = async (formData: FormData) => {
    const { status } = await login(formData);

    if (status === 'error') {
      toast.error(t('Form.error'), {
        icon: <AlertCircle className="text-error-secondary" />,
      });

      return;
    }

    toast.success(t('Form.successful'), {
      icon: <Check className="text-success-secondary" />,
    });
  };

  return (
    <Form action={handleLogin} className="mb-8 flex flex-col gap-3 md:mb-14">
      <Field className="relative space-y-2 pb-7" name="email">
        <FieldLabel htmlFor="email">{t('Form.emailLabel')}</FieldLabel>
        <FieldControl asChild>
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
          className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs text-error"
          match="valueMissing"
        >
          {t('Form.enterEmailMessage')}
        </FieldMessage>
      </Field>
      <Field className="relative space-y-2 pb-7" name="password">
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
          className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs text-error"
          match="valueMissing"
        >
          {t('Form.enterPasswordMessage')}
        </FieldMessage>
      </Field>
      <div className="flex flex-col items-start md:flex-row md:items-center md:justify-start md:gap-2">
        <FormSubmit asChild>
          <SubmitButton />
        </FormSubmit>
        <Link
          className="mx-auto my-5 inline-flex items-center justify-start px-8 py-3 font-semibold text-primary hover:text-secondary md:mx-0 md:my-0"
          href="/login/forgot-password"
        >
          {t('Form.forgotPassword')}
        </Link>
      </div>
    </Form>
  );
};
