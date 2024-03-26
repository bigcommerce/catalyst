'use client';

import Image from 'next/image';
import { ComponentPropsWithRef } from 'react';

import bcCdnImageLoader from '~/lib/cdn-image-loader';

type NextImageProps = Omit<ComponentPropsWithRef<typeof Image>, 'quality'>;

interface BcImageOptions {
  lossy?: boolean;
}

type Props = NextImageProps & BcImageOptions;

/**
 * This `<BcImage>` component is a wrapper for Next's `<Image>` component, designed to
 * specifically handle images that are served from the BigCommerce CDN. It makes the
 * assumption that it has been supplied with a `urlTemplate` field from GraphQL, which
 *  contains a `{:size}` placeholder that will be replaced with the appropriate width
 * and height values. It also adds a `compression` query parameter based on the `lossy`
 * prop, which defaults to `true`.
 *
 * This component can be used in place of Next's `Image` component for images from the
 * BigCommerce platform, which will reduce load on the Next.js application for image assets.
 *
 * This has been forked from the `Image` component to ensure the developer experience of
 * `Image` is unaffected for other use cases.
 *
 * @returns {React.ReactElement} The `<BcImage>` component
 */
export const BcImage = ({ ...props }: Props) => {
  return <Image loader={bcCdnImageLoader} {...props} />;
};
