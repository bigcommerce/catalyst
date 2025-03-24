import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations } from 'next-intl/server';
import { SearchParams } from 'nuqs';
import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server';

import { CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { Breadcrumb, Breadcrumbs } from '@/vibes/soul/sections/breadcrumbs';
import { SectionLayout } from '@/vibes/soul/sections/section-layout';
import { Wishlist, WishlistDetails } from '@/vibes/soul/sections/wishlist-details';
import { addWishlistItemToCart } from '~/app/[locale]/(default)/account/wishlists/[id]/_actions/add-to-cart';
import {
  WishlistShareButton,
  WishlistShareButtonSkeleton,
} from '~/app/[locale]/(default)/account/wishlists/[id]/_components/share-button';
import { ExistingResultType } from '~/client/util';
import { defaultPageInfo, pageInfoTransformer } from '~/data-transformers/page-info-transformer';
import { publicWishlistDetailsTransformer } from '~/data-transformers/wishlists-transformer';
import { isMobileUser } from '~/lib/user-agent';

import { getPublicWishlist } from './page-data';

interface Props {
  params: Promise<{ token: string }>;
  searchParams: Promise<SearchParams>;
}

const defaultWishlistItemsLimit = 12;
const searchParamsCache = createSearchParamsCache({
  tag: parseAsString,
  before: parseAsString,
  after: parseAsString,
  limit: parseAsInteger.withDefault(defaultWishlistItemsLimit),
});

async function getWishlist(
  token: string,
  t: ExistingResultType<typeof getTranslations>,
  pt: ExistingResultType<typeof getTranslations>,
  searchParams: Promise<SearchParams>,
): Promise<Wishlist> {
  const searchParamsParsed = searchParamsCache.parse(await searchParams);
  const formatter = await getFormatter();
  const wishlist = await getPublicWishlist(token, searchParamsParsed);

  if (!wishlist) {
    return notFound();
  }

  return publicWishlistDetailsTransformer(wishlist, t, pt, formatter);
}

async function getPaginationInfo(
  token: string,
  searchParams: Promise<SearchParams>,
): Promise<CursorPaginationInfo> {
  const searchParamsParsed = searchParamsCache.parse(await searchParams);
  const wishlist = await getPublicWishlist(token, searchParamsParsed);

  return pageInfoTransformer(wishlist?.items.pageInfo ?? defaultPageInfo);
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { token } = await params;
  // Even though we don't need paginated data during metadata generation, we should still pass the parameters
  // to make sure we aren't bypassing an existing cache just for the metadata generation.
  const searchParamsParsed = searchParamsCache.parse(await searchParams);
  const t = await getTranslations('PublicWishlist');
  const wishlist = await getPublicWishlist(token, searchParamsParsed);

  return {
    title: wishlist?.name ?? t('title'),
  };
}

async function getBreadcrumbs(
  token: string,
  searchParams: Promise<SearchParams>,
): Promise<Breadcrumb[]> {
  const t = await getTranslations('PublicWishlist');
  const searchParamsParsed = searchParamsCache.parse(await searchParams);
  const wishlist = await getPublicWishlist(token, searchParamsParsed);

  return [
    { href: '/', label: 'Home' },
    { href: '#', label: wishlist?.name ?? t('defaultName') },
  ];
}

export default async function PublicWishlist({ params, searchParams }: Props) {
  const { token } = await params;
  const t = await getTranslations('Account.Wishlists');
  const pt = await getTranslations('Product.ProductDetails');
  const wishlistActions = (wishlist?: Wishlist) => {
    if (!wishlist) {
      return (
        <div className="flex items-center">
          <WishlistShareButtonSkeleton size="medium" />
        </div>
      );
    }

    const { publicUrl } = wishlist;

    if (!publicUrl || publicUrl === '') {
      return null;
    }

    return (
      <div className="flex items-center">
        <WishlistShareButton
          closeLabel={t('Modal.close')}
          copiedMessage={t('shareCopied')}
          disabledTooltip={t('shareDisabled')}
          isMobileUser={isMobileUser()}
          isPublic={wishlist.visibility.isPublic}
          label={t('share')}
          modalTitle={t('Modal.shareTitle', { name: wishlist.name })}
          publicUrl={publicUrl}
          size="medium"
          successMessage={t('shareSuccess')}
          wishlistName={wishlist.name}
        />
      </div>
    );
  };

  return (
    <SectionLayout>
      <Breadcrumbs breadcrumbs={getBreadcrumbs(token, searchParams)} />

      <WishlistDetails
        action={addWishlistItemToCart}
        className="mt-8"
        emptyStateText={t('emptyWishlist')}
        headerActions={wishlistActions}
        paginationInfo={getPaginationInfo(token, searchParams)}
        wishlist={getWishlist(token, t, pt, searchParams)}
      />
    </SectionLayout>
  );
}
