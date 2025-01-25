import { useTranslations } from 'next-intl';

export const FreeDelivery = () => {
  const t = useTranslations('freeDelivery');

  return (
    <div className="product-free-delivery">
      <div className="mt-0 text-center leading-6 tracking-[0.25px] text-base font-normal tracking-tight text-[#353535] lg:text-left xl:mt-[15px] xl:text-left">
        {t('title')} {/* Free Delivery */}
      </div>
      <div className="text-[#6A4C1E] mb-2 mt-[1em] hidden w-fit bg-[#FBF4E9] p-1 text-left text-sm font-normal leading-6 tracking-wider xl:block">
        {t('description')} {/* This product is backordered until mm/dd. */}
      </div>
    </div>
  );
};