import { getTranslations } from 'next-intl/server';

interface Props {
  locale: string;
}

export const EmptyCart = async ({ locale }: Props) => {
  const t = await getTranslations({ locale, namespace: 'Cart' });

  return (
    <div className="flex h-full flex-col">
      <h1 className="pb-6 text-4xl font-black lg:pb-10 lg:text-5xl">{t('heading')}</h1>
      <div className="flex grow flex-col items-center justify-center gap-6 border-t border-t-gray-200 py-20">
        <h2 className="text-xl font-bold lg:text-2xl">{t('empty')}</h2>
        <p className="text-center">{t('emptyDetails')}</p>
      </div>
    </div>
  );
};
