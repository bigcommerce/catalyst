import * as DialogPrimitive from '@radix-ui/react-alert-dialog';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { createWishlist as createWishlistMutation } from '~/client/mutations/create-wishlist';
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

import { useAccountStatusContext } from '../../account-status-provider';

import { createWishlist } from './_actions/create-wishlist';

type Wishlist = NonNullable<Awaited<ReturnType<typeof createWishlistMutation>>>;

interface CreateWishlistFormProps {
  onWishlistCreated: (newWishlist: Wishlist) => void;
}

const SubmitButton = () => {
  const { pending } = useFormStatus();
  const t = useTranslations('Account.Wishlist');

  return (
    <FormSubmit asChild>
      <Button
        className="relative w-full items-center px-8 py-2 lg:w-fit"
        loading={pending}
        loadingText={t('onSubmitText')}
        variant="primary"
      >
        {t('submitFormText')}
      </Button>
    </FormSubmit>
  );
};

export const CreateWishlistForm = ({ onWishlistCreated }: CreateWishlistFormProps) => {
  const [isInputValid, setInputValidation] = useState(true);
  const { setAccountState } = useAccountStatusContext();

  const t = useTranslations('Account.Wishlist');

  const handleInputValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const validationStatus = e.target.validity.valueMissing;

    setInputValidation(!validationStatus);
  };

  const onSubmit = async (formData: FormData) => {
    const submit = await createWishlist(formData);

    if (submit.status === 'success') {
      if (submit.data) {
        onWishlistCreated(submit.data);
        setAccountState({
          status: submit.status,
          message: t('messages.created', { name: submit.data.name }),
        });
      }
    }

    if (submit.status === 'error') {
      setAccountState({ status: submit.status, message: submit.message });
    }
  };

  return (
    <Form action={onSubmit} className="w-full" onSubmit={(e) => e.stopPropagation()}>
      <Field className="relative space-y-2 pb-7" name="name">
        <FieldLabel>{t('inputLabel')}</FieldLabel>
        <FieldControl asChild>
          <Input
            id="wishlist"
            onChange={handleInputValidation}
            onInvalid={handleInputValidation}
            required
            type="text"
            variant={!isInputValid ? 'error' : undefined}
          />
        </FieldControl>
        <FieldMessage
          className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-error"
          match="valueMissing"
        >
          {t('emptyName')}
        </FieldMessage>
      </Field>
      <div className="flex flex-col lg:flex-row">
        <SubmitButton />
        <DialogPrimitive.Cancel asChild>
          <Button className="ms-2 w-full lg:w-fit" variant="subtle">
            {t('cancel')}
          </Button>
        </DialogPrimitive.Cancel>
      </div>
    </Form>
  );
};
