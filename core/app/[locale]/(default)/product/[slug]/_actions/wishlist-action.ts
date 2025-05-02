'use server';

import {
  BigCommerceAPIError,
  BigCommerceGQLError,
  removeEdgesAndNodes,
} from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { revalidateTag } from 'next/cache';
import { getLocale, getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { CreateWishlistMutation } from '~/app/[locale]/(default)/account/wishlists/_actions/mutation';
import { newWishlist } from '~/app/[locale]/(default)/account/wishlists/_actions/new-wishlist';
import { getSessionCustomerAccessToken } from '~/auth';
import { buildConfig } from '~/build-config/reader';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import { WishlistMutationError } from '~/components/wishlist/error';
import { redirect } from '~/i18n/routing';
import { serverToast } from '~/lib/server-toast';

const VariantIdFromSkuQuery = graphql(`
  query VariantIdFromSkuQuery($productId: Int!, $sku: String!) {
    site {
      product(entityId: $productId) {
        variants(skus: [$sku]) {
          edges {
            node {
              entityId
            }
          }
        }
      }
    }
  }
`);

const AddToWishlistMutation = graphql(`
  mutation AddToWishlistMutation($wishlistId: Int!, $productId: Int!, $variantId: Int) {
    wishlist {
      addWishlistItems(
        input: {
          entityId: $wishlistId
          items: [{ productEntityId: $productId, variantEntityId: $variantId }]
        }
      ) {
        result {
          entityId
        }
      }
    }
  }
`);

const DeleteWishlistItemsMutation = graphql(`
  mutation DeleteWishlistItemsMutation($wishlistId: Int!, $wishlistItemId: Int!) {
    wishlist {
      deleteWishlistItems(input: { entityId: $wishlistId, itemEntityIds: [$wishlistItemId] }) {
        result {
          entityId
        }
      }
    }
  }
`);

const menuItemSchema = z.object({
  action: z.enum(['add', 'remove']),
  wishlistId: z.number().nonnegative(),
  wishlistItemId: z.number().optional(),
  redirectTo: z.string(),
});

const menuItemParser = z.string().transform((str, ctx) => {
  try {
    return menuItemSchema.parse(JSON.parse(str));
  } catch {
    ctx.addIssue({ code: 'custom', message: 'Invalid menuItem payload.' });

    return z.NEVER;
  }
});

const schema = z.object({
  productId: z.number().nonnegative().min(1),
  selectedSku: z.string(),
  menuItem: menuItemParser,
});

interface WishlistAddMutationVariables {
  wishlistId: number;
  productId: number;
  variantId?: number;
}

interface WishlistRemoveMutationVariables {
  wishlistId: number;
  wishlistItemId: number;
}

async function getVariantIdFromSku(productId: number, sku: string, customerAccessToken?: string) {
  const { data } = await client.fetch({
    document: VariantIdFromSkuQuery,
    variables: { productId, sku },
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  if (!data.site.product?.variants) {
    return undefined;
  }

  return removeEdgesAndNodes(data.site.product.variants)[0]?.entityId ?? undefined;
}

async function addToDefaultWishlist(
  customerAccessToken: string,
  wishlistName: string,
  productId: number,
  variantId?: number,
) {
  const { data } = await client.fetch({
    document: CreateWishlistMutation,
    variables: {
      input: {
        name: wishlistName,
        isPublic: false,
        items: [{ productEntityId: productId, variantEntityId: variantId }],
      },
    },
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  if (!data.wishlist.createWishlist?.result) {
    throw new WishlistMutationError('Failed to add item to default wishlist. Response was empty.');
  }
}

async function addToWishlist(customerAccessToken: string, variables: WishlistAddMutationVariables) {
  const { data } = await client.fetch({
    document: AddToWishlistMutation,
    variables,
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  if (!data.wishlist.addWishlistItems?.result) {
    throw new WishlistMutationError('Failed to add item to wishlist. Response was empty.');
  }
}

async function removeFromWishlist(
  customerAccessToken: string,
  variables: WishlistRemoveMutationVariables,
) {
  const { data } = await client.fetch({
    document: DeleteWishlistItemsMutation,
    variables,
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  if (!data.wishlist.deleteWishlistItems?.result) {
    throw new WishlistMutationError('Failed to add item to wishlist. Response was empty.');
  }
}

function getLoginRedirect(redirectTo: string) {
  const vanityUrl = buildConfig.get('urls').vanityUrl;
  const redirectToUrl = new URL(redirectTo, vanityUrl);
  const redirectToParam = redirectToUrl.pathname + redirectToUrl.search;
  const loginParams = new URLSearchParams({ redirectTo: redirectToParam });

  return `/login?${loginParams.toString()}`;
}

export async function wishlistAction(payload: FormData): Promise<void> {
  const locale = await getLocale();
  const customerAccessToken = await getSessionCustomerAccessToken();
  const t = await getTranslations('Wishlist');
  const submission = parseWithZod(payload, { schema });

  if (submission.status !== 'success') {
    await serverToast.error(t('Errors.unexpected'));

    return;
  }

  if (!customerAccessToken) {
    redirect({ href: getLoginRedirect(submission.value.menuItem.redirectTo), locale });

    return;
  }

  try {
    const {
      productId,
      selectedSku,
      menuItem: { action, wishlistId, wishlistItemId },
    } = submission.value;

    switch (action) {
      case 'add': {
        const variantId = await getVariantIdFromSku(productId, selectedSku, customerAccessToken);

        if (wishlistId === 0) {
          await addToDefaultWishlist(
            customerAccessToken,
            t('Button.defaultWishlistName'),
            productId,
            variantId,
          );
        } else {
          await addToWishlist(customerAccessToken, { wishlistId, productId, variantId });
        }

        await serverToast.success(t('Button.addSuccessMessage'));

        break;
      }

      case 'remove': {
        if (!wishlistItemId) {
          throw new WishlistMutationError('wishlistItemId is required for remove action');
        }

        await removeFromWishlist(customerAccessToken, { wishlistId, wishlistItemId });
        await serverToast.success(t('Button.removeSuccessMessage'));

        break;
      }
    }

    revalidateTag(TAGS.customer);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceGQLError) {
      if (error.message.includes('Please sign in')) {
        redirect({ href: getLoginRedirect(submission.value.menuItem.redirectTo), locale });

        return;
      }

      await serverToast.error(t('Errors.unexpected'));
    }

    if (error instanceof BigCommerceAPIError) {
      await serverToast.error(t('Errors.unexpected'));
    }

    await serverToast.error(t('Errors.unexpected'));
  }
}

interface State {
  lastResult: SubmissionResult | null;
  successMessage?: string;
}

const addToNewWishlistSchema = z.object({
  productId: z.number().nonnegative().min(1),
  selectedSku: z.string(),
  wishlistName: z.string().trim().nonempty(),
  redirectTo: z.string(),
});

export async function addToNewWishlist(
  prevState: Awaited<State>,
  formData: FormData,
): Promise<State> {
  const locale = await getLocale();
  const t = await getTranslations('Wishlist');
  const submission = parseWithZod(formData, { schema: addToNewWishlistSchema });

  if (submission.status !== 'success') {
    return { lastResult: submission.reply({ formErrors: [t('Errors.unexpected')] }) };
  }

  const { productId, selectedSku, redirectTo } = submission.value;
  const customerAccessToken = await getSessionCustomerAccessToken();
  const variantId = await getVariantIdFromSku(productId, selectedSku, customerAccessToken);

  formData.append('wishlistItems[0].productEntityId', productId.toString());

  if (variantId) {
    formData.append('wishlistItems[0].variantEntityId', variantId.toString());
  }

  if (!customerAccessToken) {
    redirect({ href: getLoginRedirect(redirectTo), locale });

    return { lastResult: null };
  }

  const result = await newWishlist(prevState, formData);

  if (result.lastResult?.status === 'success') {
    await serverToast.success(t('Button.addSuccessMessage'));
  }

  return result;
}
