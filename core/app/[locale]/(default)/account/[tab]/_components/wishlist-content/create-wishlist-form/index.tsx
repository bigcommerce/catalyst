import { useTranslations } from 'next-intl';
import { ChangeEvent, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '~/components/ui/button';
import { DialogCancel } from '~/components/ui/dialog';
import {
  Field,
  FieldControl,
  FieldLabel,
  FieldMessage,
  Form,
  FormSubmit,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';

import { Wishlists } from '..';
import { useAccountStatusContext } from '../../account-status-provider';

import { createWishlist } from './_actions/create-wishlist';

interface Props {
  onWishlistCreated: (newWishlist: Wishlists[number]) => void;
}

const SubmitButton = () => {
  const { pending } = useFormStatus();
  const t = useTranslations('Account.Wishlist');

  return (
    <FormSubmit asChild>
      <Button
        className="relative w-fit items-center px-8 py-2"
        loading={pending}
        loadingText={t('onSubmitText')}
        variant="primary"
      >
        {t('submitFormText')}
      </Button>
    </FormSubmit>
  );
};

export const CreateWishlistForm = ({ onWishlistCreated }: Props) => {
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
    <Form action={onSubmit} className="w-full">
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
      <div className="mt-3 flex">
        <SubmitButton />
        <DialogCancel asChild>
          <Button className="ms-2 w-full lg:w-fit" variant="subtle">
            {t('cancel')}
          </Button>
        </DialogCancel>
      </div>
    </Form>
  );
};
