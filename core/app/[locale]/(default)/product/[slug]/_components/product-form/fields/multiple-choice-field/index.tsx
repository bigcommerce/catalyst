import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo, useRef } from 'react';

import { FragmentOf } from '~/client/graphql';
import { Label, Swatch, RectangleList, RadioGroup, Select, PickList } from '~/components/ui/form';
import { usePathname, useRouter } from '~/i18n/routing';

import { useProductFieldController } from '../../use-product-form';
import { ErrorMessage } from '../shared/error-message';

import { MultipleChoiceFieldFragment } from './fragment';
import { BcImage } from '~/components/bc-image';
import exclamatryIcon from '~/public/pdp-icons/exclamatryIcon.svg';
import * as Tooltip from '@radix-ui/react-tooltip';

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
      // Immediately trigger variant change after URL update
      onVariantChange?.(productMpn);
    }
  };

  const handleOnValueChange = (
    { optionId, valueId }: InteractionOptions,
    event: React.MouseEvent,
  ) => {
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

  // Update MPN immediately when field value changes
  useEffect(() => {
    if (field.value && productMpn) {
      const activeOptionValue = values.find((v) => v.entityId.toString() === field.value);
      if (activeOptionValue) {
        const currentVariant = {
          label: activeOptionValue.label,
          mpn: productMpn,
        };

        if (
          lastActiveVariant.current.label !== currentVariant.label ||
          lastActiveVariant.current.mpn !== currentVariant.mpn
        ) {
          lastActiveVariant.current = currentVariant;
          onMpnChange?.(currentVariant.mpn);
        }
      }
    }
  }, [field.value, values, productMpn, onMpnChange]);

  const { error } = fieldState;
  const displayedValues = useMemo(() => (showAll ? values : values.slice(0, 6)), [showAll, values]);

  const renderShowAllButton = (remainingCount: number) => (
    <div className="inline-flex items-center">
      {remainingCount > 0 && !showAll && (
        <>
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="show-all view-more-button w-full rounded-[50px] !p-[0.4rem] !py-[0px] text-center text-[14px] font-medium leading-[24px] tracking-[0.25px] text-[#008BB7] underline !shadow-none"
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
      const activeOptionSwatchLabel = activeOptionSwatch?.label.split('|');

      return (
        <div
          key={option.entityId}
          className="div-product-swatch mb-[10px] text-center xl:text-left"
        >
          <Label
            className="mb-2 inline-block text-center text-base font-normal leading-8 tracking-wide text-[#353535] lg:mb-0 xl:mb-0 xl:text-left"
            htmlFor={`label-${option.entityId}`}
          >
            {option.displayName} :
          </Label>
          <span className="selection ml-[5px] text-[#008BB7]">
            {activeOptionSwatchLabel ? activeOptionSwatchLabel[0] : 'Selection'}
          </span>

          <div className="ml-[0.8em] flex flex-wrap items-center justify-center gap-2 xl:ml-[0em] xl:justify-start">
            <div className="flex flex-wrap gap-2">
              {displayedValues
                .filter(
                  (value) => '__typename' in value && value.__typename === 'SwatchOptionValue',
                )
                .map((value) => (
                  <Tooltip.Provider key={value.entityId} >
                    <Tooltip.Root>
                      <Tooltip.Trigger type="button">
                        <Swatch
                          aria-labelledby={`label-${option.entityId}`}
                          error={Boolean(error)}
                          name={field.name}
                          className="rounded-full"
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleOnValueChange({
                              optionId: option.entityId,
                              valueId: Number(value),
                            });
                          }}
                          swatches={[
                            {
                              label: value.label,
                              value: value.entityId.toString(),
                              color: value.hexColors[0] ?? value.imageUrl,
                              onMouseEnter: () => {
                                handleMouseEnter({
                                  optionId: option.entityId,
                                  valueId: Number(value.entityId),
                                });
                              },
                            },
                          ]}
                          value={field.value?.toString()}
                        />
                      </Tooltip.Trigger>
                      <Tooltip.Content
                        side="top"
                        align="center"
                        sideOffset={5}
                        className="rounded-md bg-white shadow-xl relative z-[99] font-[#353535] font-normal text-[12px]"
                      >
                        <div className="flex h-[240px] w-[180px] flex-col gap-0 p-3">
                          <p className="text-sm text-gray-800 p-0 m-0">
                            {value.label.split('|')[0]}
                          </p>
                          <div
                            className="h-full w-full p-0 m-0 rounded-sm"
                            style={{ backgroundColor: value.hexColors[0] }}
                          ></div>
                          {value.label.split('|')[1] ? (
                            <p className="text-sm text-gray-800 p-0 m-0">{`${value.label.split('|')[1]}`}</p>
                          ):<p></p>}
                        </div>
                        <Tooltip.Arrow className="fill-white transform scale-150" />
                      </Tooltip.Content>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                ))}
              {remainingCount > 0 && !showAll && (
                <div className="flex items-center gap-1 text-[#008BB7]">
                  <button
                    type="button"
                    onClick={() => setShowAll(true)}
                    className="grid text-[14px] font-medium"
                  >
                    <span className="underline">Show All</span>

                    <span>({'+' + remainingCount})</span>
                  </button>
                </div>
              )}
              {showAll && (
                <div className="ml-2 flex items-center gap-1 text-[#008BB7]">
                  <button
                    type="button"
                    onClick={() => setShowAll(false)}
                    className="grid text-[14px] font-medium"
                  >
                    <span className="underline">Show </span>{' '}
                    <span className="underline">Fewer</span>
                  </button>
                </div>
              )}
            </div>
            {error && <ErrorMessage>{error.message}</ErrorMessage>}
          </div>
        </div>
      );
    }
    
    case 'RectangleBoxes': {
      const activeOptionRectangleBoxes = values.find((v) => v.entityId.toString() === field.value);
      const remainingCount = values.length - displayedValues.length;

      return (
        <div key={option.entityId} className="div-product-rectangleboxes xl:mt-0">
          <div className="mb-3 block !gap-0 text-center xl:flex xl:items-center">
            {/* <BcImage
              className="variant-img inline-block !h-[20px] !w-[20px] rounded-[50px]"
              alt="headline icon"
              src={exclamatryIcon}
              width={15}
              height={15}
              unoptimized={true}
              loading="lazy"
            /> */}
            <Label
              className="inline-block text-left text-base font-normal leading-8 tracking-wide text-[#353535]"
              htmlFor={`label-${option.entityId}`}
            >
              {option.displayName} :
            </Label>
            <span className="selection ml-[5px] text-[#008BB7]">
              {activeOptionRectangleBoxes ? activeOptionRectangleBoxes.label : 'Selection'}
            </span>
          </div>

          <div className="flex justify-center xl:justify-start">
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
          className="div-product-radiobuttons mt-[5px] border-2 border-[#4EAECC] px-7 py-5 text-center xl:text-left"
        >
          <Label
            className="mb-2 inline-block text-left text-base font-normal leading-8 tracking-wide text-[#353535]"
            htmlFor={`label-${option.entityId}`}
          >
            {option.displayName}
          </Label>
          {/* <span className="selection ml-[5px] text-[#008BB7]">
            {activeOptionRadio ? activeOptionRadio.label : 'Selection'}
          </span> */}
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
        <div key={option.entityId} className="div-product-dropdownlist text-center xl:text-left">
          <div className="mb-3 block text-center xl:flex xl:items-center">
            {/* <BcImage
              className="variant-img inline-block !h-[20px] !w-[20px] rounded-[50px]"
              alt="headline icon"
              src={exclamatryIcon}
              width={15}
              height={15}
              unoptimized={true}
              loading="lazy"
            /> */}
            <Label
              className="inline-block text-left text-base font-normal leading-8 tracking-wide text-[#353535]"
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
              className="ml-2 inline-block text-left text-base font-normal leading-8 tracking-wide text-[#353535]"
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
