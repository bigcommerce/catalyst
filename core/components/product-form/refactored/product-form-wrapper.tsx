import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

import { FragmentOf } from '~/client/graphql';

import { ProductFormFragment } from '../fragment';

import { ProductForm } from './product-form';
import { Field } from './types';

interface ProductFormRefactoredProps {
  data: FragmentOf<typeof ProductFormFragment>;
}

async function action(formData: FormData) {
  'use server';

  await new Promise((resolve) => setTimeout(resolve, 1));

  console.log(formData);
}

export const ProductFormWrapper = ({ data: product }: ProductFormRefactoredProps) => {
  const productOptions = removeEdgesAndNodes(product.productOptions);

  console.dir(productOptions, { depth: null });

  const fields: Field[] = productOptions
    .map((option) => {
      switch (option.__typename) {
        case 'MultipleChoiceOption': {
          switch (option.displayStyle) {
            case 'RadioButtons':
            case 'RectangleBoxes': {
              const options = option.values.edges
                ? option.values.edges.map(({ node }) => ({
                    label: node.label,
                    value: node.entityId.toString(),
                  }))
                : [];

              const defaultValue = option.values.edges
                ?.find(({ node }) => node.isDefault)
                ?.node.entityId.toString();

              return {
                type: 'radio' as const,
                name: option.entityId.toString(),
                label: option.displayName,
                required: option.isRequired,
                defaultValue,
                options,
              };
            }

            case 'Swatch': {
              const options = option.values.edges
                ? option.values.edges.map(({ node }) => ({
                    label: node.label,
                    value: node.entityId.toString(),
                    hex: node.__typename === 'SwatchOptionValue' ? node.hexColors[0] : '',
                  }))
                : [];

              const defaultValue = option.values.edges
                ?.find(({ node }) => node.isDefault)
                ?.node.entityId.toString();

              return {
                type: 'swatch' as const,
                name: option.entityId.toString(),
                label: option.displayName,
                required: option.isRequired,
                defaultValue,
                options,
              };
            }

            case 'DropdownList': {
              const options = option.values.edges
                ? option.values.edges.map(({ node }) => ({
                    label: node.label,
                    value: node.entityId.toString(),
                  }))
                : [];

              const defaultValue = option.values.edges
                ?.find(({ node }) => node.isDefault)
                ?.node.entityId.toString();

              return {
                type: 'select' as const,
                name: option.entityId.toString(),
                label: option.displayName,
                required: option.isRequired,
                defaultValue,
                options,
              };
            }

            // @todo case ProductPickListWithImages

            default: {
              return null;
            }
          }
        }

        // @todo case 'DateFieldOption':
        // @todo case 'MultiLineTextFieldOption':
        // @todo case 'FileUploadFieldOption':

        case 'TextFieldOption': {
          return {
            type: 'text' as const,
            name: option.entityId.toString(),
            label: option.displayName,
            required: option.isRequired,
            ...(option.defaultText && { defaultValue: option.defaultText }),
          };
        }

        case 'NumberFieldOption': {
          return {
            type: 'number' as const,
            name: option.entityId.toString(),
            label: option.displayName,
            required: option.isRequired,
            // @todo isIntegerOnly
            ...(option.lowest && { min: option.lowest }),
            ...(option.highest && { max: option.highest }),
          };
        }

        case 'CheckboxOption': {
          return {
            type: 'checkbox' as const,
            name: option.entityId.toString(),
            label: option.displayName,
            required: option.isRequired,
            defaultValue: option.checkedByDefault,
          };
        }

        default: {
          return null;
        }
      }
    })
    .filter((f) => f !== null);

  return <ProductForm action={action} fields={fields} />;
};
