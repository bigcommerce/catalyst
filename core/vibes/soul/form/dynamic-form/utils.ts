import { Field, FieldGroup } from './schema';

function removeOptionsFromField<F extends Field>(field: F) {
  // Only remove the options property if it exists on the field
  if ('options' in field) {
    const { options, ...fieldWithoutOptions } = field;

    return fieldWithoutOptions;
  }

  return field;
}

export function removeOptionsFromFields<F extends Field>(fields: Array<F | FieldGroup<F>>) {
  return fields.map((field) => {
    if (Array.isArray(field)) {
      return field.map(removeOptionsFromField);
    }

    return removeOptionsFromField(field);
  });
}
