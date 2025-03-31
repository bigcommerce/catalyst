'use server';

import { BigCommerceAPIError, BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { Link } from '~/components/link';
import { addToOrCreateCart } from '~/lib/cart';
import { MissingCartError } from '~/lib/cart/error';

interface State {
  lastResult: SubmissionResult | null;
  successMessage?: React.ReactNode;
  errorMessage?: string;
}

const schema = z.object({
  productId: z.number(),
  variantId: z.number().optional(),
});

export async function addWishlistItemToCart(prevState: State, formData: FormData): Promise<State> {
  const t = await getTranslations('Product.ProductDetails');
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return { lastResult: submission.reply() };
  }

  try {
    const { productId, variantId } = schema.parse(submission.value);
    const quantity = 1;

    await addToOrCreateCart({
      lineItems: [
        {
          productEntityId: productId,
          variantEntityId: variantId,
          quantity,
        },
      ],
    });

    return {
      lastResult: submission.reply(),
      successMessage: t.rich('successMessage', {
        cartItems: quantity,
        cartLink: (chunks) => (
          <Link className="underline" href="/cart" prefetch="viewport" prefetchKind="full">
            {chunks}
          </Link>
        ),
      }),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof MissingCartError) {
      return {
        ...prevState,
        lastResult: { status: 'error' },
        errorMessage: t('missingCart'),
      };
    }

    if (error instanceof BigCommerceGQLError) {
      return {
        ...prevState,
        lastResult: { status: 'error' },
        errorMessage: error.message.includes('variant ID is required')
          ? t('variantRequiredError')
          : t('unknownError'),
      };
    }

    if (error instanceof BigCommerceAPIError) {
      return {
        ...prevState,
        lastResult: { status: 'error' },
        errorMessage: t('unknownError'),
      };
    }

    return {
      ...prevState,
      lastResult: { status: 'error' },
      errorMessage: t('unknownError'),
    };
  }
}
