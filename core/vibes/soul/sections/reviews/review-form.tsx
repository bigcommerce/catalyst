'use client';

import { getFormProps, SubmissionResult, useForm, useInputControl } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { FormStatus } from '@/vibes/soul/form/form-status';
import { Input } from '@/vibes/soul/form/input';
import { RatingRadioGroup } from '@/vibes/soul/form/rating-radio-group';
import { Textarea } from '@/vibes/soul/form/textarea';
import { Stream, Streamable, useStreamable } from '@/vibes/soul/lib/streamable';
import { Button } from '@/vibes/soul/primitives/button';
import { Modal } from '@/vibes/soul/primitives/modal';
import { toast } from '@/vibes/soul/primitives/toaster';
import { Image } from '~/components/image';

import { schema } from './schema';

type Action<S, P> = (state: Awaited<S>, payload: P) => S | Promise<S>;

export type SubmitReviewAction = Action<
  { lastResult: SubmissionResult | null; successMessage?: string },
  FormData
>;

interface Props {
  productId: number;
  action: SubmitReviewAction;
  trigger: React.ReactNode;
  formModalTitle?: string;
  formSubmitLabel?: string;
  formRatingLabel?: string;
  formTitleLabel?: string;
  formReviewLabel?: string;
  formNameLabel?: string;
  formEmailLabel?: string;
  streamableImages: Streamable<Array<{ src: string; alt: string }>>;
  streamableProduct: Streamable<{ name: string }>;
  streamableUser: Streamable<{ email: string; name: string }>;
}

export const ReviewForm = ({
  productId,
  action,
  trigger,
  formModalTitle = 'Write a review',
  formSubmitLabel = 'Submit',
  formRatingLabel = 'Rating',
  formTitleLabel = 'Title',
  formReviewLabel = 'Review',
  formNameLabel = 'Name',
  formEmailLabel = 'Email',
  streamableProduct,
  streamableImages,
  streamableUser,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [{ lastResult, successMessage }, formAction] = useActionState(action, {
    lastResult: null,
  });
  const formRef = useRef<HTMLFormElement>(null);

  const user = useStreamable(streamableUser);

  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(schema),
    shouldValidate: 'onSubmit',
    shouldRevalidate: 'onInput',
    defaultValue: {
      email: user.email,
      author: user.name,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    onSubmit(event, { formData }) {
      event.preventDefault();

      startTransition(() => {
        formAction(formData);
      });
    },
  });

  const ratingControl = useInputControl(fields.rating);
  const titleControl = useInputControl(fields.title);
  const textControl = useInputControl(fields.text);
  const authorControl = useInputControl(fields.author);
  const emailControl = useInputControl(fields.email);

  const isEmailDisabled = user.email !== '';
  const isAuthorDisabled = user.name !== '';

  useEffect(() => {
    if (lastResult?.status === 'success' && successMessage) {
      toast.success(successMessage);
      setIsOpen(false);
      formRef.current?.reset();
    }
  }, [lastResult, successMessage]);

  return (
    <Modal
      className="w-full md:min-w-[768px]"
      isOpen={isOpen}
      setOpen={setIsOpen}
      title={formModalTitle}
      trigger={trigger}
    >
      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <div className="shrink-0 md:w-48">
          <Stream
            fallback={
              <div className="animate-pulse">
                <div className="mb-4 aspect-square w-full max-w-[200px] rounded-md bg-contrast-100 md:max-w-none" />
                <div className="h-6 w-32 rounded-md bg-contrast-100" />
              </div>
            }
            value={Streamable.all([streamableProduct, streamableImages])}
          >
            {([product, images]) => {
              const firstImage = images[0];

              return (
                <>
                  {firstImage && (
                    <div className="relative mb-4 aspect-square w-full max-w-[200px] overflow-hidden rounded-md md:w-full md:max-w-none">
                      <Image
                        alt={firstImage.alt}
                        className="object-cover"
                        fill
                        sizes="(min-width: 768px) 192px, 200px"
                        src={firstImage.src}
                      />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                </>
              );
            }}
          </Stream>
        </div>
        <div className="min-w-0 flex-1">
          <form
            {...getFormProps(form)}
            action={formAction}
            className="flex w-full flex-col gap-5"
            ref={formRef}
          >
            <input name="productEntityId" type="hidden" value={productId} />
            <RatingRadioGroup
              errors={fields.rating.errors}
              label={formRatingLabel}
              max={5}
              name={fields.rating.name}
              onBlur={ratingControl.blur}
              onFocus={ratingControl.focus}
              onValueChange={ratingControl.change}
              required={fields.rating.required}
              value={typeof ratingControl.value === 'string' ? ratingControl.value : ''}
            />
            <Input
              errors={fields.title.errors}
              label={formTitleLabel}
              name={fields.title.name}
              onBlur={titleControl.blur}
              onChange={(e) => titleControl.change(e.currentTarget.value)}
              onFocus={titleControl.focus}
              required={fields.title.required}
              type="text"
              value={typeof titleControl.value === 'string' ? titleControl.value : ''}
            />
            <Textarea
              errors={fields.text.errors}
              label={formReviewLabel}
              name={fields.text.name}
              onBlur={textControl.blur}
              onChange={(e) => textControl.change(e.currentTarget.value)}
              onFocus={textControl.focus}
              required={fields.text.required}
              value={typeof textControl.value === 'string' ? textControl.value : ''}
            />
            <Input
              errors={fields.author.errors}
              label={formNameLabel}
              name={fields.author.name}
              onBlur={authorControl.blur}
              onChange={(e) => authorControl.change(e.currentTarget.value)}
              onFocus={authorControl.focus}
              readOnly={isAuthorDisabled}
              required={fields.author.required}
              type="text"
              value={typeof authorControl.value === 'string' ? authorControl.value : ''}
            />
            <Input
              errors={fields.email.errors}
              label={formEmailLabel}
              name={fields.email.name}
              onBlur={emailControl.blur}
              onChange={(e) => emailControl.change(e.currentTarget.value)}
              onFocus={emailControl.focus}
              readOnly={isEmailDisabled}
              required={fields.email.required}
              type="email"
              value={typeof emailControl.value === 'string' ? emailControl.value : ''}
            />
            {form.errors?.map((error, index) => (
              <FormStatus key={index} type="error">
                {error}
              </FormStatus>
            ))}
            <div className="mt-auto flex justify-end gap-3">
              <Button onClick={() => setIsOpen(false)} size="small" type="button" variant="ghost">
                Cancel
              </Button>
              <SubmitButton>{formSubmitLabel}</SubmitButton>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button loading={pending} size="small" type="submit" variant="secondary">
      {children}
    </Button>
  );
}
