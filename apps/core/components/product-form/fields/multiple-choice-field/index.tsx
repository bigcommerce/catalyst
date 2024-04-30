import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { FragmentOf } from '~/client/graphql';
import { BcImage } from '~/components/bc-image';
import { Label } from '~/components/ui/label';
import { PickList, PickListItem } from '~/components/ui/pick-list';
import { RadioGroup, RadioItem } from '~/components/ui/radio-group';
import { RectangleList, RectangleListItem } from '~/components/ui/rectangle-list';
import { Select, SelectContent, SelectItem } from '~/components/ui/select';
import { Swatch, SwatchItem } from '~/components/ui/swatch';

import { useProductFieldController } from '../../use-product-form';
import { ErrorMessage } from '../shared/error-message';

import { MultipleChoiceFieldFragment } from './fragment';

interface Props {
  option: FragmentOf<typeof MultipleChoiceFieldFragment>;
}

export const MultipleChoiceField = ({ option }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchParamSelected = searchParams.get(String(option.entityId));
  const values = removeEdgesAndNodes(option.values);

  const handleOnValueChange = ({ optionId, valueId }: { optionId: number; valueId: number }) => {
    const optionSearchParams = new URLSearchParams(searchParams.toString());

    optionSearchParams.set(String(optionId), String(valueId));

    router.replace(`${pathname}?${optionSearchParams.toString()}`, { scroll: false });
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
            {values.map((value) => (
              <div className="mb-2 flex" key={value.entityId}>
                <RadioItem
                  id={`${value.entityId}`}
                  value={`${value.entityId}`}
                  variant={error ? 'error' : undefined}
                />
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
              {values.map((value) => (
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
            {values.map((value) => {
              if ('__typename' in value && value.__typename === 'ProductPickListOptionValue') {
                return (
                  <div className="flex items-center p-4" key={value.entityId}>
                    {Boolean(value.defaultImage) && (
                      <BcImage
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
