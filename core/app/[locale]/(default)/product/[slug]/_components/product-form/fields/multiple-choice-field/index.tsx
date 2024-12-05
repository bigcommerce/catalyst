import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo, useRef } from 'react';

import { FragmentOf } from '~/client/graphql';
import { Label, Swatch } from '~/components/ui/form';
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
  onMpnChange?: (mpn: string | null) => void; // Add new prop for MPN changes
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

  const remainingCount = values.length - displayedValues.length;
  const activeOptionSwatch = values.find((v) => v.entityId.toString() === field.value);

  // Track active variant changes with debounce
  useEffect(() => {
    if (activeOptionSwatch && productMpn) {
      const currentVariant = {
        label: activeOptionSwatch.label,
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
          // Call the new onMpnChange prop with the current MPN
          onMpnChange?.(currentVariant.mpn);
          console.log('Final Active Variant:', {
            label: currentVariant.label,
            mpn: currentVariant.mpn,
          });
        }
      }, 3000);
    }

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [activeOptionSwatch, productMpn, onMpnChange]);

  if (option.displayStyle !== 'Swatch') {
    return null;
  }

  return (
    <div key={option.entityId} className="div-product-swatch text-center lg:text-left xl:text-left">
      <Label
        className="mb-2 inline-block text-center text-base font-normal leading-8 tracking-wide lg:text-left xl:text-left"
        htmlFor={`label-${option.entityId}`}
      >
        {option.displayName} :
      </Label>
      <span className="selection ml-[5px] text-[#008BB7]">
        {activeOptionSwatch ? (
          <>
            {activeOptionSwatch.label}
            {productMpn && <span className="ml-2">MPN: {productMpn}</span>}
          </>
        ) : (
          'Selection'
        )}
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
            .filter((value) => '__typename' in value && value.__typename === 'SwatchOptionValue')
            .map((value) => ({
              label: `${value.label} ${productMpn ? `(MPN: ${productMpn})` : ''}`,
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
      </div>
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
    </div>
  );
};
