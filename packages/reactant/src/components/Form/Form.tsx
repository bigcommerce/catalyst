import * as FormPrimitive from '@radix-ui/react-form';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cs } from '../../utils/cs';
import { Label } from '../Label';

export type ValidationPattern =
  | 'badInput'
  | 'patternMismatch'
  | 'rangeOverflow'
  | 'rangeUnderflow'
  | 'stepMismatch'
  | 'tooLong'
  | 'tooShort'
  | 'typeMismatch'
  | 'valid'
  | 'valueMissing';

export type ValidationFunction =
  | ((value: string, formData: FormData) => boolean)
  | ((value: string, formData: FormData) => Promise<boolean>);
export type ControlValidationPatterns = ValidationPattern & ValidationFunction;
export type BuiltInValidityState = {
  [pattern in ValidationPattern]: boolean;
};

export const Form = forwardRef<
  ElementRef<typeof FormPrimitive.Root>,
  ComponentPropsWithRef<typeof FormPrimitive.Root>
>(({ className, ...props }, ref) => (
  <FormPrimitive.Root className={cs('text-base', className)} ref={ref} {...props} />
));

export const Field = forwardRef<
  ElementRef<typeof FormPrimitive.Field>,
  ComponentPropsWithRef<typeof FormPrimitive.Field>
>(({ className, children, ...props }, ref) => (
  <FormPrimitive.Field className={cs(className)} ref={ref} {...props}>
    {children}
  </FormPrimitive.Field>
));

interface FieldMessageProps
  extends Omit<ComponentPropsWithRef<typeof FormPrimitive.Message>, 'match'> {
  match?: ValidationPattern;
}

export const FieldMessage = forwardRef<ElementRef<typeof FormPrimitive.Message>, FieldMessageProps>(
  ({ className, children, ...props }, ref) => (
    <FormPrimitive.Message className={cs(className)} ref={ref} {...props}>
      {children}
    </FormPrimitive.Message>
  ),
);

interface FieldLabelProps extends ComponentPropsWithRef<typeof Label> {
  isRequired?: boolean;
}

export const FieldLabel = forwardRef<ElementRef<typeof Label>, FieldLabelProps>(
  ({ className, children, isRequired, ...props }, ref) => (
    <Label
      className={cs('inline-flex w-full items-center justify-between', className)}
      ref={ref}
      {...props}
    >
      <span>{children}</span>
      {isRequired && <span className="text-sm font-normal text-gray-500">Required</span>}
    </Label>
  ),
);

export const FieldControl = forwardRef<
  ElementRef<typeof FormPrimitive.Control>,
  ComponentPropsWithRef<typeof FormPrimitive.Control>
>(({ className, children, ...props }, ref) => (
  <FormPrimitive.Control className={cs(className)} ref={ref} {...props}>
    {children}
  </FormPrimitive.Control>
));

export const FormSubmit = forwardRef<
  ElementRef<typeof FormPrimitive.Submit>,
  ComponentPropsWithRef<typeof FormPrimitive.Submit>
>(({ className, children, ...props }, ref) => (
  <FormPrimitive.Submit className={cs(className)} ref={ref} {...props}>
    {children}
  </FormPrimitive.Submit>
));

export const FieldValidation = FormPrimitive.ValidityState;
