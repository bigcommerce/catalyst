import { getTranslations } from 'next-intl/server';

import { NotFoundSection } from '~/makeswift/components/not-found';

interface Props {
  searchTerm?: string;
}

export const EmptySearch = async ({ searchTerm = '' }: Props) => {
  const t = await getTranslations('Components.SearchForm');

  return (
    <div className="flex flex-col gap-8 py-16">
      {searchTerm ? (
        <NotFoundSection
          label="Empty Search"
          snapshotId="empty-search"
          subtitle={t('checkSpelling')}
          title={t('noSearchResults', { term: `"${searchTerm}"` })}
        />
      ) : (
        <NotFoundSection
          label="Search Placeholder"
          snapshotId="search-placeholder"
          subtitle={t('clickToSearch')}
          title={t('searchProducts')}
        />
      )}
    </div>
  );
};
