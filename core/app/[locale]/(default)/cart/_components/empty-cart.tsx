import { useTranslations } from 'next-intl';

export const EmptyCart = () => {
  const t = useTranslations('Cart');

  return (
    <div className="h-[400px] xl:h-[85vh] flex justify-center items-center">
      <div className="flex flex-col gap-5 p-10 sm:p-0">
        <h2 className="text-center font-normal text-[24px] leading-[32px] xl:text-[34px] xl:leading-[46px] tracking-[0.25px] text-[#B4B4B5]">{t('empty')}</h2>
        <p className="text-center font-medium text-[20px] leading-[32px] tracking-[0.15px] text-[#008BB7]">{t('emptyDetails')}</p>
      </div>
    </div>
  );
};
