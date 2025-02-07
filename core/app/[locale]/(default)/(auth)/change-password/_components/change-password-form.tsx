'use client';

import { useTranslations } from 'next-intl';
import { ChangeEvent, useActionState, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { z } from 'zod';

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

import { useAccountStatusContext } from '../../../account/(tabs)/_components/account-status-provider';
import { changePassword } from '../_actions/change-password';

interface Props {
  customerId: string;
  customerToken: string;
}

const CustomerChangePasswordSchema = z.object({
  newPassword: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must include at least 8 characters, an uppercase letter, a lowercase letter, a number, and a special character.',
    ),
  confirmPassword: z.string().min(1),
});

const SubmitButton = () => {
  const t = useTranslations('ChangePassword.Form');
  const { pending } = useFormStatus();

  return (
    <Button
      className="relative w-fit items-center px-8 py-2"
      data-button
      loading={pending}
      loadingText={t('submitting')}
      variant="primary"
    >
      {t('submit')}
    </Button>
  );
};

export const ChangePasswordForm = ({ customerId, customerToken }: Props) => {
  const t = useTranslations('ChangePassword.Form');
  const s = useTranslations('Account.Settings.ChangePassword');
  const form = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [state, formAction] = useActionState(changePassword, {
    status: 'idle',
    message: '',
  });

  const [newPassword, setNewPassword] = useState('');
  const [isNewPasswordValid, setIsNewPasswordValid] = useState(true);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);
  const { setAccountState } = useAccountStatusContext();

  let messageText = '';

  if (state.status === 'error') {
    messageText = state.message;
  }

  const handleNewPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setNewPassword(password);

    const validation = CustomerChangePasswordSchema.shape.newPassword.safeParse(password);
    setIsNewPasswordValid(validation.success);
  };

  const handleConfirmPasswordValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const confirmPassword = e.target.value;
    setIsConfirmPasswordValid(confirmPassword === newPassword);
  };

  if (state.status === 'success' && isConfirmPasswordValid) {
    setAccountState({ status: 'success', message: t('confirmChangePassword') });
    router.push('/login');
  }

  return (
    <>
      {state.status === 'error' && (
        <Message className="mb-8 w-full text-gray-500" variant={state.status}>
          <p>{messageText}</p>
        </Message>
      )}

      <Form action={formAction} className="mb-14 flex flex-col gap-4 md:py-4 lg:p-0" ref={form}>
        <Field className="hidden" name="customer-id">
          <FieldControl asChild>
            <Input id="customer-id" readOnly type="number" value={customerId} />
          </FieldControl>
        </Field>
        <Field className="hidden" name="customer-token">
          <FieldControl asChild>
            <Input id="customer-token" readOnly type="text" value={customerToken} />
          </FieldControl>
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
              onChange={handleNewPasswordChange}
              required
              type="password"
            />
          </FieldControl>
          <FieldMessage className="mt-0 text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#353535]">
            Include uppercase, lowercase, number, symbol (8+ chars).
          </FieldMessage>
          <FieldMessage
            className={`absolute inset-x-0 bottom-0 inline-flex w-full text-xs text-[rgb(167,31,35)] ${!isNewPasswordValid ? 'hidden' : ''}`}
            match="valueMissing"
          >
            {s('notEmptyMessage')}
          </FieldMessage>
          {!isNewPasswordValid && (
            <FieldMessage className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs text-[rgb(167,31,35)]">
              Password must include at least 8 characters, an uppercase letter, a lowercase letter,
              a number, and a special character.
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
              onChange={handleConfirmPasswordValidation}
              onInvalid={handleConfirmPasswordValidation}
              required
              type="password"
            />
          </FieldControl>
          <FieldMessage
            className={`absolute inset-x-0 bottom-0 inline-flex w-full text-xs text-[rgb(167,31,35)] ${!isNewPasswordValid ? 'hidden' : ''}`}
            match="valueMissing"
          >
            {s('notEmptyMessage')}
          </FieldMessage>
          {!isConfirmPasswordValid && (
            <FieldMessage className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs text-[rgb(167,31,35)]">
              {t('confirmPasswordValidationMessage')}
            </FieldMessage>
          )}
        </Field>

        <FormSubmit asChild>
          <SubmitButton />
        </FormSubmit>
      </Form>
    </>
  );
};
