import { Label } from '@bigcommerce/components/Label';
import { PickList, PickListItem } from '@bigcommerce/components/PickList';
import { RadioGroup, RadioItem } from '@bigcommerce/components/RadioGroup';
import { RectangleList, RectangleListItem } from '@bigcommerce/components/RectangleList';
import { Select, SelectContent, SelectItem } from '@bigcommerce/components/Select';
import { Swatch, SwatchItem } from '@bigcommerce/components/Swatch';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { getProduct } from '~/client/queries/get-product';
import { ExistingResultType, Unpacked } from '~/client/util';

import { useProductFieldController } from '../use-product-form';

import { ErrorMessage } from './shared/error-message';

type MultipleChoiceOption = Extract<
  Unpacked<ExistingResultType<typeof getProduct>['productOptions']>,
  { __typename: 'MultipleChoiceOption' }
>;

export const MultipleChoiceField = ({ option }: { option: MultipleChoiceOption }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchParamSelected = searchParams.get(String(option.entityId));

  const handleOnValueChange = ({ optionId, valueId }: { optionId: number; valueId: number }) => {
    const optionSearchParams = new URLSearchParams(searchParams.toString());

    optionSearchParams.set(String(optionId), String(valueId));

    router.replace(`${pathname}?${optionSearchParams.toString()}`, { scroll: false });
  };

  const selectedValue = option.values.find((value) => value.isSelected)?.entityId.toString();
  const defaultValue = option.values.find((value) => value.isDefault)?.entityId.toString();

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
            {option.values.map((value) => {
              if ('__typename' in value && value.__typename === 'SwatchOptionValue') {
                return (
                  <SwatchItem
                    key={value.entityId}
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
            {option.values.map((value) => {
              return (
                <RectangleListItem
                  key={value.entityId}
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
            {option.values.map((value) => (
              <div className="mb-2 flex" key={value.entityId}>
                <RadioItem id={`${value.entityId}`} value={`${value.entityId}`} />
                <Label className="cursor-pointer ps-4 font-normal" htmlFor={`${value.entityId}`}>
                  {value.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {error && <ErrorMessage>{error.message}</ErrorMessage>}
        </div>
      );

    case 'DropdownList':
      return (
        <div key={option.entityId}>
          <Label className="mb-2 inline-block font-semibold" id={`label-${option.entityId}`}>
            {option.displayName}
          </Label>
          <Select
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
            variant={error && 'error'}
          >
            <SelectContent>
              {option.values.map((value) => (
                <SelectItem key={value.entityId} value={`${value.entityId}`}>
                  {value.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            {option.values.map((value) => {
              if ('__typename' in value && value.__typename === 'ProductPickListOptionValue') {
                return (
                  <div className="flex items-center p-4" key={value.entityId}>
                    {Boolean(value.defaultImage) && (
                      <Image
                        alt={value.defaultImage?.altText || ''}
                        className="me-6"
                        height={48}
                        src={value.defaultImage?.url || ''}
                        width={48}
                      />
                    )}
                    <PickListItem id={`${value.entityId}`} value={`${value.entityId}`} />
                    <Label
                      className="cursor-pointer ps-4 font-normal"
                      htmlFor={`${value.entityId}`}
                    >
                      {value.label}
                    </Label>
                  </div>
                );
              }

              return null;
            })}
          </PickList>
          {error && <ErrorMessage>{error.message}</ErrorMessage>}
        </div>
      );

    default:
      return null;
  }
};
