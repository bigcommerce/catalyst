'use server';

import { updateTag } from 'next/cache';

import { TAGS } from '~/client/tags';

// eslint-disable-next-line @typescript-eslint/require-await
export const revalidateCart = async () => updateTag(TAGS.cart);
