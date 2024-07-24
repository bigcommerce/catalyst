import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { FragmentOf } from '~/client/graphql';
import { Label } from '~/components/ui/label';
import { PickList } from '~/components/ui/pick-list';
import { RadioGroup } from '~/components/ui/radio-group';
import { RectangleList, RectangleListItem } from '~/components/ui/rectangle-list';
import { Select } from '~/components/ui/select';
import { Swatch, SwatchItem } from '~/components/ui/swatch';

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
          <Label className="mb-2 inline-block" id={`label-${option.entityId}`}>
            {option.displayName}
          </Label>
          <Swatch
            aria-labelledby={`label-${option.entityId}`}
            name={field.name}
            onValueChange={(value) => {
              field.onChange(value);

              handleOnValueChange({
                optionId: option.entityId,
                valueId: Number(value),
              });
            }}
            value={field.value?.toString()}
          >
            {values.map((value) => {
              if ('__typename' in value && value.__typename === 'SwatchOptionValue') {
                return (
                  <SwatchItem
                    key={value.entityId}
                    onMouseEnter={() => {
                      handleMouseEnter({
                        optionId: option.entityId,
                        valueId: Number(value.entityId),
                      });
                    }}
                    title={`${option.displayName} ${value.label}`}
                    value={String(value.entityId)}
                    variantColor={value.hexColors[0]}
                  />
                );
              }

              return null;
            })}
          </Swatch>
          {error && <ErrorMessage>{error.message}</ErrorMessage>}
        </div>
      );

    case 'RectangleBoxes':
      return (
        <div key={option.entityId}>
          <Label className="mb-2 inline-block" id={`label-${option.entityId}`}>
            {option.displayName}
          </Label>
          <RectangleList
            aria-labelledby={`label-${option.entityId}`}
            name={field.name}
            onValueChange={(value) => {
              field.onChange(value);

              handleOnValueChange({
                optionId: option.entityId,
                valueId: Number(value),
              });
            }}
            value={field.value?.toString()}
          >
            {values.map((value) => {
              return (
                <RectangleListItem
                  key={value.entityId}
                  onMouseEnter={() => {
                    handleMouseEnter({
                      optionId: option.entityId,
                      valueId: Number(value.entityId),
                    });
                  }}
                  title={`${option.displayName} ${value.label}`}
                  value={String(value.entityId)}
                >
                  {value.label}
                </RectangleListItem>
              );
            })}
          </RectangleList>
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
            items={values.map((value) => ({
              label: value.label,
              value: value.entityId.toString(),
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
            variant={error ? 'error' : undefined}
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
            variant={error && 'error'}
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
            items={values
              .filter(
                (value) =>
                  '__typename' in value && value.__typename === 'ProductPickListOptionValue',
              )
              .map((value) => ({
                value: value.entityId.toString(),
                label: value.label,
                defaultImage: value.defaultImage,
                prefetchHandler: () => {
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
