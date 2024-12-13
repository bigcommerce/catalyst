import { getTranslations } from 'next-intl/server';

export const TabHeading = async ({ heading }: { heading: string }) => {
  const t = await getTranslations('Account.Layout');

  return <h2 className="mb-8 text-3xl font-black lg:text-4xl">{t(heading)}</h2>;
};
