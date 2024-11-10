import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { FragmentOf } from '~/client/graphql';
import { Label, PickList, RadioGroup, RectangleList, Select, Swatch } from '~/components/ui/form';
import { usePathname, useRouter } from '~/i18n/routing';

import { useProductFieldController } from '../../use-product-form';
import { ErrorMessage } from '../shared/error-message';

import { MultipleChoiceFieldFragment } from './fragment';

interface Props {
  option: FragmentOf<typeof MultipleChoiceFieldFragment>;
  multipleOptionIcon: string; // Pass the prop here
}

interface InteractionOptions {
  optionId: number;
  valueId: number;
  prefetch?: boolean;
}

export const MultipleChoiceField = ({ option, multipleOptionIcon }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchParamSelected = searchParams.get(String(option.entityId));
  const values = removeEdgesAndNodes(option.values);

  const [showAll, setShowAll] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null); // State to track selected option

  // Function to handle interactions such as selecting an option
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

  // Handle value changes when the user selects a new option
  const handleOnValueChange = ({ optionId, valueId }: InteractionOptions) => {
    handleInteraction({ optionId, valueId });
    const selectedLabel = values.find((value) => value.entityId === valueId)?.label || null; // Get the selected label
    setSelectedOption(selectedLabel); // Update selected option to display the selected option
  };

  // Prefetch on mouse enter for smoother navigation
  const handleMouseEnter = ({ optionId, valueId }: InteractionOptions) => {
    handleInteraction({ optionId, valueId, prefetch: true });
  };

  // Determine selected and default values
  const selectedValue = values.find((value) => value.isSelected)?.entityId.toString();
  const defaultValue = values.find((value) => value.isDefault)?.entityId.toString();

  // Use controller to manage form field behavior
  const { field, fieldState } = useProductFieldController({
    name: `attribute_${option.entityId}`,
    rules: {
      required: option.isRequired ? 'Please select an option.' : false,
    },
    defaultValue: searchParamSelected || selectedValue || defaultValue || '',
  });
  const { error } = fieldState;

  // Render based on the display style of the option
  switch (option.displayStyle) {
    case 'Swatch':
      const displayedValues = showAll ? values : values.slice(0, 6); // Show only first 6 unless 'Show All' is clicked
      const remainingCount = values.length - displayedValues.length;
      const activeOptionswatch = values.find((v) => v.entityId.toString() === field.value);

      return (
        <div
          key={option.entityId}
          className="div-product-swatch text-center lg:text-left xl:text-left"
        >
          <Label
            className="mb-2 inline-block text-center text-base font-normal leading-8 tracking-wide lg:text-left xl:text-left"
            htmlFor={`label-${option.entityId}`}
          >
            {option.displayName} :
          </Label>
          {/* Show selection text initially; only selected option displayed without "Selection:" label */}
          <span className="selection ml-[5px] text-[#008BB7]">
            {/* {selectedOption ? selectedOption : 'Selection'} */}
            {activeOptionswatch ? activeOptionswatch.label : 'Selection'}
          </span>
          <div className="block xl:flex">
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
              swatches={displayedValues
                .filter(
                  (value) => '__typename' in value && value.__typename === 'SwatchOptionValue',
                )
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
            <div className="mt-4 flex flex-col items-center lg:mt-2 xl:mt-0">
              {remainingCount > 0 && !showAll && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowAll(true)}
                    className="show-all !py-[0px] view-more-button !p-[0.4rem] rounded-[50px] !shadow-none w-full text-center text-[14px] font-medium leading-[24px] tracking-[0.25px] text-[#008BB7]"
                  >
                    Show All
                  </button>
                  <span className="text-[14px] leading-[24px] tracking-[0.25px] text-[#008BB7]">
                    ({'+' + remainingCount})
                  </span>
                </>
              )}
              {showAll && (
                <button
                  type="button"
                  onClick={() => setShowAll(false)}
                  className="show-all !py-[0px] view-more-button !p-[0.4rem] rounded-[50px] !shadow-none view-all w-full text-center text-[14px] font-medium leading-[24px] tracking-[0.25px] text-[#008BB7] xl:mt-3"
                >
                  View Less
                </button>
              )}
            </div>
          </div>
          {error && <ErrorMessage>{error.message}</ErrorMessage>}
        </div>
      );

    case 'RectangleBoxes':
      // Find the currently selected option from the `values` array based on `field.value`
      const activeOptionRectangleBoxes = values.find((v) => v.entityId.toString() === field.value);

      return (
        <div key={option.entityId} className="div-product-rectangleboxes mt-3 xl:mt-0">
          <div className="mb-3 block text-center lg:flex lg:items-center xl:flex xl:items-center !gap-0">
            <img
              className="variant-img !w-[20px] !h-[20px] rounded-[50px] inline-block"
              alt="headline icon"
              src={multipleOptionIcon}
              loading="lazy"
            />
            <Label
              className="ml-2 inline-block text-left text-base font-normal leading-8 tracking-wide"
              htmlFor={`label-${option.entityId}`}
            >
              {option.displayName} :
            </Label>
            {/* Show selected option label if available, otherwise show "Selection" */}
            <span className="selection ml-[5px] text-[#008BB7]">
              {activeOptionRectangleBoxes ? activeOptionRectangleBoxes.label : 'Selection'}
            </span>
          </div>

          <RectangleList
            aria-labelledby={`label-${option.entityId}`}
            error={Boolean(error)}
            items={values.map((value) => ({
              label: value.label,
              value: value.entityId.toString(),
              onMouseEnter: () => {
                handleMouseEnter({ optionId: option.entityId, valueId: Number(value.entityId) });
              },
              onClick: () => {
                field.onChange(value.entityId); // Update the selected option in the field value
                handleOnValueChange({ optionId: option.entityId, valueId: Number(value.entityId) });
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
        <div
          key={option.entityId}
          className="div-product-radiobuttons border-2 border-[#4EAECC] px-7 py-5 text-center xl:text-left"
        >
          <Label
            className="mb-2 inline-block text-left text-base font-normal leading-8 tracking-wide"
            htmlFor={`label-${option.entityId}`}
          >
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
      // Find the currently selected option from the `values` array based on `field.value`
      const activeOptionDropdownList = values.find((v) => v.entityId.toString() === field.value);
      return (
        <div
          key={option.entityId}
          className="div-product-dropdownlist text-center lg:text-left xl:text-left"
        >
          <div className="mb-3 block text-center lg:flex lg:items-center xl:flex xl:items-center">
            <img
              className="variant-img !w-[20px] !h-[20px] rounded-[50px] inline-block"
              alt="headline icon"
              src={multipleOptionIcon}
              loading="lazy"
            />
            <Label
              className="ml-2 inline-block text-left text-base font-normal leading-8 tracking-wide"
              htmlFor={`label-${option.entityId}`}
            >
              {option.displayName} :
            </Label>
            {/* Show selection text initially; only selected option displayed without "Selection:" label */}
            <span className="selection ml-[5px] text-[#008BB7]">
              {activeOptionDropdownList ? activeOptionDropdownList.label : 'Selection'}
            </span>
          </div>

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
        <div key={Option.entityId} className="div-product-productpicklist">
          <div className="mb-3 flex items-center">
            <img
              className="variant-img !w-[20px] !h-[20px] rounded-[50px]" // This ensures the width is set, and height auto-scales to maintain aspect ratio
              alt="headline icon"
              src={multipleOptionIcon}
              loading="lazy"
            />
            <Label
              className="ml-2 inline-block text-left text-base font-normal leading-8 tracking-wide" // Added some margin for spacing
              htmlFor={`label-${option.entityId}`}
            >
              {option.displayName}
            </Label>
          </div>

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