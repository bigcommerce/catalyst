import { NextRequest, NextResponse } from 'next/server';

import client from '../client';

import { type MiddlewareFactory } from './compose-middlewares';

const createRewriteUrl = (request: NextRequest, path: string, search?: string) => {
  const url = new URL(path, request.url);

  url.search = search || request.nextUrl.search;

  return url;
};
const getProductOptionIdsByLabel = (
  optionName: string,
  optionLabel: string,
  productOptions: NonNullable<Awaited<ReturnType<typeof client.getProduct>>>['productOptions'],
) => {
  return (productOptions ?? []).flatMap((option) => {
    const matchedIds = [];

    if (optionName === option.displayName) {
      matchedIds.push(option.entityId);

      if (option.__typename === 'MultipleChoiceOption') {
        option.values.forEach(({ label, entityId }) => {
          if (label === optionLabel) {
            return matchedIds.push(entityId);
          }
        });
      }
    }

    return matchedIds;
  });
};

export const withCustomUrls: MiddlewareFactory = (next) => {
  return async (request, event) => {
    const requestParams = new URLSearchParams(request.nextUrl.search);
    const paramsWithIds = new URLSearchParams('');
    const search = requestParams.size > 0 ? `&search=hasSearchParams` : '';

    const response = await fetch(
      new URL(`/api/route?path=${request.nextUrl.pathname}${search}`, request.url),
      {
        headers: {
          'x-internal-token': process.env.BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN ?? '',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`BigCommerce API returned ${response.status}`);
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const node = (await response.json()) as Awaited<ReturnType<typeof client.getRoute>>;

    switch (node?.__typename) {
      case 'Brand': {
        const url = createRewriteUrl(request, `/brand/${node.entityId}`);

        return NextResponse.rewrite(url);
      }

      case 'Category': {
        const url = createRewriteUrl(request, `/category/${node.entityId}`);

        return NextResponse.rewrite(url);
      }

      case 'Product': {
        let url: URL;

        if (search.length > 0 && node.productOptions) {
          [...requestParams.entries()].forEach(([optionName, optionLabel]) => {
            const [optionEntityId, valueEntityId] = getProductOptionIdsByLabel(
              optionName,
              optionLabel,
              node.productOptions,
            );

            if (optionEntityId && valueEntityId) {
              paramsWithIds.set(optionEntityId.toString(), valueEntityId.toString());
            }
          });

          url = createRewriteUrl(request, `/product/${node.entityId}`, paramsWithIds.toString());
        } else {
          url = createRewriteUrl(request, `/product/${node.entityId}`);
        }

        return NextResponse.rewrite(url);
      }

      default:
        return next(request, event);
    }
  };
};
