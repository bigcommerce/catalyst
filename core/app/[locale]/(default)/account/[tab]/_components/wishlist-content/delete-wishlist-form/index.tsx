import * as DialogPrimitive from '@radix-ui/react-alert-dialog';
import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';

import { Button } from '~/components/ui/button';
import { Field, FieldControl, Form, FormSubmit } from '~/components/ui/form';
import { Input } from '~/components/ui/input';

import { deleteWishlists } from './_actions/delete-wishlists';

const SubmitButton = () => {
  const { pending } = useFormStatus();
  const t = useTranslations('Account.Wishlist');

  return (
    <FormSubmit asChild>
      <Button
        className="relative w-full items-center px-8 py-2 lg:w-fit"
        loading={pending}
        loadingText={t('onDeleteSubmitText')}
        variant="primary"
      >
        {t('deleteSubmitFormText')}
      </Button>
    </FormSubmit>
  );
};

interface DeleteWishlistFormProps {
  id: number;
  name: string;
  onWishistDeleted: (id: number, name: string) => void;
}

export const DeleteWishlistForm = ({ onWishistDeleted, id, name }: DeleteWishlistFormProps) => {
  const t = useTranslations('Account.Wishlist');

  const onSubmit = async (formData: FormData) => {
    const submit = await deleteWishlists(formData);

    if (submit.status === 'success') {
      onWishistDeleted(id, name);
    }
  };

  return (
    <Form action={onSubmit}>
      <Field name="id">
        <FieldControl asChild>
          <Input defaultValue={id} type="hidden" />
        </FieldControl>
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
