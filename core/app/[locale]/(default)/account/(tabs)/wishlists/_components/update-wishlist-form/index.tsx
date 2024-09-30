import * as DialogPrimitive from '@radix-ui/react-alert-dialog';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { createWishlist as createWishlistMutation } from '~/client/mutations/create-wishlist';
import { ExistingResultType } from '~/client/util';
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

import { updateWishlist } from './_actions/update-wishlist';

type Wishlist = ExistingResultType<typeof createWishlistMutation>;

interface UpdateWishlistFormProps {
  entityId: number;
  name: string;
  onWishlistUpdated: (updatedWishlist: Wishlist) => void;
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
      {t('update')}
    </Button>
  );
};

export const UpdateWishlistForm = ({
  entityId,
  name,
  onWishlistUpdated,
}: UpdateWishlistFormProps) => {
  const [isInputValid, setInputValidation] = useState(true);

  const t = useTranslations('Account.Wishlist');

  const handleInputValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const validationStatus = e.target.validity.valueMissing;

    setInputValidation(!validationStatus);
  };

  const onSubmit = async (formData: FormData) => {
    const submit = await updateWishlist(formData);

    if (submit.status === 'success') {
      onWishlistUpdated(submit.data);
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
        <FieldMessage
          className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-error"
          match={(value) => {
            const isValid = value !== name;

            setInputValidation(isValid);

            return !isValid;
          }}
        >
          {t('differentName')}
        </FieldMessage>
      </Field>
      <Field name="entityId">
        <FieldControl asChild>
          <Input id="entityId" type="hidden" value={entityId} />
        </FieldControl>
      </Field>
      <div className="mt-3 flex flex-col lg:flex-row">
        <FormSubmit asChild>
          <SubmitButton />
        </FormSubmit>
        <DialogPrimitive.Cancel asChild>
          <Button className="mt-2 w-full border-0 lg:ms-2 lg:mt-0 lg:w-fit" variant="secondary">
            {t('cancel')}
          </Button>
        </DialogPrimitive.Cancel>
      </div>
    </Form>
  );
};
