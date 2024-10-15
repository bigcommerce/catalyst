import * as DialogPrimitive from '@radix-ui/react-alert-dialog';
import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';

import { Button } from '~/components/ui/button';
import { Field, FieldControl, Form, FormSubmit, Input } from '~/components/ui/form';

import { deleteWishlists } from './_actions/delete-wishlists';

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
      {t('delete')}
    </Button>
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
