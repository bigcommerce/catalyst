import { Pagination } from '~/components/ui/pagination';

import { TabHeading } from '../../_components/tab-heading';
import { getWishlists } from '../page-data';

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

export const WISHLISTS_PER_PAGE = 10;

export const WishlistContent = ({ pageInfo, wishlists }: WishlistContentProps) => {
  const { hasNextPage, hasPreviousPage, startCursor, endCursor } = pageInfo;

  return (
    <>
      <TabHeading heading="wishlists" />
      <WishlistBook hasPreviousPage={hasPreviousPage} wishlists={wishlists}>
        <Pagination
          className="my-0"
          endCursor={endCursor ?? undefined}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          startCursor={startCursor ?? undefined}
        />
      </WishlistBook>
    </>
  );
};
