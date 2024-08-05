'use client';

import { useEffect, useState } from 'react';

import { CheckboxInput } from './inputs/checkbox-input';
import { NumberInput } from './inputs/number-input';
import { RadioGroup } from './inputs/radio-group';
import { SelectInput } from './inputs/select-input';
import { SwatchGroup } from './inputs/swatch-group';
import { TextInput } from './inputs/text-input';
import { Field } from './types';
import { useFormState } from './use-product-form';

interface Props {
  fields: Field[];
  action: (formData: FormData) => void;
}

// @todo Props must be serializable for components in the "use client" entry file, "action" is invalid.
export function ProductForm({ fields, action }: Props) {
  const { inputs, handleSubmit } = useFormState({ fields });
  const [jsEnabled, setJsEnabled] = useState(false);

  useEffect(() => setJsEnabled(true), []);

  return (
    <form
      action={action}
      className="space-y-8"
      noValidate={jsEnabled}
      onSubmit={handleSubmit(action)}
    >
      {inputs.map((field, index) => {
        switch (field.type) {
          case 'radio':
            return <RadioGroup key={index} {...field.props} />;

          case 'swatch':
            return <SwatchGroup key={index} {...field.props} />;

          case 'number':
            return <NumberInput key={index} {...field.props} />;

          case 'text':
            return <TextInput key={index} {...field.props} />;

          case 'checkbox':
            return <CheckboxInput key={index} {...field.props} />;

          case 'select':
            return <SelectInput key={index} {...field.props} />;

          default:
            return null;
        }
      })}
      <button type="submit">Submit</button>
    </form>
  );
}
