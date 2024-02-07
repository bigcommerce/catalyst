import { Button } from '@bigcommerce/components/button';
import {
  BuiltInValidityState,
  Field,
  FieldControl,
  FieldLabel,
  FieldMessage,
  FieldValidation,
  Form,
  FormSubmit,
} from '@bigcommerce/components/form';
import { Input } from '@bigcommerce/components/input';
import { Select, SelectContent, SelectItem } from '@bigcommerce/components/select';
import { TextArea } from '@bigcommerce/components/text-area';
import type { Meta, StoryObj } from '@storybook/react';
import { FormEvent } from 'react';

const meta: Meta<typeof Form> = {
  component: Form,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Form>;

export const Default: Story = {
  render: () => (
    <Form
      className="mx-auto my-4 grid grid-cols-1 gap-y-6 lg:w-[500px] lg:grid-cols-1 lg:gap-x-6 lg:gap-y-2"
      onSubmit={(event: FormEvent<HTMLFormElement>) => event.preventDefault()}
    >
      <Field className="relative space-y-2 pb-6" name="Input Field">
        <FieldLabel>Input Field</FieldLabel>
        <FieldControl asChild className="inline-flex border-2">
          <Input />
        </FieldControl>
      </Field>
      <Field className="relative space-y-2 pb-6" name="Select Field">
        <FieldLabel>Select Field</FieldLabel>
        <FieldControl asChild className="inline-flex border-2">
          <Select>
            <SelectContent>
              <SelectItem value="1">Option 1</SelectItem>
              <SelectItem value="2">Option 2</SelectItem>
              <SelectItem value="3">Option 3</SelectItem>
              <SelectItem disabled value="4">
                Option - disabled
              </SelectItem>
              <SelectItem value="5">Option 5</SelectItem>
            </SelectContent>
          </Select>
        </FieldControl>
        <FieldMessage
          className="absolute inset-x-0 bottom-0 inline-flex w-full text-sm text-red-200"
          match="typeMismatch"
        >
          Show explonation on failed validation
        </FieldMessage>
      </Field>
      <Field className="relative space-y-2 pb-6" name="TextArea Field">
        <FieldLabel>TextArea Field</FieldLabel>
        <FieldControl asChild className="inline-flex border-2">
          <TextArea />
        </FieldControl>
        <FieldMessage
          className="absolute inset-x-0 bottom-0 inline-flex w-full text-sm text-red-200"
          match="typeMismatch"
        >
          Show explonation on failed validation
        </FieldMessage>
      </Field>
      <FormSubmit asChild>
        <Button className="mt-2 w-fit items-center px-8 py-2" variant="primary">
          Submit Form
        </Button>
      </FormSubmit>
    </Form>
  ),
};

export const WithValidation: Story = {
  render: () => (
    <Form
      className="mx-auto my-4 grid grid-cols-1 gap-y-6 lg:w-[500px] lg:grid-cols-1 lg:gap-x-6 lg:gap-y-2"
      onSubmit={(event: FormEvent<HTMLFormElement>) => event.preventDefault()}
    >
      <Field className="relative space-y-2 pb-6" name="email">
        <FieldLabel isRequired>Email Mismatch</FieldLabel>
        <FieldControl asChild className="inline-flex border-2">
          <Input required type="email" />
        </FieldControl>
        <FieldMessage
          className="absolute inset-x-0 bottom-0 inline-flex w-full text-sm text-red-200"
          match="valueMissing"
        >
          Enter your email as a name@domain.com
        </FieldMessage>
        <FieldMessage
          className="absolute inset-x-0 bottom-0 inline-flex w-full text-sm text-red-200"
          match="typeMismatch"
        >
          Enter your email as a name@domain.com
        </FieldMessage>
      </Field>
      <FormSubmit asChild>
        <Button className="mt-2 w-fit items-center px-8 py-2">Submit Form</Button>
      </FormSubmit>
    </Form>
  ),
};

export const ValidityStateWrapper: Story = {
  render: () => (
    <Form
      className="mx-auto my-4 grid grid-cols-1 gap-y-6 lg:w-[500px] lg:grid-cols-1 lg:gap-x-6 lg:gap-y-2"
      onSubmit={(event: FormEvent<HTMLFormElement>) => event.preventDefault()}
    >
      <Field className="relative space-y-2 pb-6" name="email">
        <FieldLabel isRequired>Email Mismatch</FieldLabel>
        <FieldValidation>
          {(validity: BuiltInValidityState | undefined): JSX.Element => {
            const handleControlValidation = () => {
              let validationState: boolean;

              if (validity) {
                validationState = validity.typeMismatch;
              } else {
                validationState = false;
              }

              return validationState;
            };

            return (
              <>
                <FieldControl asChild className="inline-flex border-2">
                  <Input onChange={handleControlValidation} required type="email" />
                </FieldControl>
                <FieldMessage
                  className="absolute inset-x-0 bottom-0 inline-flex w-full text-sm text-red-200"
                  match="valueMissing"
                >
                  Enter your email as a name@domain.com
                </FieldMessage>
                <FieldMessage
                  className="absolute inset-x-0 bottom-0 inline-flex w-full text-sm text-red-200"
                  match="typeMismatch"
                >
                  Enter your email as a name@domain.com
                </FieldMessage>
              </>
            );
          }}
        </FieldValidation>
      </Field>
      <FormSubmit asChild>
        <Button className="mt-2 w-fit items-center px-8 py-2">Submit Form</Button>
      </FormSubmit>
    </Form>
  ),
};
