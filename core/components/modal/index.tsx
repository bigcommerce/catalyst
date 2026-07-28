'use client';

import { getFormProps, SubmissionResult, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { Close } from '@radix-ui/react-dialog';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { z } from 'zod';

import { Button, ButtonProps } from '@/vibes/soul/primitives/button';
import {
  Modal as ModalPrimitive,
  ModalProps as ModalPrimitiveProps,
} from '@/vibes/soul/primitives/modal';

import { ModalFormContext } from './modal-form-provider';

export interface ModalButton {
  label: string;
  className?: string;
  variant?: ButtonProps['variant'];
  type?: 'submit' | 'cancel';
  action?: () => void | Promise<void>;
}

type Action<S, P> = (state: Awaited<S>, payload: P) => S | Promise<S>;

export interface ModalFormState {
  lastResult: SubmissionResult | null;
  successMessage?: string;
  errorMessage?: string;
}

export type ModalFormAction = Action<ModalFormState, FormData>;

interface ModalFormProps {
  action: ModalFormAction;
  onSuccess?: (state: ModalFormState) => void;
  onError?: (state: ModalFormState) => void;
}

interface ModalProps extends ModalPrimitiveProps {
  buttons?: ModalButton[];
  form?: ModalFormProps;
}

export const Modal = ({ buttons = [], form, children, ...props }: ModalProps) => {
  return (
    <ModalPrimitive {...props}>
      <ModalFormWrapper form={form}>
        <div>{children}</div>
        {buttons.length > 0 && (
          <div className="mt-5 flex flex-row justify-end gap-2">
            {buttons.map((button, index) => (
              <ModalButton key={index} {...button} />
            ))}
          </div>
        )}
      </ModalFormWrapper>
    </ModalPrimitive>
  );
};

function ModalButton({ label, className, variant, type, action }: ModalButton) {
  switch (type) {
    case 'cancel':
      return (
        <Close asChild>
          <Button className={className} size="small" variant="ghost">
            {label}
          </Button>
        </Close>
      );

    case 'submit':
      return (
        <ModalSubmitButton
          className={className}
          label={label}
          type="submit"
          variant={variant ?? 'primary'}
        />
      );

    default:
      return (
        <Button className={className} onClick={action} size="small" variant={variant ?? 'primary'}>
          {label}
        </Button>
      );
  }
}

function ModalSubmitButton({ label, className, variant }: ModalButton) {
  const { pending } = useFormStatus();

  return (
    <Button
      className={className}
      loading={pending}
      size="small"
      type="submit"
      variant={variant ?? 'primary'}
    >
      {label}
    </Button>
  );
}

function ModalFormWrapper({
  form,
  children,
}: {
  children: React.ReactNode;
  form?: ModalFormProps;
}) {
  if (form) {
    return <ModalForm {...form}>{children}</ModalForm>;
  }

  return children;
}

function ModalForm({
  children,
  action,
  onSuccess,
  onError,
}: { children: React.ReactNode } & ModalFormProps) {
  const shouldCallback = useRef(false);
  const [schema, setSchema] = useState<z.ZodTypeAny | undefined>();
  const [state, formAction] = useActionState(action, {
    lastResult: null,
  });

  const [form, fields] = useForm({
    constraint: schema ? getZodConstraint(schema) : undefined,
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    lastResult: state.lastResult,
    onValidate: schema ? ({ formData }) => parseWithZod(formData, { schema }) : undefined,
    onSubmit: () => {
      shouldCallback.current = true;
    },
  });

  useEffect(() => {
    if (!shouldCallback.current) {
      return;
    }

    switch (state.lastResult?.status) {
      case 'success': {
        onSuccess?.(state);
        break;
      }

      case 'error': {
        onError?.(state);
        break;
      }
    }

    shouldCallback.current = false;
  }, [onSuccess, onError, state]);

  return (
    <ModalFormContext.Provider value={{ form, fields, state, schema, setSchema }}>
      <form {...getFormProps(form)} action={formAction}>
        {children}
      </form>
    </ModalFormContext.Provider>
  );
}
