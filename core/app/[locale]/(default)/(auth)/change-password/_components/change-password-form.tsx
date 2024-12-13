'use client';

import { AlertCircle, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'react-hot-toast';

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
import { useRouter } from '~/i18n/routing';

import { changePassword } from '../_actions/change-password';

interface Props {
  customerId: string;
  customerToken: string;
}

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

  const router = useRouter();

  const [newPassword, setNewPasssword] = useState('');
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);

  const handleNewPasswordChange = (e: ChangeEvent<HTMLInputElement>) =>
    setNewPasssword(e.target.value);

  const handleConfirmPasswordValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const confirmPassword = e.target.value;

    setIsConfirmPasswordValid(confirmPassword === newPassword);
  };

  const handleChangePassword = async (formData: FormData) => {
    const { status, message } = await changePassword(formData);

    if (status === 'error') {
      toast.error(message, {
        icon: <AlertCircle className="text-error-secondary" />,
      });

      return;
    }

    toast.success(message, {
      icon: <Check className="text-success-secondary" />,
    });

    router.push('/login');
  };

  return (
    <Form action={handleChangePassword} className="mb-14 flex flex-col gap-4 md:py-4 lg:p-0">
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
            id="new-password"
            onChange={handleNewPasswordChange}
            required
            type="password"
          />
        </FieldControl>
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
          className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs text-error"
          match={(value: string) => value !== newPassword}
        >
          {t('confirmPasswordValidationMessage')}
        </FieldMessage>
      </Field>

      <FormSubmit asChild>
        <SubmitButton />
      </FormSubmit>
    </Form>
  );
};
