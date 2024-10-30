'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { GetProductMetaFields } from '~/components/management-apis';
import { getMetaFieldsByProduct } from '~/components/common-functions';

interface MetaField {
  entityId: number;
  key: string;
  value: string;
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

const ProductDetailDropdown = ({ product }: { product: any }) => {
  const t = useTranslations('productDetailDropdown');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [installSheet, setInstallSheet] = useState<MetaField | null>(null);
  const [specSheet, setSpecSheet] = useState<MetaFieldData | null>(null);
  const [includedItems, setIncludedItems] = useState<{
    productLevel: IncludedItem[];
    variantLevel: IncludedItem[];
  }>({
    productLevel: [],
    variantLevel: [],
  });

  useEffect(() => {
    const fetchMetaFields = async () => {
      if (!product?.entityId) {
        console.error('Product ID is missing');
        return;
      }

      try {
        // Get variants array safely
        let variantData = Array.isArray(product.variants) ? product.variants : [];
        // For Canopy data structure
        if (product.variants?.edges) {
          variantData = product.variants.edges.map((edge: any) => edge.node);
        }

        // Find matching variant by SKU
        const currentSku = product.sku;
        const matchingVariant = variantData.find((variant: any) => variant.sku === currentSku);

        console.log('SKU and Variant Match:', {
          productSku: currentSku,
          variants: variantData.map((v: any) => ({
            sku: v.sku,
            entityId: v.entityId,
          })),
          matchingVariantId: matchingVariant?.entityId,
          isMatch: Boolean(matchingVariant),
        });

        // Fetch product level metadata
        const productMetaFields = await GetProductMetaFields(product.entityId, '');

        // Parse product level included items
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

        // Get variant level included items with variant ID
        const variantIncludedData = await getMetaFieldsByProduct(product, 'included');

        // Log detailed variant metadata information
        console.log('Variant Metadata Details:', {
          matchedVariantId: matchingVariant?.entityId,
          productSku: currentSku,
          hasVariantMetadata: Boolean(variantIncludedData?.metaField),
          variantMetadata: variantIncludedData?.metaField,
          isVariantData: variantIncludedData?.isVariantData,
        });

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

        // Find install sheet metadata
        const installSheetMeta = productMetaFields?.find(
          (meta: MetaField) => meta.key === 'install_sheet',
        );
        setInstallSheet(installSheetMeta || null);

        // Get spec sheet metadata
        const specSheetData = await getMetaFieldsByProduct(product, 'spec_sheet');

        // Log spec sheet variant information with variant ID
        console.log('Spec Sheet Data:', {
          variantId: matchingVariant?.entityId,
          isVariantLevel: specSheetData?.isVariantData,
          hasVariantMetadata: Boolean(specSheetData?.metaField),
          metadataValue: specSheetData?.metaField?.value,
        });

        setSpecSheet(specSheetData);
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

  return (
    <div
      className={`relative mt-6 inline-block w-full transition-all duration-300 xl:mt-12`}
      ref={dropdownRef}
    >
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

      <div
        className={`transition-max-height overflow-hidden duration-300 ${
          isOpen ? 'max-h-[1600px]' : 'max-h-0'
        }`}
        style={{ transitionTimingFunction: 'ease' }}
      >
        {isOpen && (
          <div className="mt-6 w-full rounded border border-gray-300 bg-white p-8 shadow-lg">
            <div className="mb-2 flex items-center justify-between" style={{ fontSize: '18px' }}>
              <span className="mb-2 mt-4 text-lg font-semibold">{t('whatsInTheBox')}</span>
              <span style={{ fontSize: '14px' }}>{product?.sku || t('sku')}</span>
            </div>

            <div className="mt-2 text-gray-700" style={{ fontSize: '14px' }}>
              {includedItems.variantLevel.length > 0
                ? includedItems.variantLevel.map((item, index) => (
                    <React.Fragment key={`variant-${index}`}>
                      <span>{item.name}</span>
                      {index < includedItems.variantLevel.length - 1 && <span> | </span>}
                    </React.Fragment>
                  ))
                : includedItems.productLevel.length > 0
                  ? includedItems.productLevel.map((item, index) => (
                      <React.Fragment key={`product-${index}`}>
                        <span>{item.name}</span>
                        {index < includedItems.productLevel.length - 1 && <span> | </span>}
                      </React.Fragment>
                    ))
                  : null}
            </div>

            <div className="mt-4">
              {specSheetUrl && (
                <button
                  type="button"
                  className="mb-2 flex w-full items-center justify-center rounded bg-[#008BB7] px-4 py-2 text-sm text-white"
                >
                  <img
                    alt="Download spec sheet"
                    src="https://cdn11.bigcommerce.com/s-6cdngmevrl/images/stencil/original/image-manager/icons8-download-symbol-16.png?t=1726210410"
                    height={16}
                    width={16}
                  />
                  <a
                    className="ml-2 text-white"
                    href={specSheetUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('downloadSpecSheet')}
                  </a>
                </button>
              )}

              {installSheetUrl && (
                <div className="mt-4">
                  <button
                    type="button"
                    className="flex w-full items-center justify-center rounded border border-gray-300 px-4 py-2 text-sm"
                  >
                    <img
                      alt="Download installation sheet"
                      src="https://cdn11.bigcommerce.com/s-6cdngmevrl/images/stencil/original/image-manager/icons8-download-symbol-16-1-.png?t=1726210403"
                      height={16}
                      width={16}
                    />
                    <a
                      className="ml-2"
                      href={installSheetUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t('installationSheet')}
                    </a>
                  </button>
                </div>
              )}
            </div>

            <h2 className="mb-2 mt-4 text-lg font-semibold">Heading</h2>
            <table className="w-full border-collapse text-base">
              <tbody>
                <tr>
                  <td className="border p-2" style={{ width: '30%' }}>
                    subheading
                  </td>
                  <td className="border p-2" style={{ width: '70%' }}>
                    value
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="mt-4 text-center text-base underline" style={{ fontSize: '16px' }}>
              {t('warning')}
            </div>

            <button
              type="button"
              className="items-centertext-left mt-4 flex w-full items-center justify-center rounded border border-gray-300 px-6 py-4 text-sm text-[#002A37]"
              onClick={closeDropdown}
            >
              <span className="flex-grow text-center text-[0.875rem] font-semibold uppercase text-[#002A37]">
                {t('closeDetails')}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailDropdown;
