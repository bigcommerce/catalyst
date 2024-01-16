import * as FormPrimitive from '@radix-ui/react-form';
import { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';

import { cs } from '../../utils/cs';
import { Label } from '../Label';

type ValidationPattern =
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

type ValidationFunction =
  | ((value: string, formData: FormData) => boolean)
  | ((value: string, formData: FormData) => Promise<boolean>);
type ControlValidationPatterns = ValidationPattern & ValidationFunction;
type BuiltInValidityState = {
  [pattern in ValidationPattern]: boolean;
};

const Form = forwardRef<
  ElementRef<typeof FormPrimitive.Root>,
  ComponentPropsWithRef<typeof FormPrimitive.Root>
>(({ className, ...props }, ref) => (
  <FormPrimitive.Root className={cs('text-base', className)} ref={ref} {...props} />
));

Form.displayName = FormPrimitive.Form.displayName;

const Field = forwardRef<
  ElementRef<typeof FormPrimitive.Field>,
  ComponentPropsWithRef<typeof FormPrimitive.Field>
>(({ className, children, ...props }, ref) => (
  <FormPrimitive.Field className={cs(className)} ref={ref} {...props}>
    {children}
  </FormPrimitive.Field>
));

Field.displayName = 'Field';

interface FieldMessageProps
  extends Omit<ComponentPropsWithRef<typeof FormPrimitive.Message>, 'match'> {
  match?: ValidationPattern;
}

const FieldMessage = forwardRef<ElementRef<typeof FormPrimitive.Message>, FieldMessageProps>(
  ({ className, children, ...props }, ref) => (
    <FormPrimitive.Message className={cs(className)} ref={ref} {...props}>
      {children}
    </FormPrimitive.Message>
  ),
);

FieldMessage.displayName = 'FieldMessage';

interface FieldLabelProps extends ComponentPropsWithRef<typeof Label> {
  isRequired?: boolean;
}

const FieldLabel = forwardRef<ElementRef<typeof Label>, FieldLabelProps>(
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

FieldLabel.displayName = 'FieldLabel';

const FieldControl = forwardRef<
  ElementRef<typeof FormPrimitive.Control>,
  ComponentPropsWithRef<typeof FormPrimitive.Control>
>(({ className, children, ...props }, ref) => (
  <FormPrimitive.Control className={cs(className)} ref={ref} {...props}>
    {children}
  </FormPrimitive.Control>
));

FieldControl.displayName = 'FieldControl';

const FormSubmit = forwardRef<
  ElementRef<typeof FormPrimitive.Submit>,
  ComponentPropsWithRef<typeof FormPrimitive.Submit>
>(({ className, children, ...props }, ref) => (
  <FormPrimitive.Submit className={cs(className)} ref={ref} {...props}>
    {children}
  </FormPrimitive.Submit>
));

FormSubmit.displayName = 'FormSubmit';

const FieldValidation = FormPrimitive.ValidityState;

FieldValidation.displayName = 'FieldValidation';

export { Form, Field, FieldMessage, FieldLabel, FieldControl, FormSubmit, FieldValidation };
export type {
  ValidationPattern,
  ValidationFunction,
  ControlValidationPatterns,
  BuiltInValidityState,
};
