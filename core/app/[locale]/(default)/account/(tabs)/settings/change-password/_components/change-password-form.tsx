'use client';

import { useTranslations } from 'next-intl';
import { ChangeEvent, useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { z } from 'zod';

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
  Input,
} from '~/components/ui/form';
import { Message } from '~/components/ui/message';

import { useAccountStatusContext } from '../../../_components/account-status-provider';
import { changePassword } from '../_actions/change-password';

const ChangePasswordFieldsSchema = z.object({
  customerId: z.string(),
  customerToken: z.string(),
  currentPassword: z.string().min(1),
  newPassword: z.string().min(1),
  confirmPassword: z.string().min(1),
});

const CustomerChangePasswordSchema = ChangePasswordFieldsSchema.omit({
  customerId: true,
  customerToken: true,
});

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
  const t = useTranslations('Account.Settings.ChangePassword');

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
  const form = useRef<HTMLFormElement>(null);
  const t = useTranslations('Account.Settings.ChangePassword');
  const [state, formAction] = useActionState(changePassword, {
    status: 'idle',
    message: '',
  });

  const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState(true);
  const [isNewPasswordValid, setIsNewPasswordValid] = useState(true);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);

  const { setAccountState } = useAccountStatusContext();

  useEffect(() => {
    if (state.status === 'success') {
      void logout();

      setAccountState({
        status: 'success',
        message: t('confirmChangePassword'),
      });
    }
  }, [state, setAccountState, t]);

  let messageText = '';

  if (state.status === 'error') {
    messageText = state.message;
  }

  if (state.status === 'success') {
    messageText = state.message;
  }

  const handleCurrentPasswordChange = (e: ChangeEvent<HTMLInputElement>) =>
    setIsCurrentPasswordValid(!e.target.validity.valueMissing);

  const validateNewAndConfirmPasswords = (formData: FormData) => {
    const newPasswordValid = validatePasswords('new-password', formData);
    const confirmPassword = formData.get('confirm-password');
    const confirmPasswordValid = confirmPassword
      ? validatePasswords('confirm-password', formData)
      : true;

    setIsNewPasswordValid(newPasswordValid);
    setIsConfirmPasswordValid(confirmPasswordValid);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    let formData;

    if (e.target.form) {
      formData = new FormData(e.target.form);
    }

    if (formData) {
      validateNewAndConfirmPasswords(formData);
    }
  };

  return (
    <>
      {state.status === 'error' && (
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
              error={!isCurrentPasswordValid}
              id="current-password"
              onChange={handleCurrentPasswordChange}
              onInvalid={handleCurrentPasswordChange}
              required
              type="password"
            />
          </FieldControl>
          <FieldMessage
            className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs text-error"
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
              error={!isNewPasswordValid}
              id="new-password"
              onChange={handlePasswordChange}
              onInvalid={handlePasswordChange}
              required
              type="password"
            />
          </FieldControl>
          <FieldMessage
            className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs text-error"
            match="valueMissing"
          >
            {t('notEmptyMessage')}
          </FieldMessage>
          {!isNewPasswordValid && (
            <FieldMessage className="absolute inset-x-0 inline-flex w-full text-xs text-error md:bottom-0">
              {t('newPasswordValidationMessage')}
            </FieldMessage>
          )}
        </Field>
        <Field className="relative space-y-2 pb-7" name="confirm-password">
          <FieldLabel htmlFor="confirm-password" isRequired={true}>
            {t('confirmPasswordLabel')}
          </FieldLabel>
          <FieldControl asChild>
            <Input
              autoComplete="none"
              error={!isConfirmPasswordValid}
              id="confirm-password"
              onChange={handlePasswordChange}
              onInvalid={handlePasswordChange}
              required
              type="password"
            />
          </FieldControl>
          <FieldMessage
            className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs text-error"
            match="valueMissing"
          >
            {t('notEmptyMessage')}
          </FieldMessage>
          {!isConfirmPasswordValid && (
            <FieldMessage className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs text-error">
              {t('confirmPasswordValidationMessage')}
            </FieldMessage>
          )}
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
