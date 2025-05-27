import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { SearchParams } from 'nuqs';
import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { Breadcrumb, Breadcrumbs } from '@/vibes/soul/sections/breadcrumbs';
import { SectionLayout } from '@/vibes/soul/sections/section-layout';
import { Wishlist, WishlistDetails } from '@/vibes/soul/sections/wishlist-details';
import { addWishlistItemToCart } from '~/app/[locale]/(default)/account/wishlists/[id]/_actions/add-to-cart';
import { WishlistAnalyticsProvider } from '~/app/[locale]/(default)/account/wishlists/[id]/_components/wishlist-analytics-provider';
import { ExistingResultType } from '~/client/util';
import {
  WishlistShareButton,
  WishlistShareButtonSkeleton,
} from '~/components/wishlist/share-button';
import { defaultPageInfo, pageInfoTransformer } from '~/data-transformers/page-info-transformer';
import { publicWishlistDetailsTransformer } from '~/data-transformers/wishlists-transformer';
import { isMobileUser } from '~/lib/user-agent';

import { getPublicWishlist } from './page-data';

interface Props {
  params: Promise<{ locale: string; token: string }>;
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
  t: ExistingResultType<typeof getTranslations<'Wishlist'>>,
  pt: ExistingResultType<typeof getTranslations<'Product.ProductDetails'>>,
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
  const { locale, token } = await params;
  // Even though we don't need paginated data during metadata generation, we should still pass the parameters
  // to make sure we aren't bypassing an existing cache just for the metadata generation.
  const searchParamsParsed = searchParamsCache.parse(await searchParams);
  const t = await getTranslations({ locale, namespace: 'PublicWishlist' });
  const wishlist = await getPublicWishlist(token, searchParamsParsed);

  return {
    title: wishlist?.name ?? t('title'),
  };
}

const getAnalyticsData = async (token: string, searchParamsPromise: Promise<SearchParams>) => {
  const searchParamsParsed = searchParamsCache.parse(await searchParamsPromise);
  const wishlist = await getPublicWishlist(token, searchParamsParsed);

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
  const { locale, token } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Wishlist');
  const pwt = await getTranslations('PublicWishlist');
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
          copyLabel={t('Modal.copy')}
          disabledTooltip={t('shareDisabled')}
          isMobileUser={Streamable.from(isMobileUser)}
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
    <WishlistAnalyticsProvider data={Streamable.from(() => getAnalyticsData(token, searchParams))}>
      <SectionLayout>
        <Breadcrumbs breadcrumbs={Streamable.from(() => getBreadcrumbs(token, searchParams))} />

        <WishlistDetails
          action={addWishlistItemToCart}
          className="mt-8"
          emptyStateText={pwt('emptyWishlist')}
          headerActions={wishlistActions}
          paginationInfo={Streamable.from(() => getPaginationInfo(token, searchParams))}
          wishlist={Streamable.from(() => getWishlist(token, t, pt, searchParams))}
        />
      </SectionLayout>
    </WishlistAnalyticsProvider>
  );
}
