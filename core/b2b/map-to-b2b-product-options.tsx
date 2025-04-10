import { B2BProductOption } from '~/b2b/types';

import { Field } from '../vibes/soul/sections/product-detail/schema';

interface ProductOption {
  field: Field;
  value?: string | number;
}

export function mapToB2BProductOptions({ field, value }: ProductOption): B2BProductOption {
  const fieldId = Number(field.name);

  const baseOption: B2BProductOption = {
    optionEntityId: fieldId,
    optionValueEntityId: 0, // Will be set based on type
    entityId: fieldId,
    valueEntityId: 0, // Will be set based on type
    text: '',
    number: 0,
    date: { utc: '' },
  };

  switch (field.type) {
    case 'text':
    case 'textarea':
      return {
        ...baseOption,
        text: String(value || ''),
      };

    case 'number':
      return {
        ...baseOption,
        number: Number(value || 0),
      };

    case 'date':
      return {
        ...baseOption,
        date: {
          utc: value ? new Date(value).toISOString() : '',
        },
      };

    case 'button-radio-group':
    case 'swatch-radio-group':
    case 'radio-group':
    case 'card-radio-group':
    case 'select': {
      const selectedOption = field.options.find((opt) => opt.value === String(value));

      return {
        ...baseOption,
        optionValueEntityId: Number(selectedOption?.value ?? 0),
        valueEntityId: Number(selectedOption?.value ?? 0),
        text: selectedOption?.label || '',
      };
    }

    default:
      return baseOption;
  }
}
