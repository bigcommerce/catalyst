import { Field, FieldGroup } from './schema';

function removeOptionsFromField<T extends Field>(field: T) {
  // Only remove the options property if it exists on the field
  if ('options' in field) {
    // Type assertion is used because not all Field types have 'options'
    // and to satisfy TypeScript that we are only spreading valid props
    const { options, ...fieldWithoutOptions } = field;

    return fieldWithoutOptions;
  }

  return field;
}

export function removeOptionsFromFields<F extends Field>(fields: Array<F | FieldGroup<F>>) {
  return fields.map((field) => {
    if (Array.isArray(field)) {
      // Handle field groups (arrays of fields)
      return field.map(removeOptionsFromField);
    }

    // Handle individual fields
    return removeOptionsFromField(field);
  });
}
