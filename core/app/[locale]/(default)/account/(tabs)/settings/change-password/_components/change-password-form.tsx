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
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must include at least 8 characters, an uppercase letter, a lowercase letter, a number, and a special character.',
    ),
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

interface SubmitButtonProps {
  isFormValid: boolean;
}
const SubmitButton: React.FC<SubmitButtonProps> = ({ isFormValid }) => {
  const { pending } = useFormStatus();
  const t = useTranslations('Account.Settings.ChangePassword');

  return (
    <Button
      className="relative w-full items-center px-8 py-2 md:w-fit"
      data-button
      loading={pending}
      loadingText={t('spinnerText')}
      variant="primary"
      disabled={!isFormValid || pending} // Disable if form has errors or is submitting
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
  const [isCurrentPasswordEmpty, setIsCurrentPasswordEmpty] = useState(false);
  const [isempty, setIsEmpty] = useState(false);
  const [isNewEmpty, setIsNewEmpty] = useState(false);
  const [isConfirmEmpty, setIsConfirmEmpty] = useState(false);
  const [isSame, setIsSame] = useState(false);

  const { setAccountState } = useAccountStatusContext();

  useEffect(() => {
    if (state.status === 'success') {
      void logout();

      setAccountState({
        status: 'success',
        message: t('confirmChangePassword'),
        // isLoggedIn:false
      });
    }

    if (state.status === 'error') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
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

  const validateNewAndConfirmPasswords = (formData: FormData) => {
    const currentPassword = formData.get('current-password') as string;
    const newPassword = formData.get('new-password') as string;
    const confirmPassword = formData.get('confirm-password') as string;

    if (currentPassword.trim() !== '' && newPassword.trim() !== '') {
      setIsSame(currentPassword === newPassword);
    } else {
      setIsSame(false); // Reset or handle the initial state properly
    }
    const isNewEmpty = newPassword.trim() === '';
    const isConfirmEmpty = confirmPassword.trim() === '';

    setIsNewEmpty(isNewEmpty);
    setIsConfirmEmpty(isConfirmEmpty);

    // Validate new password only if it's not empty
    if (newPassword.trim() !== '') {
      setIsSame(currentPassword === newPassword);
      setIsNewPasswordValid(validatePasswords('new-password', formData));
    }

    if (newPassword.trim() === '') {
      setIsConfirmPasswordValid(true);
    }

    // Validate confirm password only if it's not empty
    if (confirmPassword.trim() !== '') {
      setIsConfirmPasswordValid(confirmPassword === newPassword);
    }
  };

  const handleCurrentPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value.replace(/\s/g, ''); // Remove spaces while typing
    const isEmpty = e.target.validity.valueMissing;
    setIsCurrentPasswordValid(!isEmpty);
    setIsCurrentPasswordEmpty(isEmpty);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value.replace(/\s/g, ''); // Remove spaces while typing
    if (e.target.form) {
      const formData = new FormData(e.target.form);
      validateNewAndConfirmPasswords(formData);
    }
  };

  const isFormValid = isCurrentPasswordValid && isNewPasswordValid && isConfirmPasswordValid;
  return (
    <>
      {state.status === 'error' && (
        <Message className="mb-8 w-full text-[rgb(167,31,35)] text-gray-500" variant={state.status}>
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
          {isCurrentPasswordEmpty && (
            <FieldMessage
              className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs text-[rgb(167,31,35)]"
              // match="valueMissing"
            >
              {t('notEmptyMessage')}
            </FieldMessage>
          )}
        </Field>
        <Field className="relative space-y-2 pb-7" name="new-password">
          <FieldLabel htmlFor="new-password" isRequired={true}>
            {t('newPasswordLabel')}
          </FieldLabel>
          <FieldControl asChild>
            <Input
              autoComplete="none"
              error={!isNewPasswordValid || isNewEmpty}
              id="new-password"
              onChange={handlePasswordChange}
              onInvalid={handlePasswordChange}
              required
              type="password"
            />
          </FieldControl>
          {isNewEmpty && (
            <FieldMessage
              className={`absolute inset-x-0 bottom-0 inline-flex w-full text-xs text-[rgb(167,31,35)]`}
              // match="valueMissing"
            >
              {t('notEmptyMessage')}
            </FieldMessage>
          )}
          {!isSame && (
            <FieldMessage
              className={`mt-0 text-[14px] font-normal leading-[24px] tracking-[0.25px] ${!isNewPasswordValid && !isNewEmpty ? 'text-[rgb(167,31,35)]' : 'text-[#353535]'}`}
            >
              Include uppercase, lowercase, number, symbol (8+ chars).
            </FieldMessage>
          )}

          {isSame && (
            <FieldMessage className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs text-[rgb(167,31,35)]">
              New password must differ from old password.
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
              error={!isConfirmPasswordValid || isConfirmEmpty}
              id="confirm-password"
              onChange={handlePasswordChange}
              onInvalid={handlePasswordChange}
              required
              type="password"
            />
          </FieldControl>
          {isConfirmEmpty && (
            <>
              <FieldMessage
                className={`absolute inset-x-0 bottom-0 inline-flex w-full text-xs text-[rgb(167,31,35)] ${!isConfirmPasswordValid ? 'hidden' : ''}`}
                // match="valueMissing"
              >
                {t('notEmptyMessage')}
              </FieldMessage>
            </>
          )}
          {!isConfirmPasswordValid && (
            <FieldMessage className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs text-[rgb(167,31,35)]">
              {t('confirmPasswordValidationMessage')}
            </FieldMessage>
          )}
        </Field>
        <div className="flex flex-col justify-start gap-4 md:flex-row">
          <FormSubmit asChild>
            <SubmitButton isFormValid={isFormValid} />
          </FormSubmit>
          <Button asChild className="w-full md:w-fit" variant="secondary">
            <Link href="/account/settings">{t('cancel')}</Link>
          </Button>
        </div>
      </Form>
    </>
  );
};
