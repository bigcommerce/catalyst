'use server';

import { revalidateTag } from 'next/cache';

import { TAGS } from '~/client/tags';

// eslint-disable-next-line @typescript-eslint/require-await
export const revalidateCart = async () => revalidateTag(TAGS.cart);
