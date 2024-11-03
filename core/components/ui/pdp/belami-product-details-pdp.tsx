'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { GetProductMetaFields, GetProductVariantMetaFields } from '~/components/management-apis';
import { getMetaFieldsByProduct } from '~/components/common-functions';
import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

interface MetaField {
  id: number;
  entityId: number;
  key: string;
  value: string;
  namespace: string;
  resource_type: string;
  resource_id: number;
  description: string;
  date_created: string;
  date_modified: string;
  owner_client_id: string;
}

interface MetaFieldData {
  metaField: MetaField | null;
  productMetaField: MetaField | null;
  message: string;
  hasVariantOptions: boolean;
  isVariantData: boolean;
}

interface IncludedItem {
  name: string;
}

interface ProcessedDetail {
  category: string;
  order: number;
  mainOrder: number;
  key: string;
  value: string;
}

interface GroupedDetails {
  category: string;
  order: number;
  details: ProcessedDetail[];
}

interface Variant {
  entityId: number;
  sku: string;
}

const ProductDetailDropdown = ({ product }: { product: any }) => {
  const t = useTranslations('productDetailDropdown');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [installSheet, setInstallSheet] = useState<MetaField | null>(null);
  const [specSheet, setSpecSheet] = useState<MetaFieldData | null>(null);
  const [variantDetails, setVariantDetails] = useState<MetaField[]>([]);
  const [includedItems, setIncludedItems] = useState<{
    productLevel: IncludedItem[];
    variantLevel: IncludedItem[];
  }>({
    productLevel: [],
    variantLevel: [],
  });

  // Helper function to format values
  const formatValue = (value: string): string => {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.join(', ');
      }
      return value;
    } catch {
      return value;
    }
  };

  const processMetaFields = (metaFields: MetaField[]): GroupedDetails[] => {
    const processed = metaFields.map((field) => {
      try {
        const [mainOrder, category, key, subOrder] = (field.description || '').split('|');
        return {
          category: category || 'Other',
          order: parseInt(subOrder || '0', 10),
          mainOrder: parseInt(mainOrder || '0', 10),
          key: field.key,
          value: formatValue(field.value),
        };
      } catch (error) {
        return {
          category: 'Other',
          order: 999,
          mainOrder: 999,
          key: field.key,
          value: formatValue(field.value),
        };
      }
    });

    const groupedByCategory = processed.reduce((acc, item) => {
      const existing = acc.find((group) => group.category === item.category);
      if (existing) {
        existing.details.push(item);
      } else {
        acc.push({
          category: item.category,
          order: item.mainOrder,
          details: [item],
        });
      }
      return acc;
    }, [] as GroupedDetails[]);

    return groupedByCategory
      .sort((a, b) => a.order - b.order)
      .map((group) => ({
        ...group,
        details: group.details.sort((a, b) => a.order - b.order),
      }));
  };

  useEffect(() => {
    const fetchMetaFields = async () => {
      if (!product?.entityId) {
        console.error('Product ID is missing');
        return;
      }

      try {
        let variantData: Variant[] = removeEdgesAndNodes(product?.variants) as Variant[];
        const currentSku = product.sku;
        const matchingVariant = variantData.find((variant) => variant.sku === currentSku);

        if (matchingVariant?.entityId) {
          const variantMetaFields = await GetProductVariantMetaFields(
            product.entityId,
            matchingVariant.entityId,
            'Details',
          );

          console.log('Variant Meta Fields:', variantMetaFields);

          if (variantMetaFields) {
            setVariantDetails(variantMetaFields);
          }
        }

        // Get product level metadata only for install sheet and included items
        const productMetaFields = await GetProductMetaFields(product.entityId, '');

        const productIncludedMeta = productMetaFields?.find(
          (meta: MetaField) => meta.key === 'included',
        );

        let productLevelItems: IncludedItem[] = [];
        if (productIncludedMeta) {
          try {
            productLevelItems = JSON.parse(productIncludedMeta.value);
          } catch (parseError) {
            console.error('Error parsing product level included items');
          }
        }

        const variantIncludedData = await getMetaFieldsByProduct(product, 'included');
        let variantLevelItems: IncludedItem[] = [];
        if (variantIncludedData?.isVariantData && variantIncludedData?.metaField?.value) {
          try {
            variantLevelItems = JSON.parse(variantIncludedData.metaField.value);
          } catch (parseError) {
            console.error('Error parsing variant level included items');
          }
        }

        setIncludedItems({
          productLevel: productLevelItems,
          variantLevel: variantLevelItems,
        });

        const installSheetMeta = productMetaFields?.find(
          (meta: MetaField) => meta.key === 'install_sheet',
        );
        setInstallSheet(installSheetMeta || null);

        const specSheetData = await getMetaFieldsByProduct(product, 'spec_sheet');
        setSpecSheet(specSheetData as MetaFieldData);
      } catch (error) {
        console.error('Error fetching meta fields:', error);
      }
    };

    if (product) {
      fetchMetaFields();
    }
  }, [product]);

  const getSpecSheetValue = () => {
    if (!specSheet) return null;
    const isUsingVariant = specSheet.isVariantData && specSheet.metaField?.value;
    return isUsingVariant ? specSheet.metaField?.value : specSheet.productMetaField?.value;
  };

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const closeDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    if (buttonRef.current) {
      buttonRef.current.focus();
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const specSheetUrl = getSpecSheetValue();
  const installSheetUrl = installSheet?.value;

  // Use only variant details for display
  const groupedDetails = processMetaFields(variantDetails);

  return (
    <div
      className="relative mt-6 inline-block w-full transition-all duration-300 xl:mt-12"
      ref={dropdownRef}
    >
      {/* Dropdown Toggle Button */}
      <button
        ref={buttonRef}
        className="relative flex w-full cursor-pointer items-center rounded border border-gray-300 px-6 py-4 text-left"
        onClick={toggleDropdown}
        type="button"
      >
        <span className="flex-grow text-center text-[0.875rem] font-semibold uppercase text-[#002A37]">
          {t('productDetails')}
        </span>
        <svg
          className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L6 6L11 1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown Content */}
      <div
        className={`transition-max-height overflow-hidden duration-300 ${isOpen ? 'max-h-[1600px]' : 'max-h-0'}`}
        style={{ transitionTimingFunction: 'ease' }}
      >
        {isOpen && (
          <div className="mt-6 w-full rounded border border-gray-300 bg-white p-8 shadow-lg">
            {/* Header Section */}
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">{t('whatsInTheBox')}</span>
              <span className="text-sm text-gray-600">SKU: {product?.sku || t('sku')}</span>
            </div>

            {/* Included Items Section */}
            <div className="mb-2">
              <div className="text-gray-700">
                {includedItems.variantLevel.length > 0
                  ? includedItems.variantLevel.map((item, index) => (
                      <React.Fragment key={`variant-${index}`}>
                        <span>{item.name}</span>
                        {index < includedItems.variantLevel.length - 1 && (
                          <span className="mx-2">|</span>
                        )}
                      </React.Fragment>
                    ))
                  : includedItems.productLevel.length > 0
                    ? includedItems.productLevel.map((item, index) => (
                        <React.Fragment key={`product-${index}`}>
                          <span>{item.name}</span>
                          {index < includedItems.productLevel.length - 1 && (
                            <span className="mx-2">|</span>
                          )}
                        </React.Fragment>
                      ))
                    : null}
              </div>
            </div>

            {/* Document Buttons Section */}
            <div className="space-y-2">
              {specSheetUrl && (
                <button
                  type="button"
                  className="flex w-full items-center justify-center rounded bg-[#008BB7] px-4 py-2.5 text-sm text-white hover:bg-[#007aa3]"
                >
                  <a
                    className="text-white"
                    href={specSheetUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    SPEC SHEET
                  </a>
                </button>
              )}
              {installSheetUrl && (
                <button
                  type="button"
                  className="flex w-full items-center justify-center rounded bg-[#008BB7] px-4 py-2.5 text-sm text-white hover:bg-[#007aa3]"
                >
                  <a
                    className="text-white"
                    href={installSheetUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    INSTALL SHEET
                  </a>
                </button>
              )}
            </div>

            {/* Product Details Section */}
            {groupedDetails.length > 0 && (
              <div className="space-y-3">
                {groupedDetails.map((group, groupIndex) => (
                  <div key={`group-${groupIndex}`} className="pt-2">
                    <h3 className="mb-3 text-xl font-bold text-gray-900">{group.category}</h3>
                    <div className="w-full">
                      <table className="w-full table-auto">
                        <tbody>
                          {group.details.map((detail, detailIndex) => (
                            <tr key={`${group.category}-${detailIndex}`}>
                              <td
                                className="border p-2 py-2 pr-4 text-[15px] text-gray-700"
                                style={{ width: '200px' }}
                              >
                                {detail.key}
                              </td>
                              <td className="border p-2 py-2 text-[15px] text-gray-900">
                                {detail.value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Warning Section */}
            <div className="mt-4 text-center text-base underline" style={{ fontSize: '16px' }}>
              {t('warning')}
            </div>
            
            {/* Close Button */}
            <button
              type="button"
              className="mt-8 flex w-full items-center justify-center rounded border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={closeDropdown}
            >
              <span>{t('closeDetails')}</span>
              <svg
                className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1L6 6L11 1"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailDropdown;