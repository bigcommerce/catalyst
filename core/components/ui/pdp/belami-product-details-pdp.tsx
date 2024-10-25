'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { getMetaFieldsByProduct } from '~/components/common-functions';

const ProductDetailDropdown = ({ product }: { product: any }) => {
  const t = useTranslations('productDetailDropdown');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null); // Ref for the "Product Details" button

  const [installSheet, setInstallSheet] = useState<any>();

  useEffect(() => {
    const getMetaDetails = async (product2: any, metaField: string) => {
      let returnData = await getMetaFieldsByProduct(product2, metaField);
      if (metaField == 'install_sheet') {
        setInstallSheet(returnData);
      }
    };
    getMetaDetails(product, 'install_sheet');
  }, [product]);

  // Toggle dropdown
  const toggleDropdown = () => setIsOpen((prev) => !prev);

  // Close dropdown and refocus on button
  const closeDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    if (buttonRef.current) {
      buttonRef.current.focus();
    }
  };

  // Handle click outside dropdown to close it
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
  return (
    <div
      className={`relative mt-6 inline-block w-full transition-all duration-300 xl:mt-12`}
      ref={dropdownRef}
    >
      <button
        ref={buttonRef}
        className="relative flex w-full cursor-pointer items-center rounded border border-gray-300 px-6 py-4 text-left"
        onClick={toggleDropdown}
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
        className={`transition-max-height overflow-hidden duration-300 ${isOpen ? 'max-h-[1600px]' : 'max-h-0'}`}
        style={{ transitionTimingFunction: 'ease' }}
      >
        {isOpen && (
          <div className="mt-6 w-full rounded border border-gray-300 bg-white p-8 shadow-lg">
            <div className="mb-2 flex items-center justify-between" style={{ fontSize: '18px' }}>
              <span className="mb-2 mt-4 text-lg font-semibold">{t('whatsInTheBox')}</span>
              <span style={{ fontSize: '14px' }}>{t('sku')}</span>
            </div>
            <div className="mt-2 text-gray-700" style={{ fontSize: '14px' }}>
              <span>{t('canopy')}</span> <span>|</span> <span>{t('shade')}</span> <span>|</span>{' '}
              <span>{t('rod2to6')}</span> <span>|</span> <span>{t('rod2to12')}</span>
            </div>
            <div className="mt-4">
              <button className="mb-2 flex w-full items-center justify-center rounded bg-[#008BB7] px-4 py-2 text-sm text-white">
                <img
                  alt="Download spec sheet"
                  src="https://cdn11.bigcommerce.com/s-6cdngmevrl/images/stencil/original/image-manager/icons8-download-symbol-16.png?t=1726210410"
                  height={16}
                  width={16}
                />
                <span className="ml-2">{t('downloadSpecSheet')}</span>
              </button>

              {installSheet && (
                <div className="mt-4">
                  <button className="flex w-full items-center justify-center rounded border border-gray-300 px-4 py-2 text-sm">
                    <img
                      alt="Download installation sheet"
                      src="https://cdn11.bigcommerce.com/s-6cdngmevrl/images/stencil/original/image-manager/icons8-download-symbol-16-1-.png?t=1726210403"
                      height={16}
                      width={16}
                    />
                    {/* Add download attribute to force download */}
                    <a className="ml-2" href={installSheet?.value} download target="_blank">
                      {t('installationSheet')}
                    </a>
                  </button>
                </div>
              )}
            </div>

            {/* Product Dimensions and Details */}
            <h2 className="mb-2 mt-4 text-lg font-semibold" style={{ fontSize: '18px' }}>
              {t('dimensionsAndWeights')}
            </h2>
            <table className="mt-4 w-full border-collapse text-base" style={{ fontSize: '16px' }}>
              <tbody>
                <tr>
                  <td className="border p-2" style={{ width: '30%' }}>
                    {t('widthDiameter')}
                  </td>
                  <td className="border p-2" style={{ width: '70%' }}>
                    {t('Eighteen')}
                  </td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ width: '30%' }}>
                    {t('height')}
                  </td>
                  <td className="border p-2" style={{ width: '70%' }}>
                    {t('725')}
                  </td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ width: '30%' }}>
                    {t('depthExtension')}
                  </td>
                  <td className="border p-2" style={{ width: '70%' }}>
                    {t('Eighteen')}
                  </td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ width: '30%' }}>
                    {t('canopyWidth')}
                  </td>
                  <td className="border p-2" style={{ width: '70%' }}>
                    {t('fourteen')}
                  </td>
                </tr>
              </tbody>
            </table>

            <h2 className="mb-2 mt-4 text-lg font-semibold">{t('installationDetails')}</h2>
            <table className="w-full border-collapse text-base">
              <tbody>
                <tr>
                  <td className="border p-2" style={{ width: '30%' }}>
                    {t('wireLength')}
                  </td>
                  <td className="border p-2" style={{ width: '70%' }}>
                    {t('onetwenty')}
                  </td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ width: '30%' }}>
                    {t('chainLength')}
                  </td>
                  <td className="border p-2" style={{ width: '70%' }}>
                    {t('twelve')}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* More Product Details */}
            <h2 className="mb-2 mt-4 text-lg font-semibold">{t('Lamping')}</h2>
            <table className="w-full border-collapse text-base">
              <tbody>
                <tr>
                  <td className="border p-2" style={{ width: '30%' }}>
                    {t('numberOfBulbs')}
                  </td>
                  <td className="border p-2" style={{ width: '70%' }}>
                    {t('one')}
                  </td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ width: '30%' }}>
                    {t('standardWattage')}
                  </td>
                  <td className="border p-2" style={{ width: '70%' }}>
                    {t('standardWattageText')}
                  </td>
                </tr>
              </tbody>
            </table>
            <h2 className="mb-2 mt-4 text-lg font-semibold" style={{ fontSize: '18px' }}>
              {t('compatibilityAndSmartFeatures')}
            </h2>
            <table className="w-full border-collapse text-base" style={{ fontSize: '16px' }}>
              <tbody>
                <tr>
                  <td className="border p-2" style={{ width: '30%' }}>
                    {t('smartCompatible')}
                  </td>
                  <td className="border p-2" style={{ width: '70%' }}>
                    {t('smartCompatibleText')}
                  </td>
                </tr>
              </tbody>
            </table>
            <h2 className="mb-2 mt-4 text-lg font-semibold" style={{ fontSize: '18px' }}>
              {t('productDetailHeading')}
            </h2>
            <table className="w-full border-collapse text-base" style={{ fontSize: '16px' }}>
              <tbody>
                <tr>
                  <td className="border p-2" style={{ width: '30%' }}>
                    {t('finishes')}
                  </td>
                  <td className="border p-2" style={{ width: '70%' }}>
                    {t('finishesText')}
                  </td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ width: '30%' }}>
                    {t('smartCompatible')}
                  </td>
                  <td className="border p-2" style={{ width: '70%' }}>
                    {t('glass')}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="mt-4 text-center text-base underline" style={{ fontSize: '16px' }}>
              {t('warning')}
            </div>

            <button
              className="items-centertext-left mt-4 flex w-full items-center justify-center rounded border border-gray-300 px-6 py-4 text-sm text-[#002A37]"
              onClick={closeDropdown} // Close the dropdown on click
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














