'use client';

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import NextImage, { ImageProps } from 'next/image';
import { useEffect, useState } from 'react';

import { buildConfig } from '~/build-config/reader';
import bcCdnImageLoader, { getBcLqipData, getBcLqipUrl, hydrateLqipCache } from '~/lib/cdn-image-loader';

function shouldUseLoaderProp(props: ImageProps): boolean {
  return (
    typeof props.src === 'string' &&
    props.src.startsWith(`https://${buildConfig.get('urls').cdnUrl}`)
  );
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
  const [blurDataURL, setBlurDataURL] = useState<string | undefined>(props.blurDataURL);
  const isBcCdnImage = shouldUseLoaderProp(props);
  const loader = isBcCdnImage ? bcCdnImageLoader : undefined;

  useEffect(() => {
    if (isBcCdnImage && typeof props.src === 'string' && !blurDataURL) {
      const lqipUrl = getBcLqipUrl(props.src);
      hydrateLqipCache(lqipUrl);
    }
  }, [isBcCdnImage, props.src, blurDataURL]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchBlurData = async () => {
      if (isBcCdnImage && typeof props.src === 'string' && !blurDataURL) {
        try {
          const data = await getBcLqipData(props.src);
          if (isMounted && data) {
            setBlurDataURL(data);
          }
        } catch (error) {
          console.error('Failed to fetch LQIP data:', error);
        }
      }
    };

    fetchBlurData();
    
    return () => {
      isMounted = false;
    };
  }, [isBcCdnImage, props.src, blurDataURL]);

  const imageProps: ImageProps = {
    ...props,
    loader,
    placeholder: blurDataURL ? 'blur' : props.placeholder,
    blurDataURL: blurDataURL || props.blurDataURL,
  };

  return <NextImage {...imageProps} />;
};
