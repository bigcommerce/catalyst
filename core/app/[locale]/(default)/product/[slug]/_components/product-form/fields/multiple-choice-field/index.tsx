import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { useSearchParams } from 'next/navigation';

import { FragmentOf } from '~/client/graphql';
import { Label, PickList, RadioGroup, RectangleList, Select, Swatch } from '~/components/ui/form';
import { usePathname, useRouter } from '~/i18n/routing';

import { useProductFieldController } from '../../use-product-form';
import { ErrorMessage } from '../shared/error-message';

import { MultipleChoiceFieldFragment } from './fragment';

interface Props {
  option: FragmentOf<typeof MultipleChoiceFieldFragment>;
}

interface InteractionOptions {
  optionId: number;
  valueId: number;
  prefetch?: boolean;
}

export const MultipleChoiceField = ({ option }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchParamSelected = searchParams.get(String(option.entityId));
  const values = removeEdgesAndNodes(option.values);

  const handleInteraction = ({ optionId, valueId, prefetch = false }: InteractionOptions) => {
    const optionSearchParams = new URLSearchParams(searchParams.toString());

    optionSearchParams.set(String(optionId), String(valueId));

    const newUrl = `${pathname}?${optionSearchParams.toString()}`;

    if (prefetch) {
      router.prefetch(newUrl);
    } else {
      router.replace(newUrl, { scroll: false });
    }
  };

  const handleOnValueChange = ({ optionId, valueId }: InteractionOptions) => {
    handleInteraction({ optionId, valueId });
  };

  const handleMouseEnter = ({ optionId, valueId }: InteractionOptions) => {
    handleInteraction({ optionId, valueId, prefetch: true });
  };

  const selectedValue = values.find((value) => value.isSelected)?.entityId.toString();
  const defaultValue = values.find((value) => value.isDefault)?.entityId.toString();

  const { field, fieldState } = useProductFieldController({
    name: `attribute_${option.entityId}`,
    rules: {
      required: option.isRequired ? 'Please select an option.' : false,
    },
    defaultValue: searchParamSelected || selectedValue || defaultValue || '',
  });
  const { error } = fieldState;

  switch (option.displayStyle) {
    case 'Swatch':
      return (
        <div key={option.entityId}>
          <Label className="mb-2 inline-block font-semibold" id={`label-${option.entityId}`}>
            {option.displayName}
          </Label>
          <Swatch
            aria-labelledby={`label-${option.entityId}`}
            error={Boolean(error)}
            name={field.name}
            onValueChange={(value) => {
              field.onChange(value);

              handleOnValueChange({
                optionId: option.entityId,
                valueId: Number(value),
              });
            }}
            swatches={values
              .filter((value) => '__typename' in value && value.__typename === 'SwatchOptionValue')
              .map((value) => ({
                label: value.label,
                value: value.entityId.toString(),
                color: value.hexColors[0],
                onMouseEnter: () => {
                  handleMouseEnter({
                    optionId: option.entityId,
                    valueId: Number(value.entityId),
                  });
                },
              }))}
            value={field.value?.toString()}
          />
          {error && <ErrorMessage>{error.message}</ErrorMessage>}
        </div>
      );

    case 'RectangleBoxes':
      return (
        <div key={option.entityId}>
          <Label className="mb-2 inline-block font-semibold" id={`label-${option.entityId}`}>
            {option.displayName}
          </Label>
          <RectangleList
            aria-labelledby={`label-${option.entityId}`}
            error={Boolean(error)}
            items={values.map((value) => ({
              label: value.label,
              value: value.entityId.toString(),
              onMouseEnter: () => {
                handleMouseEnter({ optionId: option.entityId, valueId: Number(value.entityId) });
              },
            }))}
            name={field.name}
            onValueChange={(value) => {
              field.onChange(value);

              handleOnValueChange({
                optionId: option.entityId,
                valueId: Number(value),
              });
            }}
            value={field.value?.toString()}
          />
          {error && <ErrorMessage>{error.message}</ErrorMessage>}
        </div>
      );

    case 'RadioButtons':
      return (
        <div key={option.entityId}>
          <Label className="mb-2 inline-block font-semibold" id={`label-${option.entityId}`}>
            {option.displayName}
          </Label>
          <RadioGroup
            aria-labelledby={`label-${option.entityId}`}
            error={Boolean(error)}
            items={values.map((value) => ({
              label: value.label,
              value: value.entityId.toString(),
              onMouseEnter: () => {
                handleMouseEnter({
                  optionId: option.entityId,
                  valueId: Number(value.entityId),
                });
              },
            }))}
            name={field.name}
            onValueChange={(value) => {
              field.onChange(value);

              handleOnValueChange({
                optionId: option.entityId,
                valueId: Number(value),
              });
            }}
            value={field.value?.toString()}
          />
          {error && <ErrorMessage>{error.message}</ErrorMessage>}
        </div>
      );

    case 'DropdownList':
      return (
        <div key={option.entityId}>
          <Label className="mb-2 inline-block font-semibold" htmlFor={`label-${option.entityId}`}>
            {option.displayName}
          </Label>
          <Select
            error={Boolean(error)}
            id={`label-${option.entityId}`}
            name={field.name}
            onValueChange={(value) => {
              field.onChange(value);

              handleOnValueChange({
                optionId: option.entityId,
                valueId: Number(value),
              });
            }}
            options={values.map((value) => ({
              label: value.label,
              value: value.entityId.toString(),
              onMouseEnter: () => {
                handleMouseEnter({
                  optionId: option.entityId,
                  valueId: Number(value.entityId),
                });
              },
            }))}
            value={field.value?.toString()}
          />
          {error && <ErrorMessage>{error.message}</ErrorMessage>}
        </div>
      );

    case 'ProductPickList':
    case 'ProductPickListWithImages':
      return (
        <div key={option.entityId}>
          <Label className="mb-2 inline-block font-semibold" id={`label-${option.entityId}`}>
            {option.displayName}
          </Label>
          <PickList
            aria-labelledby={`label-${option.entityId}`}
            error={Boolean(error)}
            items={values
              .filter(
                (value) =>
                  '__typename' in value && value.__typename === 'ProductPickListOptionValue',
              )
              .map((value) => ({
                value: value.entityId.toString(),
                label: value.label,
                image: value.defaultImage
                  ? {
                      url: value.defaultImage.url,
                      altText: value.defaultImage.altText,
                    }
                  : undefined,
                onMouseEnter: () => {
                  handleMouseEnter({
                    optionId: option.entityId,
                    valueId: Number(value.entityId),
                  });
                },
              }))}
            name={field.name}
            onValueChange={(value) => {
              field.onChange(value);

              handleOnValueChange({
                optionId: option.entityId,
                valueId: Number(value),
              });
            }}
            value={field.value?.toString()}
          />
          {error && <ErrorMessage>{error.message}</ErrorMessage>}
        </div>
      );

    default:
      return null;
  }
};
