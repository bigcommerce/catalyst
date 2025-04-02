import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { SearchParams } from 'nuqs';
import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { Wishlist, WishlistDetails } from '@/vibes/soul/sections/wishlist-details';
import { ExistingResultType } from '~/client/util';
import { defaultPageInfo, pageInfoTransformer } from '~/data-transformers/page-info-transformer';
import { wishlistDetailsTransformer } from '~/data-transformers/wishlists-transformer';
import { isMobileUser } from '~/lib/user-agent';

import { removeWishlistItem } from '../_actions/remove-wishlist-item';
import { getDeleteWishlistModal, getRenameWishlistModal } from '../modals';

import { addWishlistItemToCart } from './_actions/add-to-cart';
import { WishlistActions, WishlistActionsSkeleton } from './_components/wishlist-actions';
import { WishlistAnalyticsProvider } from './_components/wishlist-analytics-provider';
import { getCustomerWishlist } from './page-data';

interface Props {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<SearchParams>;
}

const defaultWishlistItemsLimit = 10;
const searchParamsCache = createSearchParamsCache({
  tag: parseAsString,
  before: parseAsString,
  after: parseAsString,
  limit: parseAsInteger.withDefault(defaultWishlistItemsLimit),
});

async function getWishlist(
  id: string,
  t: ExistingResultType<typeof getTranslations<'Account.Wishlists'>>,
  pt: ExistingResultType<typeof getTranslations<'Product.ProductDetails'>>,
  searchParamsPromise: Promise<SearchParams>,
): Promise<Wishlist> {
  const entityId = Number(id);
  const searchParamsParsed = searchParamsCache.parse(await searchParamsPromise);
  const formatter = await getFormatter();
  const wishlist = await getCustomerWishlist(entityId, searchParamsParsed);

  if (!wishlist) {
    return notFound();
  }

  return wishlistDetailsTransformer(wishlist, t, pt, formatter);
}

const getAnalyticsData = async (id: string, searchParamsPromise: Promise<SearchParams>) => {
  const entityId = Number(id);
  const searchParamsParsed = searchParamsCache.parse(await searchParamsPromise);
  const wishlist = await getCustomerWishlist(entityId, searchParamsParsed);

  if (!wishlist) {
    return [];
  }

  return removeEdgesAndNodes(wishlist.items)
    .map(({ product }) => product)
    .filter((product) => product !== null)
    .map((product) => {
      return {
        id: product.entityId,
        name: product.name,
        sku: product.sku,
        brand: product.brand?.name ?? '',
        price: product.prices?.price.value ?? 0,
        currency: product.prices?.price.currencyCode ?? '',
      };
    });
};

async function getPaginationInfo(
  id: string,
  searchParamsPromise: Promise<SearchParams>,
): Promise<CursorPaginationInfo> {
  const entityId = Number(id);
  const searchParamsParsed = searchParamsCache.parse(await searchParamsPromise);
  const wishlist = await getCustomerWishlist(entityId, searchParamsParsed);

  return pageInfoTransformer(wishlist?.items.pageInfo ?? defaultPageInfo);
}

export default async function WishlistPage({ params, searchParams }: Props) {
  const { locale, id } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Account.Wishlists');
  const pt = await getTranslations('Product.ProductDetails');
  const wishlistActions = (wishlist?: Wishlist) => {
    if (!wishlist) {
      return <WishlistActionsSkeleton />;
    }

    return (
      <WishlistActions
        isMobileUser={isMobileUser()}
        menuActions={[
          {
            label: t('rename'),
            modal: getRenameWishlistModal(wishlist, t),
          },
          {
            label: t('delete'),
            variant: 'danger',
            modal: getDeleteWishlistModal(wishlist, t),
          },
        ]}
        shareCloseLabel={t('Modal.close')}
        shareCopiedMessage={t('shareCopied')}
        shareDisabledTooltip={t('shareDisabled')}
        shareLabel={t('share')}
        shareModalTitle={t('Modal.shareTitle', { name: wishlist.name })}
        shareSuccessMessage={t('shareSuccess')}
        wishlist={wishlist}
      />
    );
  };

  return (
    <WishlistAnalyticsProvider data={Streamable.from(() => getAnalyticsData(id, searchParams))}>
      <WishlistDetails
        action={addWishlistItemToCart}
        emptyStateText={t('emptyWishlist')}
        headerActions={wishlistActions}
        paginationInfo={Streamable.from(() => getPaginationInfo(id, searchParams))}
        prevHref="/account/wishlists"
        removeAction={removeWishlistItem}
        wishlist={Streamable.from(() => getWishlist(id, t, pt, searchParams))}
      />
    </WishlistAnalyticsProvider>
  );
}
