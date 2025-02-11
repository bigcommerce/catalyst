'use client';

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import NextImage, { ImageProps } from 'next/image';

import bcCdnImageLoader from '~/lib/cdn-image-loader';

const cdnHostname = process.env.NEXT_PUBLIC_BIGCOMMERCE_CDN_HOSTNAME ?? 'cdn11.bigcommerce.com';

function shouldUseLoaderProp(props: ImageProps): boolean {
  return typeof props.src === 'string' && props.src.startsWith(`https://${cdnHostname}`);
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
