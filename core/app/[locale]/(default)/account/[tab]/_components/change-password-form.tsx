'use client';

import { useTranslations } from 'next-intl';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { z } from 'zod';

import { CustomerChangePasswordSchema } from '~/client/mutations/submit-change-password';
import { logout } from '~/components/header/_actions/logout';
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
import { useRouter } from '~/navigation';

import { submitCustomerChangePasswordForm } from '../_actions/submit-customer-change-password-form';

type Passwords = z.infer<typeof CustomerChangePasswordSchema>;

const validateAgainstConfirmPassword = ({
  newPassword,
  confirmPassword,
}: {
  newPassword: Passwords['newPassword'];
  confirmPassword: Passwords['confirmPassword'];
}): boolean => newPassword === confirmPassword;

const validateAgainstCurrentPassword = ({
  newPassword,
  currentPassword,
}: {
  newPassword: Passwords['newPassword'];
  currentPassword: Passwords['currentPassword'];
}): boolean => newPassword !== currentPassword;

const validatePasswords = (
  validationField: 'new-password' | 'confirm-password',
  formData?: FormData,
) => {
  if (!formData) {
    return false;
  }

  if (validationField === 'new-password') {
    return CustomerChangePasswordSchema.omit({ confirmPassword: true })
      .refine(validateAgainstCurrentPassword)
      .safeParse({
        currentPassword: formData.get('current-password'),
        newPassword: formData.get('new-password'),
      }).success;
  }

  return CustomerChangePasswordSchema.refine(validateAgainstConfirmPassword).safeParse({
    currentPassword: formData.get('current-password'),
    newPassword: formData.get('new-password'),
    confirmPassword: formData.get('confirm-password'),
  }).success;
};

const SubmitButton = () => {
  const { pending } = useFormStatus();
  const t = useTranslations('Account.SubmitChangePassword');

  return (
    <Button
      className="relative w-full items-center px-8 py-2 md:w-fit"
      data-button
      loading={pending}
      loadingText={t('spinnerText')}
      variant="primary"
    >
      {t('submitText')}
    </Button>
  );
};

export const ChangePasswordForm = () => {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const t = useTranslations('Account.ChangePassword');
  const [state, formAction] = useFormState(submitCustomerChangePasswordForm, {
    status: 'idle',
    message: '',
  });

  const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState(true);
  const [isNewPasswordValid, setIsNewPasswordValid] = useState(true);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);

  useEffect(() => {
    if (state.status === 'success') {
      setTimeout(() => {
        void logout();
        router.push('/login');
      }, 2000);
    }
  }, [state, router]);

  let messageText = '';

  if (state.status === 'error') {
    messageText = state.message;
  }

  if (state.status === 'success') {
    messageText = t('successMessage');
  }

  const handleCurrentPasswordChange = (e: ChangeEvent<HTMLInputElement>) =>
    setIsCurrentPasswordValid(!e.target.validity.valueMissing);
  const handleNewPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    let formData;

    if (e.target.form) {
      formData = new FormData(e.target.form);
    }

    const confirmPassword = formData?.get('confirm-password');
    const isValid = confirmPassword
      ? validatePasswords('new-password', formData) &&
        validatePasswords('confirm-password', formData)
      : validatePasswords('new-password', formData);

    setIsNewPasswordValid(isValid);
  };
  const handleConfirmPasswordValidation = (e: ChangeEvent<HTMLInputElement>) => {
    let formData;

    if (e.target.form) {
      formData = new FormData(e.target.form);
    }

    const isValid = validatePasswords('confirm-password', formData);

    setIsConfirmPasswordValid(isValid);
  };

  return (
    <>
      {(state.status === 'error' || state.status === 'success') && (
        <Message className="mb-8 w-full text-gray-500" variant={state.status}>
          <p>{messageText}</p>
        </Message>
      )}

      <Form action={formAction} className="mb-14 flex flex-col gap-4 md:py-4 lg:p-0" ref={form}>
        <Field className="relative space-y-2 pb-7" name="current-password">
          <FieldLabel htmlFor="current-password" isRequired={true}>
            {t('currentPasswordLabel')}
          </FieldLabel>
          <FieldControl asChild>
            <Input
              autoComplete="none"
              id="current-password"
              onChange={handleCurrentPasswordChange}
              onInvalid={handleCurrentPasswordChange}
              required
              type="password"
              variant={!isCurrentPasswordValid ? 'error' : undefined}
            />
          </FieldControl>
          <FieldMessage
            className="absolute inset-x-0 bottom-0 inline-flex w-full text-sm text-error"
            match="valueMissing"
          >
            {t('notEmptyMessage')}
          </FieldMessage>
        </Field>
        <Field className="relative space-y-2 pb-7" name="new-password">
          <FieldLabel htmlFor="new-password" isRequired={true}>
            {t('newPasswordLabel')}
          </FieldLabel>
          <FieldControl asChild>
            <Input
              autoComplete="none"
              id="new-password"
              onChange={handleNewPasswordChange}
              onInvalid={handleNewPasswordChange}
              required
              type="password"
              variant={!isNewPasswordValid ? 'error' : undefined}
            />
          </FieldControl>
          <FieldMessage
            className="absolute inset-x-0 bottom-0 inline-flex w-full text-sm text-error"
            match="valueMissing"
          >
            {t('notEmptyMessage')}
          </FieldMessage>
          <FieldMessage
            className="absolute inset-x-0 inline-flex w-full text-sm text-error md:bottom-0"
            match={(newPasswordValue: string, formData: FormData) => {
              const currentPasswordValue = formData.get('current-password');
              const confirmPassword = formData.get('confirm-password');
              let isMatched;

              if (confirmPassword) {
                isMatched =
                  newPasswordValue !== currentPasswordValue && newPasswordValue === confirmPassword;

                setIsNewPasswordValid(isMatched);

                return !isMatched;
              }

              isMatched = currentPasswordValue === newPasswordValue;

              setIsNewPasswordValid(!isMatched);

              return isMatched;
            }}
          >
            {t('newPasswordValidationMessage')}
          </FieldMessage>
        </Field>
        <Field className="relative space-y-2 pb-7" name="confirm-password">
          <FieldLabel htmlFor="confirm-password" isRequired={true}>
            {t('confirmPasswordLabel')}
          </FieldLabel>
          <FieldControl asChild>
            <Input
              autoComplete="none"
              id="confirm-password"
              onChange={handleConfirmPasswordValidation}
              onInvalid={handleConfirmPasswordValidation}
              required
              type="password"
              variant={!isConfirmPasswordValid ? 'error' : undefined}
            />
          </FieldControl>
          <FieldMessage
            className="absolute inset-x-0 bottom-0 inline-flex w-full text-sm text-error"
            match="valueMissing"
          >
            {t('notEmptyMessage')}
          </FieldMessage>
          <FieldMessage
            className="absolute inset-x-0 bottom-0 inline-flex w-full text-sm text-error"
            match={(confirmPassword: string, formData: FormData) => {
              const newPassword = formData.get('new-password');
              const isMatched = confirmPassword === newPassword;

              setIsConfirmPasswordValid(isMatched);

              return !isMatched;
            }}
          >
            {t('confirmPasswordValidationMessage')}
          </FieldMessage>
        </Field>
        <div className="flex flex-col justify-start gap-4 md:flex-row">
          <FormSubmit asChild>
            <SubmitButton />
          </FormSubmit>
          <Button asChild className="w-full md:w-fit" variant="secondary">
            <Link href="/account/settings">{t('cancel')}</Link>
          </Button>
        </div>
      </Form>
    </>
  );
};
