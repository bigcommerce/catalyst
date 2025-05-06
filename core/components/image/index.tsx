'use client';

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import NextImage, { ImageProps } from 'next/image';

import { buildConfig } from '~/build-config/reader';
import bcCdnImageLoader from '~/lib/cdn-image-loader';

function shouldUseLoaderProp(props: ImageProps): boolean {
  const domain = buildConfig.get('urls').cdnUrl.replace(/\./g, '\\.'); // Escape dots
  const regex = new RegExp(`^https://([a-zA-Z0-9-]+\\.)*${domain}`); // Allows exact match or subdomains

  return typeof props.src === 'string' && regex.test(props.src);
}

/**
 * This component should be used in place of Next's `Image` component for images from the
 * BigCommerce platform, which will reduce load on the Next.js application for image assets.
 *
 * It defaults to use the default loader in Next.js if it's an image not from the BigCommerce CDN.
 *
 * @returns {React.ReactElement} The `<Image>` component
 */
export const Image = ({ ...props }: ImageProps) => {
  const loader = shouldUseLoaderProp(props) ? bcCdnImageLoader : undefined;

  return <NextImage loader={loader} {...props} />;
};
