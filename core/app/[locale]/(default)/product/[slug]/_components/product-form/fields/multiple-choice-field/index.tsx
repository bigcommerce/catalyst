import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo, useRef } from 'react';

import { FragmentOf } from '~/client/graphql';
import { Label, Swatch, RectangleList, RadioGroup, Select, PickList } from '~/components/ui/form';
import { usePathname, useRouter } from '~/i18n/routing';

import { useProductFieldController } from '../../use-product-form';
import { ErrorMessage } from '../shared/error-message';

import { MultipleChoiceFieldFragment } from './fragment';

interface InteractionOptions {
  optionId: number;
  valueId: number;
  prefetch?: boolean;
}

interface Props {
  option: FragmentOf<typeof MultipleChoiceFieldFragment>;
  multipleOptionIcon: string;
  productMpn: string | null;
  onVariantChange?: (mpn: string | null) => void;
  onMpnChange?: (mpn: string | null) => void;
}

export const MultipleChoiceField = ({
  option,
  multipleOptionIcon,
  productMpn,
  onVariantChange,
  onMpnChange,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastActiveVariant = useRef<{ label: string; mpn: string | null }>({ label: '', mpn: null });
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  const searchParamSelected = searchParams.get(String(option.entityId));
  const values = useMemo(() => removeEdgesAndNodes(option.values), [option.values]);

  const [showAll, setShowAll] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleInteraction = async ({ optionId, valueId, prefetch = false }: InteractionOptions) => {
    const optionSearchParams = new URLSearchParams(searchParams.toString());
    optionSearchParams.set(String(optionId), String(valueId));
    const newUrl = `${pathname}?${optionSearchParams.toString()}`;

    if (prefetch) {
      router.prefetch(newUrl);
    } else {
      await router.replace(newUrl, { scroll: false });
      onVariantChange?.(productMpn);
    }
  };

  const handleOnValueChange = ({ optionId, valueId }: InteractionOptions) => {
    const selectedValue = values.find((value) => value.entityId === valueId);
    handleInteraction({ optionId, valueId });
    setSelectedOption(selectedValue?.label || null);
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
  const displayedValues = useMemo(() => (showAll ? values : values.slice(0, 6)), [showAll, values]);

  useEffect(() => {
    if (field.value && productMpn) {
      const activeOptionValue = values.find((v) => v.entityId.toString() === field.value);
      if (activeOptionValue) {
        const currentVariant = {
          label: activeOptionValue.label,
          mpn: productMpn,
        };

        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }

        updateTimeoutRef.current = setTimeout(() => {
          if (
            lastActiveVariant.current.label !== currentVariant.label ||
            lastActiveVariant.current.mpn !== currentVariant.mpn
          ) {
            lastActiveVariant.current = currentVariant;
            onMpnChange?.(currentVariant.mpn);
          }
        }, 3000);
      }
    }

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [field.value, values, productMpn, onMpnChange]);

  const renderShowAllButton = (remainingCount: number) => (
    <div className="mt-4 flex flex-col items-center lg:mt-2 xl:mt-0">
      {remainingCount > 0 && !showAll && (
        <>
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="show-all view-more-button w-full rounded-[50px] !p-[0.4rem] !py-[0px] text-center text-[14px] font-medium leading-[24px] tracking-[0.25px] text-[#008BB7] !shadow-none"
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
          className="show-all view-more-button view-all w-full rounded-[50px] !p-[0.4rem] !py-[0px] text-center text-[14px] font-medium leading-[24px] tracking-[0.25px] text-[#008BB7] !shadow-none xl:mt-3"
        >
          View Less
        </button>
      )}
    </div>
  );

  switch (option.displayStyle) {
    case 'Swatch': {
      const remainingCount = values.length - displayedValues.length;
      const activeOptionSwatch = values.find((v) => v.entityId.toString() === field.value);

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
          <span className="selection ml-[5px] text-[#008BB7]">
            {activeOptionSwatch ? activeOptionSwatch.label : 'Selection'}
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
                  color: value.hexColors[0] ?? value.imageUrl,
                  onMouseEnter: () => {
                    handleMouseEnter({
                      optionId: option.entityId,
                      valueId: Number(value.entityId),
                    });
                  },
                }))}
              value={field.value?.toString()}
            />
            {renderShowAllButton(remainingCount)}
          </div>
          {error && <ErrorMessage>{error.message}</ErrorMessage>}
        </div>
      );
    }

    case 'RectangleBoxes': {
      const activeOptionRectangleBoxes = values.find((v) => v.entityId.toString() === field.value);
      const remainingCount = values.length - displayedValues.length;

      return (
        <div key={option.entityId} className="div-product-rectangleboxes mt-3 xl:mt-0">
          <div className="mb-3 block !gap-0 text-center lg:flex lg:items-center xl:flex xl:items-center">
            <img
              className="variant-img inline-block !h-[20px] !w-[20px] rounded-[50px]"
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
            <span className="selection ml-[5px] text-[#008BB7]">
              {activeOptionRectangleBoxes ? activeOptionRectangleBoxes.label : 'Selection'}
            </span>
          </div>

          <div className="block xl:flex">
            <RectangleList
              aria-labelledby={`label-${option.entityId}`}
              error={Boolean(error)}
              items={displayedValues.map((value) => ({
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
            {renderShowAllButton(remainingCount)}
          </div>
          {error && <ErrorMessage>{error.message}</ErrorMessage>}
        </div>
      );
    }

    case 'RadioButtons': {
      const activeOptionRadio = values.find((v) => v.entityId.toString() === field.value);

      return (
        <div
          key={option.entityId}
          className="div-product-radiobuttons border-2 border-[#4EAECC] px-7 py-5 text-center xl:text-left"
        >
          <Label
            className="mb-2 inline-block text-left text-base font-normal leading-8 tracking-wide"
            htmlFor={`label-${option.entityId}`}
          >
            {option.displayName} :
          </Label>
          <span className="selection ml-[5px] text-[#008BB7]">
            {activeOptionRadio ? activeOptionRadio.label : 'Selection'}
          </span>
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
    }

    case 'DropdownList': {
      const activeOptionDropdownList = values.find((v) => v.entityId.toString() === field.value);

      return (
        <div
          key={option.entityId}
          className="div-product-dropdownlist text-center lg:text-left xl:text-left"
        >
          <div className="mb-3 block text-center lg:flex lg:items-center xl:flex xl:items-center">
            <img
              className="variant-img inline-block !h-[20px] !w-[20px] rounded-[50px]"
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
    }

    case 'ProductPickList':
    case 'ProductPickListWithImages': {
      const activeOptionPickList = values.find((v) => v.entityId.toString() === field.value);
      const remainingCount = values.length - displayedValues.length;

      return (
        <div key={option.entityId} className="div-product-productpicklist">
          <div className="mb-3 flex items-center">
            <img
              className="variant-img !h-[20px] !w-[20px] rounded-[50px]"
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
            <span className="selection ml-[5px] text-[#008BB7]">
              {activeOptionPickList ? activeOptionPickList.label : 'Selection'}
            </span>
          </div>

          <div className="block xl:flex">
            <PickList
              aria-labelledby={`label-${option.entityId}`}
              error={Boolean(error)}
              items={displayedValues
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
            {renderShowAllButton(remainingCount)}
          </div>
          {error && <ErrorMessage>{error.message}</ErrorMessage>}
        </div>
      );
    }

    default:
      return null;
  }
};

export default MultipleChoiceField;