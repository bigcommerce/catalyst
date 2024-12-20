import React from 'react';
import { useTranslations } from 'next-intl';
import { BcImage } from '~/components/bc-image';
import { imageManagerImageUrl } from '~/lib/store-assets';

export function SimilarProducts() {
  const t = useTranslations('similarProducts');

  return (
    <section className="section-similar-products mb-[2em] bg-[#f3f4f5] p-[20px] xl:mb-[4em] xl:p-[40px]">
      <div className="div-similar-products flex items-center gap-3">
        <span>
          <BcImage
            alt="an assortment of brandless products against a blank background"
            src={imageManagerImageUrl('vector-3-.png', '20w')}
            height={10}
            priority={true}
            width={20}
          />
        </span>
        <h2 className="mb-0 text-[18px] font-medium text-[#353535] xl:text-[20px]">
          {t('heading')}
        </h2>
      </div>

      <p className="similar-products-paragraph mb-2 mt-4 text-base font-normal text-[#353535] xl:mb-4 xl:mt-8">
        {t('paragraph')}
      </p>

      <div className="similar-products-button mb-[30px] mt-[20px] flex flex-wrap gap-4">
        <button className="btn-primary rounded-[30px] bg-[#353535] px-4 py-2 text-white hover:bg-[#008BB7] active:bg-[#008BB7]">
          {t('buttonSimilar')}
        </button>
        <button className="btn-primary rounded-[30px] bg-[#353535] px-4 py-2 text-[14px] text-white hover:bg-[#008BB7] active:bg-[#008BB7] xl:text-[16px]">
          {t('buttonDifferentColor')}
        </button>
        <button className="btn-primary rounded-[30px] bg-[#353535] px-4 py-2 text-[14px] text-white hover:bg-[#008BB7] active:bg-[#008BB7] xl:text-[16px]">
          {t('buttonSmaller')}
        </button>
        <button className="btn-primary rounded-[30px] bg-[#353535] px-4 py-2 text-[14px] text-white hover:bg-[#008BB7] active:bg-[#008BB7] xl:text-[16px]">
          {t('buttonDimmer')}
        </button>
        <button className="btn-primary rounded-[30px] bg-[#353535] px-4 py-2 text-[14px] text-white hover:bg-[#008BB7] active:bg-[#008BB7] xl:text-[16px]">
          {t('buttonBigger')}
        </button>
        <button className="btn-primary rounded-[30px] bg-[#353535] px-4 py-2 text-[14px] text-white hover:bg-[#008BB7] active:bg-[#008BB7] xl:text-[16px]">
          {t('buttonBrighter')}
        </button>
        <button className="btn-primary rounded-[30px] bg-[#353535] px-4 py-2 text-[14px] text-white hover:bg-[#008BB7] active:bg-[#008BB7] xl:text-[16px]">
          {t('buttonCheaper')}
        </button>
      </div>

      <div className="div-searched-products grid grid-cols-1 gap-[30px] md:grid-cols-3 xl:grid-cols-6">
        <div className="searched-products">
          <BcImage
            alt="Product image"
            src={imageManagerImageUrl('lig2.jpg', '320w')}
            height={100}
            priority={true}
            width={100}
            className="w-full"
          />
          <div className="similar-products-text flex justify-between bg-[#e7f5f8] pb-[10px] pl-[10px] pr-[10px] pt-[10px]">
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
          <div className="similar-products-text flex justify-between bg-[#e7f5f8] pb-[10px] pl-[10px] pr-[10px] pt-[10px]">
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
          <div className="similar-products-text flex justify-between bg-[#e7f5f8] pb-[10px] pl-[10px] pr-[10px] pt-[10px]">
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
          <div className="similar-products-text flex justify-between bg-[#e7f5f8] pb-[10px] pl-[10px] pr-[10px] pt-[10px]">
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
          <div className="similar-products-text flex justify-between bg-[#e7f5f8] pb-[10px] pl-[10px] pr-[10px] pt-[10px]">
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
          <div className="div-searched-products-more-options absolute left-0 top-0 flex h-[100%] w-full flex-col-reverse items-center justify-center bg-black bg-opacity-60 text-center text-white xl:h-[86%]">
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
