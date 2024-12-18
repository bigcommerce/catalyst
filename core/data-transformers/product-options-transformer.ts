import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { ResultOf } from 'gql.tada';

import { Field } from '@/vibes/soul/sections/product-detail/schema';
import { ProductFormFragment } from '~/app/[locale]/(default)/product/[slug]/page-data';

export const productOptionsTransformer = (
  productOptions: ResultOf<typeof ProductFormFragment>['productOptions'],
) =>
  removeEdgesAndNodes(productOptions)
    .map<Field | null>((option) => {
      if (option.__typename === 'MultipleChoiceOption') {
        const values = removeEdgesAndNodes(option.values);

        switch (option.displayStyle) {
          case 'Swatch': {
            return {
              persist: option.isVariantOption,
              type: 'swatch-radio-group',
              label: option.displayName,
              required: option.isRequired,
              name: option.entityId.toString(),
              defaultValue: values.find((value) => value.isDefault)?.entityId.toString(),
              options: values
                .filter(
                  (value) => '__typename' in value && value.__typename === 'SwatchOptionValue',
                )
                .map((value) => {
                  if (value.imageUrl) {
                    return {
                      type: 'image',
                      label: value.label,
                      value: value.entityId.toString(),
                      image: { src: value.imageUrl, alt: value.label },
                    };
                  }

                  return {
                    type: 'color',
                    label: value.label,
                    value: value.entityId.toString(),
                    color: value.hexColors[0] ?? '',
                  };
                }),
            };
          }

          case 'RectangleBoxes': {
            return {
              persist: option.isVariantOption,
              type: 'button-radio-group',
              label: option.displayName,
              required: option.isRequired,
              name: option.entityId.toString(),
              defaultValue: values.find((value) => value.isDefault)?.entityId.toString(),
              options: values.map((value) => ({
                label: value.label,
                value: value.entityId.toString(),
              })),
            };
          }

          case 'RadioButtons': {
            return {
              persist: option.isVariantOption,
              type: 'radio-group',
              label: option.displayName,
              required: option.isRequired,
              name: option.entityId.toString(),
              defaultValue: values.find((value) => value.isDefault)?.entityId.toString(),
              options: values.map((value) => ({
                label: value.label,
                value: value.entityId.toString(),
              })),
            };
          }

          case 'DropdownList': {
            return {
              persist: option.isVariantOption,
              type: 'select',
              label: option.displayName,
              required: option.isRequired,
              name: option.entityId.toString(),
              defaultValue: values.find((value) => value.isDefault)?.entityId.toString(),
              options: values.map((value) => ({
                label: value.label,
                value: value.entityId.toString(),
              })),
            };
          }

          case 'ProductPickList':
          case 'ProductPickListWithImages': {
            return {
              persist: option.isVariantOption,
              type: 'card-radio-group',
              label: option.displayName,
              required: option.isRequired,
              name: option.entityId.toString(),
              defaultValue: values.find((value) => value.isDefault)?.entityId.toString(),
              options: values
                .filter(
                  (value) =>
                    '__typename' in value && value.__typename === 'ProductPickListOptionValue',
                )
                .map((value) => ({
                  label: value.label,
                  value: value.entityId.toString(),
                  image: {
                    src: value.defaultImage?.url ?? '',
                    alt: value.defaultImage?.altText ?? '',
                  },
                })),
            };
          }

          default:
            return null;
        }
      }

      if (option.__typename === 'CheckboxOption') {
        return {
          persist: option.isVariantOption,
          type: 'checkbox',
          label: option.displayName,
          required: option.isRequired,
          name: option.entityId.toString(),
          defaultValue: option.checkedByDefault.toString(),
          uncheckedValue: option.uncheckedOptionValueEntityId.toString(),
          checkedValue: option.checkedOptionValueEntityId.toString(),
        };
      }

      if (option.__typename === 'NumberFieldOption') {
        return {
          persist: option.isVariantOption,
          type: 'number',
          label: option.displayName,
          required: option.isRequired,
          name: option.entityId.toString(),
          defaultValue: option.defaultNumber?.toString(),
          min: option.lowest ?? undefined,
          max: option.highest ?? undefined,
          // TODO: other props?
        };
      }

      if (option.__typename === 'MultiLineTextFieldOption') {
        return {
          persist: option.isVariantOption,
          type: 'textarea',
          label: option.displayName,
          required: option.isRequired,
          name: option.entityId.toString(),
          defaultValue: option.defaultText ?? undefined,
        };
      }

      if (option.__typename === 'TextFieldOption') {
        return {
          persist: option.isVariantOption,
          type: 'text',
          label: option.displayName,
          required: option.isRequired,
          name: option.entityId.toString(),
          defaultValue: option.defaultText ?? undefined,
        };
      }

      if (option.__typename === 'DateFieldOption') {
        return {
          persist: option.isVariantOption,
          type: 'date',
          label: option.displayName,
          required: option.isRequired,
          name: option.entityId.toString(),
          defaultValue: option.defaultDate ?? undefined,
        };
      }

      return null;
    })
    .filter((field) => field !== null);
