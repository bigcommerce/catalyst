import * as DialogPrimitive from '@radix-ui/react-alert-dialog';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useState } from 'react';
import { useFormStatus } from 'react-dom';

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

interface CreateWishlistDialogProps {
  onWishlistCreated?: (wishlist: any) => void;
}

const SubmitButton = () => {
  const { pending } = useFormStatus();
  const t = useTranslations('Account.Wishlist');

  return (
    <Button
      className="mx-auto block h-[3.5em] w-[10em] rounded-[3px] bg-[#008BB7] py-2 text-[14px] font-medium uppercase leading-8 text-white"
      loading={pending}
      loadingText={t('onSubmitText')}
    >
      CREATE
    </Button>
  );
};

export const CreateWishlistDialog = ({ onWishlistCreated }: CreateWishlistDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isInputValid, setInputValidation] = useState(true);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const { setAccountState } = useAccountStatusContext();
  const t = useTranslations('Account.Wishlist');

  const handleInputValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const currentValue = e.target.value.trim();

    setInputValidation(!e.target.validity.valueMissing);
    setIsDuplicate(false);

    if (!currentValue) {
      setInputValidation(false);
      return;
    }

    const wishlistElements = document.querySelectorAll('.wishlist-item');
    const existingNames = Array.from(wishlistElements)
      .map((element) => element.querySelector('.wishlist-name')?.textContent?.toLowerCase().trim())
      .filter(Boolean);

    if (existingNames.includes(currentValue.toLowerCase())) {
      setIsDuplicate(true);
      setInputValidation(false);
    }
  };

  const onSubmit = async (formData: FormData) => {
    const name = (formData.get('name') as string).trim();

    if (!name) {
      setInputValidation(false);
      return;
    }

    const wishlistElements = document.querySelectorAll('.wishlist-item');
    const existingNames = Array.from(wishlistElements)
      .map((element) => element.querySelector('.wishlist-name')?.textContent?.toLowerCase().trim())
      .filter(Boolean);

    if (existingNames.includes(name.toLowerCase())) {
      setIsDuplicate(true);
      setInputValidation(false);
      return;
    }

    const submit = await createWishlist(formData);

    if (submit.status === 'success') {
      setIsOpen(false);
      setAccountState((prevState) => ({
        ...prevState,
        status: submit.status,
        message: t('messages.created', { name: submit.data.name }),
      }));
      if (onWishlistCreated) {
        onWishlistCreated(submit.data);
      }
    }

    if (submit.status === 'error') {
      setAccountState((prevState) => ({
        ...prevState,
        status: submit.status,
        message: submit.message,
      }));
    }
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <DialogPrimitive.Trigger asChild>
        <Button className="h-[45px] w-[12em] rounded-sm bg-[#03465C] !px-[0] text-left text-sm font-medium leading-8 tracking-wide text-white">
          <span className="mr-[5px] text-[20px]"> + </span> CREATE NEW LIST
        </Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 bg-black/40" />
        <DialogPrimitive.Content className="data-[state=open]:animate-contentShow fixed left-1/2 top-1/2 w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2  bg-white p-6 pb-[45px] pl-[45px] pr-[45px] pt-[40px] shadow-xl">
          <div className="flex flex-col items-center">
            <DialogPrimitive.Cancel asChild className="">
              <button className="mb-2 text-[16px] font-[600] text-black">✕</button>
            </DialogPrimitive.Cancel>

            <DialogPrimitive.Title className="mb-[30px] mt-2 text-center text-2xl font-normal leading-8">
              Create New List
            </DialogPrimitive.Title>
          </div>

          <Form action={onSubmit} className="w-full" onSubmit={(e) => e.stopPropagation()}>
            <Field className="relative space-y-2 pb-7" name="name">
              <FieldLabel htmlFor="wishlist-name" className="font-normal text-black">
                Name
              </FieldLabel>
              <FieldControl asChild>
                <Input
                  autoFocus
                  error={!isInputValid}
                  id="wishlist-name"
                  onChange={handleInputValidation}
                  onInvalid={handleInputValidation}
                  required
                  type="text"
                  className="w-full rounded-md"
                  placeholder="Name your list"
                />
              </FieldControl>
              {isDuplicate ? (
                <FieldMessage className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-[#A71F23]">
                  A list with this name already exists
                </FieldMessage>
              ) : (
                <FieldMessage
                  className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-[#A71F23]"
                  match="valueMissing"
                >
                  {t('emptyName')}
                </FieldMessage>
              )}
            </Field>

            <div className="mt-[20px]">
              <FormSubmit asChild>
                <SubmitButton />
              </FormSubmit>
            </div>
          </Form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
