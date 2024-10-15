import React from 'react';
import { useTranslations } from 'next-intl';
import { BcImage } from '~/components/bc-image';
import { imageManagerImageUrl } from '~/lib/store-assets';

export function SimilarProducts() {
  const t = useTranslations('similarProducts');

  return (
    <section className="section-similar-products xl:p-[40px] p-[20px] bg-[#f3f4f5] xl:mb-[4em] mb-[2em]">
      <div className="div-similar-products flex gap-3 items-center">
        <span>
          <BcImage
            alt="an assortment of brandless products against a blank background"
            src={imageManagerImageUrl('vector-3-.png', '20w')}
            height={10}
            priority={true}
            width={20}
          />
        </span>
        <h2 className="mb-0 xl:text-[20px] text-[18px] text-[#353535] font-medium">{t('heading')}</h2>
      </div>

      <p className="similar-products-paragraph mt-4 mb-2 xl:mb-4 xl:mt-8 text-base font-normal text-[#353535]">
        {t('paragraph')}
      </p>

      <div className="similar-products-button flex flex-wrap gap-4 mt-[20px] mb-[30px]">
        <button className="btn-primary text-white bg-[#353535] hover:bg-[#008BB7] active:bg-[#008BB7] px-4 py-2 rounded-[30px]">
          {t('buttonSimilar')}
        </button>
        <button className="text-[14px] xl:text-[16px] btn-primary text-white bg-[#353535] hover:bg-[#008BB7] active:bg-[#008BB7] px-4 py-2 rounded-[30px]">
          {t('buttonDifferentColor')}
        </button>
        <button className="text-[14px] xl:text-[16px] btn-primary text-white bg-[#353535] hover:bg-[#008BB7] active:bg-[#008BB7] px-4 py-2 rounded-[30px]">
          {t('buttonSmaller')}
        </button>
        <button className="text-[14px] xl:text-[16px] btn-primary text-white bg-[#353535] hover:bg-[#008BB7] active:bg-[#008BB7] px-4 py-2 rounded-[30px]">
          {t('buttonDimmer')}
        </button>
        <button className="text-[14px] xl:text-[16px] btn-primary text-white bg-[#353535] hover:bg-[#008BB7] active:bg-[#008BB7] px-4 py-2 rounded-[30px]">
          {t('buttonBigger')}
        </button>
        <button className="text-[14px] xl:text-[16px] btn-primary text-white bg-[#353535] hover:bg-[#008BB7] active:bg-[#008BB7] px-4 py-2 rounded-[30px]">
          {t('buttonBrighter')}
        </button>
        <button className="text-[14px] xl:text-[16px] btn-primary text-white bg-[#353535] hover:bg-[#008BB7] active:bg-[#008BB7] px-4 py-2 rounded-[30px]">
          {t('buttonCheaper')}
        </button>
      </div>

      <div className="div-searched-products grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-[30px]">
        <div className="searched-products">
          <BcImage
            alt="Product image"
            src={imageManagerImageUrl('lig2.jpg', '320w')}
            height={100}
            priority={true}
            width={100}
            className="w-full"
          />
          <div className="similar-products-text bg-[#e7f5f8] pt-[10px] pb-[10px] pl-[10px] pr-[10px] flex justify-between">
            <p>{t('sku')}</p>
            <p>{t('price')}</p>
          </div>
        </div>
        <div className="searched-products">
          <BcImage
            alt="Product image"
            src={imageManagerImageUrl('lig2.jpg', '320w')}
            height={100}
            priority={true}
            width={100}
            className="w-full"
          />
          <div className="similar-products-text bg-[#e7f5f8] pt-[10px] pb-[10px] pl-[10px] pr-[10px] flex justify-between">
            <p>{t('sku')}</p>
            <p>{t('price')}</p>
          </div>
        </div>
        <div className="searched-products">
          <BcImage
            alt="Product image"
            src={imageManagerImageUrl('lig2.jpg', '320w')}
            height={100}
            priority={true}
            width={100}
            className="w-full"
          />
          <div className="similar-products-text bg-[#e7f5f8] pt-[10px] pb-[10px] pl-[10px] pr-[10px] flex justify-between">
            <p>{t('sku')}</p>
            <p>{t('price')}</p>
          </div>
        </div>
        <div className="searched-products">
          <BcImage
            alt="Product image"
            src={imageManagerImageUrl('lig2.jpg', '320w')}
            height={100}
            priority={true}
            width={100}
            className="w-full"
          />
          <div className="similar-products-text bg-[#e7f5f8] pt-[10px] pb-[10px] pl-[10px] pr-[10px] flex justify-between">
            <p>{t('sku')}</p>
            <p>{t('price')}</p>
          </div>
        </div>
        <div className="searched-products">
          <BcImage
            alt="Product image"
            src={imageManagerImageUrl('lig2.jpg', '320w')}
            height={100}
            priority={true}
            width={100}
            className="w-full"
          />
          <div className="similar-products-text bg-[#e7f5f8] pt-[10px] pb-[10px] pl-[10px] pr-[10px] flex justify-between">
            <p>{t('sku')}</p>
            <p>{t('price')}</p>
          </div>
        </div>
        {/* MORE OPTIONS */}
        <div className="searched-products relative" id="searched-product-overlay">
          <BcImage
            alt="More Options"
            src={imageManagerImageUrl('lig2.jpg', '320w')}
            height={10}
            priority={true}
            width={20}
            className="w-full"
          />
          <div className="div-searched-products-more-options flex flex-col-reverse absolute top-0 left-0 w-full h-[100%] xl:h-[86%] bg-black bg-opacity-60 flex justify-center items-center text-white text-center">
            <p className="text-base text-white">{t('moreOptions')}</p>
            <BcImage
              className="mb-2"
              alt="Options icon"
              src={imageManagerImageUrl('vector-4-.png', '20w')}
              height={10}
              priority={true}
              width={20}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

