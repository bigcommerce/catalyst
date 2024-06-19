import { getLocale, getTranslations } from 'next-intl/server';

import { Pagination } from '~/components/ui/pagination';

import { getWishlists } from '../../page-data';
import { TabHeading } from '../tab-heading';

import { WishlistBook } from './wishlist-book';

type WishlistsDetails = NonNullable<Awaited<ReturnType<typeof getWishlists>>>;
export type Wishlists = WishlistsDetails['wishlists'];

interface WishlistContentProps {
  wishlists: Wishlists;
  pageInfo: WishlistsDetails['pageInfo'];
}

export interface FormStatus {
  status: 'success' | 'error';
  message: string;
}

export const WISHLISTS_PER_PAGE = 4;

export const WishlistContent = async ({ pageInfo, wishlists }: WishlistContentProps) => {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'Pagination' });

  const { hasNextPage, hasPreviousPage, startCursor, endCursor } = pageInfo;

  return (
    <>
      <TabHeading heading="wishlists" />
      <WishlistBook hasPreviousPage={hasPreviousPage} wishlists={wishlists}>
        <Pagination
          className="my-0"
          endCursor={endCursor}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          nextLabel={t('next')}
          prevLabel={t('prev')}
          startCursor={startCursor}
        />
      </WishlistBook>
    </>
  );
};
