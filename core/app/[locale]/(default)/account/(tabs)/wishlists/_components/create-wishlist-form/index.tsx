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
  Input,
} from '~/components/ui/form';

import { useAccountStatusContext } from '../../../_components/account-status-provider';

import { createWishlist } from './_actions/create-wishlist';

type Wishlist = NonNullable<Awaited<ReturnType<typeof createWishlistMutation>>>;

interface CreateWishlistFormProps {
  onWishlistCreated: (newWishlist: Wishlist) => void;
}

const SubmitButton = () => {
  const { pending } = useFormStatus();
  const t = useTranslations('Account.Wishlist');

  return (
    <Button
      className="relative w-full items-center px-8 py-2 lg:w-fit"
      loading={pending}
      loadingText={t('onSubmitText')}
      variant="primary"
    >
      {t('create')}
    </Button>
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
      onWishlistCreated(submit.data);
      setAccountState({
        status: submit.status,
        message: t('messages.created', { name: submit.data.name }),
      });
    }

    if (submit.status === 'error') {
      setAccountState({ status: submit.status, message: submit.message });
    }
  };

  return (
    <Form action={onSubmit} className="w-full" onSubmit={(e) => e.stopPropagation()}>
      <Field className="relative space-y-2 pb-7" name="name">
        <FieldLabel htmlFor="wishlist-name">{t('inputLabel')}</FieldLabel>
        <FieldControl asChild>
          <Input
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            error={!isInputValid}
            id="wishlist-name"
            onChange={handleInputValidation}
            onInvalid={handleInputValidation}
            required
            type="text"
          />
        </FieldControl>
        <FieldMessage
          className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-error"
          match="valueMissing"
        >
          {t('emptyName')}
        </FieldMessage>
      </Field>
      <div className="mt-3 flex flex-col lg:flex-row">
        <FormSubmit asChild>
          <SubmitButton />
        </FormSubmit>
        <DialogPrimitive.Root>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0" />
            <DialogPrimitive.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
              <DialogPrimitive.Cancel asChild>
                <Button className="mt-2 w-full border-0 lg:ms-2 lg:mt-0 lg:w-fit" variant="secondary">
                  {t('cancel')}
                </Button>
              </DialogPrimitive.Cancel>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </div>
    </Form>
  );
};
