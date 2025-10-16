'use client';

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import NextImage, { ImageProps } from 'next/image';
import { useRef } from 'react';

import { buildConfig } from '~/build-config/reader';
import bcCdnImageLoader from '~/lib/cdn-image-loader';
import { generateLQIP, generateSrcSet } from '~/lib/generate-srcset';

interface ExtendedImageProps extends ImageProps {
  useLazySizes?: boolean;
}

function shouldUseLoaderProp(props: ImageProps): boolean {
  if (typeof props.src !== 'string') return false;

  const { src } = props;

  return buildConfig.get('urls').cdnUrls.some((cdn) => src.startsWith(`https://${cdn}`));
}

function isCdnTemplateUrl(src: unknown): src is string {
  return typeof src === 'string' && src.includes('{:size}');
}

/**
 * This component should be used in place of Next's `Image` component for images from the
 * BigCommerce platform, which will reduce load on the Next.js application for image assets.
 *
 * It defaults to use the default loader in Next.js if it's an image not from the BigCommerce CDN.
 *
 * @param {ExtendedImageProps} props - Image props with optional useLazySizes flag
 * @returns {React.ReactElement} The `<Image>` component
 */
export const Image = ({ useLazySizes = true, ...props }: ExtendedImageProps) => {
  const imgRef = useRef<HTMLImageElement>(null);

  // If useLazySizes is enabled and src is a template URL, use native img with lazysizes
  if (useLazySizes && isCdnTemplateUrl(props.src)) {
    const templateUrl = props.src;
    const lqipSrc = generateLQIP(templateUrl);
    const srcSet = generateSrcSet(templateUrl);

    return (
      <img
        ref={imgRef}
        src={lqipSrc}
        data-srcset={srcSet}
        data-sizes="auto"
        className={`lazyload ${props.className ?? ''}`}
        alt={props.alt}
        style={{
          width: props.width ? `${props.width}px` : undefined,
          height: props.height ? `${props.height}px` : undefined,
          ...props.style,
        }}
        suppressHydrationWarning
      />
    );
  }

  // Default behavior: use Next.js Image with loader
  const loader = shouldUseLoaderProp(props) ? bcCdnImageLoader : undefined;

  return <NextImage loader={loader} {...props} />;
};
